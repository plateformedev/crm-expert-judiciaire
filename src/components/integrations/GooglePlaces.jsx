// ============================================================================
// CRM EXPERT JUDICIAIRE - INTÉGRATION GOOGLE PLACES
// Autocomplete adresses + Liens Google Maps
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Navigation, ExternalLink, Loader2, Search, X } from 'lucide-react';

// ============================================================================
// CONFIGURATION
// ============================================================================

// La clé API Google doit être configurée dans les variables d'environnement
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Options pour l'autocomplete (France prioritaire)
const AUTOCOMPLETE_OPTIONS = {
  types: ['address'],
  componentRestrictions: { country: 'fr' },
  fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
};

// ============================================================================
// HOOK GOOGLE PLACES AUTOCOMPLETE
// ============================================================================

export const useGooglePlaces = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Vérifier si déjà chargé
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Ne pas charger si pas de clé API
    if (!GOOGLE_API_KEY) {
      console.warn('[GooglePlaces] Clé API non configurée. Mode dégradé activé.');
      return;
    }

    // Charger le script Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&language=fr`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
      console.log('[GooglePlaces] API chargée avec succès');
    };

    script.onerror = () => {
      setLoadError(new Error('Impossible de charger Google Maps'));
      console.error('[GooglePlaces] Erreur de chargement');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup si nécessaire
    };
  }, []);

  return { isLoaded, loadError, apiKey: GOOGLE_API_KEY };
};

// ============================================================================
// COMPOSANT ADRESSE AUTOCOMPLETE
// ============================================================================

export const AdresseAutocomplete = ({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Saisissez une adresse...',
  label = 'Adresse',
  required = false,
  disabled = false,
  className = ''
}) => {
  const { isLoaded, apiKey } = useGooglePlaces();
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const inputRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const debounceTimer = useRef(null);

  // Sync value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Initialiser les services Google
  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      // PlacesService nécessite un élément DOM (peut être caché)
      const dummyDiv = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
    }
  }, [isLoaded]);

  // Recherche d'adresses avec debounce
  const searchAddresses = useCallback((query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Mode dégradé sans API
    if (!autocompleteService.current) {
      // Utiliser API Adresse du gouvernement français (gratuite)
      fetchAddressesFromGouv(query);
      return;
    }

    setLoading(true);
    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        ...AUTOCOMPLETE_OPTIONS
      },
      (predictions, status) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map(p => ({
            id: p.place_id,
            label: p.description,
            main: p.structured_formatting?.main_text || p.description,
            secondary: p.structured_formatting?.secondary_text || ''
          })));
          setIsOpen(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  // Fallback API Adresse gouvernement français (gratuite, sans clé)
  const fetchAddressesFromGouv = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();

      if (data.features) {
        setSuggestions(data.features.map(f => ({
          id: f.properties.id,
          label: f.properties.label,
          main: f.properties.name,
          secondary: `${f.properties.postcode} ${f.properties.city}`,
          coordinates: f.geometry.coordinates,
          properties: f.properties
        })));
        setIsOpen(true);
      }
    } catch (error) {
      console.error('[AdresseAutocomplete] Erreur API Gouv:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce de la recherche
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  // Sélection d'une adresse
  const handleSelect = (suggestion) => {
    setInputValue(suggestion.label);
    onChange?.(suggestion.label);
    setIsOpen(false);
    setSuggestions([]);

    // Récupérer les détails (coordonnées, composants)
    if (placesService.current && suggestion.id && !suggestion.properties) {
      placesService.current.getDetails(
        { placeId: suggestion.id, fields: AUTOCOMPLETE_OPTIONS.fields },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const addressData = parseGooglePlace(place);
            onSelect?.(addressData);
          }
        }
      );
    } else if (suggestion.properties) {
      // Données API Gouv
      onSelect?.({
        formatted: suggestion.label,
        rue: suggestion.properties.name,
        codePostal: suggestion.properties.postcode,
        ville: suggestion.properties.city,
        pays: 'France',
        coordinates: {
          lat: suggestion.coordinates[1],
          lng: suggestion.coordinates[0]
        }
      });
    }
  };

  // Navigation clavier
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0) {
          handleSelect(suggestions[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full pl-10 pr-10 py-3 border border-[#e5e5e5] rounded-xl
                     focus:outline-none focus:border-[#2563EB] transition-colors
                     disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2563EB] animate-spin" />
        )}
        {inputValue && !loading && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              onChange?.('');
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f5f5f5] rounded"
          >
            <X className="w-4 h-4 text-[#a3a3a3]" />
          </button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-[#fafafa]
                         border-b border-[#f5f5f5] last:border-0 transition-colors
                         ${index === highlightIndex ? 'bg-[#fafafa]' : ''}`}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#2563EB] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-[#1a1a1a]">{suggestion.main}</div>
                  {suggestion.secondary && (
                    <div className="text-sm text-[#737373]">{suggestion.secondary}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Indication API utilisée */}
      {!apiKey && (
        <div className="mt-1 text-xs text-[#a3a3a3] flex items-center gap-1">
          <Search className="w-3 h-3" />
          Recherche via API Adresse France
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HELPER - PARSER GOOGLE PLACE
// ============================================================================

const parseGooglePlace = (place) => {
  const components = place.address_components || [];

  const getComponent = (types) => {
    const component = components.find(c =>
      types.some(t => c.types.includes(t))
    );
    return component?.long_name || '';
  };

  return {
    formatted: place.formatted_address,
    numero: getComponent(['street_number']),
    rue: getComponent(['route']),
    codePostal: getComponent(['postal_code']),
    ville: getComponent(['locality', 'administrative_area_level_2']),
    departement: getComponent(['administrative_area_level_2']),
    region: getComponent(['administrative_area_level_1']),
    pays: getComponent(['country']),
    placeId: place.place_id,
    coordinates: place.geometry?.location ? {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    } : null
  };
};

// ============================================================================
// COMPOSANT LIEN GOOGLE MAPS
// ============================================================================

export const LienGoogleMaps = ({
  adresse,
  coordinates,
  className = '',
  variant = 'link', // 'link', 'button', 'icon'
  size = 'md',
  showIcon = true,
  children
}) => {
  if (!adresse && !coordinates) return null;

  // Construire l'URL Google Maps
  let mapsUrl;
  if (coordinates?.lat && coordinates?.lng) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  } else {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`;
  }

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (variant === 'icon') {
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center p-2 rounded-lg
                   hover:bg-[#f5f5f5] text-[#0381fe] transition-colors ${className}`}
        title="Ouvrir dans Google Maps"
      >
        <Navigation className={iconSizes[size]} />
      </a>
    );
  }

  if (variant === 'button') {
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center px-4 py-2
                   bg-[#0381fe] hover:bg-[#0070e0] text-white rounded-xl
                   transition-colors ${sizeClasses[size]} ${className}`}
      >
        {showIcon && <Navigation className={iconSizes[size]} />}
        {children || 'Voir sur Maps'}
        <ExternalLink className={`${iconSizes[size]} opacity-70`} />
      </a>
    );
  }

  // Default: link
  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center text-[#0381fe] hover:text-[#0070e0]
                 hover:underline transition-colors ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <MapPin className={iconSizes[size]} />}
      <span className="truncate">{children || adresse}</span>
      <ExternalLink className={`${iconSizes[size]} opacity-50 flex-shrink-0`} />
    </a>
  );
};

// ============================================================================
// COMPOSANT ADRESSE CLIQUABLE (affichage avec lien Maps)
// ============================================================================

export const AdresseCliquable = ({
  adresse,
  codePostal,
  ville,
  coordinates,
  className = '',
  multiline = true
}) => {
  const fullAddress = [adresse, [codePostal, ville].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(multiline ? '\n' : ', ');

  if (!fullAddress) return null;

  return (
    <div className={`group ${className}`}>
      <LienGoogleMaps
        adresse={fullAddress}
        coordinates={coordinates}
        variant="link"
      >
        {multiline ? (
          <div className="flex flex-col">
            {adresse && <span>{adresse}</span>}
            {(codePostal || ville) && (
              <span className="text-[#737373]">
                {[codePostal, ville].filter(Boolean).join(' ')}
              </span>
            )}
          </div>
        ) : (
          fullAddress
        )}
      </LienGoogleMaps>
    </div>
  );
};

// ============================================================================
// COMPOSANT FORMULAIRE ADRESSE COMPLET
// ============================================================================

export const FormulaireAdresse = ({
  value = {},
  onChange,
  showMapsLink = true,
  required = false,
  disabled = false
}) => {
  const [localValue, setLocalValue] = useState({
    adresse: '',
    codePostal: '',
    ville: '',
    coordinates: null,
    ...value
  });

  useEffect(() => {
    setLocalValue(prev => ({ ...prev, ...value }));
  }, [value]);

  const handleAddressSelect = (addressData) => {
    const newValue = {
      adresse: addressData.rue ? `${addressData.numero || ''} ${addressData.rue}`.trim() : addressData.formatted,
      codePostal: addressData.codePostal || '',
      ville: addressData.ville || '',
      coordinates: addressData.coordinates || null
    };
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleFieldChange = (field, fieldValue) => {
    const newValue = { ...localValue, [field]: fieldValue };
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const fullAddress = [
    localValue.adresse,
    [localValue.codePostal, localValue.ville].filter(Boolean).join(' ')
  ].filter(Boolean).join(', ');

  return (
    <div className="space-y-4">
      {/* Champ autocomplete principal */}
      <AdresseAutocomplete
        value={localValue.adresse}
        onChange={(val) => handleFieldChange('adresse', val)}
        onSelect={handleAddressSelect}
        label="Adresse"
        required={required}
        disabled={disabled}
      />

      {/* Code postal et ville */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Code postal
          </label>
          <input
            type="text"
            value={localValue.codePostal}
            onChange={(e) => handleFieldChange('codePostal', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl
                       focus:outline-none focus:border-[#2563EB]
                       disabled:bg-[#f5f5f5]"
            placeholder="75001"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Ville
          </label>
          <input
            type="text"
            value={localValue.ville}
            onChange={(e) => handleFieldChange('ville', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl
                       focus:outline-none focus:border-[#2563EB]
                       disabled:bg-[#f5f5f5]"
            placeholder="Paris"
          />
        </div>
      </div>

      {/* Lien Maps */}
      {showMapsLink && fullAddress && (
        <div className="flex items-center gap-2 text-sm">
          <LienGoogleMaps
            adresse={fullAddress}
            coordinates={localValue.coordinates}
            variant="button"
            size="sm"
          >
            Voir sur Google Maps
          </LienGoogleMaps>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default AdresseAutocomplete;
