// ============================================================================
// CRM EXPERT JUDICIAIRE - COMPOSANTS UI DE BASE
// Style Samsung One UI - Simple, Contrasté, Lisible
// ============================================================================

import React, { useState, useCallback, useRef } from 'react';
import { X, ChevronRight, Upload, FileUp, CheckCircle, AlertCircle, X as XIcon, File } from 'lucide-react';
import { DS } from '../../data';

// ============================================================================
// CARD - Style Samsung (bordures légères, coins arrondis modérés)
// ============================================================================

export const Card = ({
  children,
  className = '',
  variant = 'default', // default, outlined, filled
  premium = false,
  onClick = null,
  hover = true,
  ...props
}) => {
  const variants = {
    default: `bg-white border border-[#e0e0e0] ${hover && onClick ? 'hover:bg-[#f7f7f7] active:bg-[#f0f0f0]' : ''}`,
    outlined: 'bg-white border-2 border-[#e0e0e0]',
    filled: 'bg-[#f7f7f7] border border-[#e0e0e0]',
    elevated: `bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${hover && onClick ? 'hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]' : ''}`
  };

  const premiumStyle = premium
    ? 'border-[#2563EB] border-2 bg-[#EFF6FF]'
    : '';

  const clickableClasses = onClick ? 'cursor-pointer transition-all duration-200' : '';

  return (
    <div
      className={`
        rounded-2xl
        ${variants[variant]}
        ${premiumStyle}
        ${clickableClasses}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// LIST ITEM - Style Samsung (séparateurs, chevrons, espacement généreux)
// ============================================================================

export const ListItem = ({
  children,
  icon: Icon,
  title,
  subtitle,
  value,
  onClick,
  showChevron = true,
  divider = true,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 px-5 py-4 bg-white
        ${onClick ? 'cursor-pointer hover:bg-[#f7f7f7] active:bg-[#f0f0f0]' : ''}
        ${divider ? 'border-b border-[#f0f0f0]' : ''}
        transition-colors duration-150
        ${className}
      `}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-[#f7f7f7] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#555555]" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {title && <div className="text-[15px] font-medium text-[#1f1f1f] truncate">{title}</div>}
        {subtitle && <div className="text-[13px] text-[#757575] mt-0.5 truncate">{subtitle}</div>}
        {children}
      </div>

      {value && <div className="text-[14px] text-[#757575] flex-shrink-0">{value}</div>}

      {onClick && showChevron && (
        <ChevronRight className="w-5 h-5 text-[#ababab] flex-shrink-0" />
      )}
    </div>
  );
};

// ============================================================================
// LIST GROUP - Style Samsung (titre de section, fond groupé)
// ============================================================================

export const ListGroup = ({
  children,
  title,
  className = ''
}) => {
  return (
    <div className={className}>
      {title && (
        <div className="px-5 py-3 text-[13px] font-medium text-[#757575] uppercase tracking-wide">
          {title}
        </div>
      )}
      <div className="bg-white rounded-2xl border border-[#e0e0e0] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// BADGE - Style Samsung (couleurs vives, contraste élevé)
// ============================================================================

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-[#f0f0f0] text-[#555555]',
    primary: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#3B82F6]',
    gold: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#3B82F6]',
    success: 'bg-[#ECFDF5] text-[#047857] border border-[#059669]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#D97706]',
    error: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#DC2626]',
    info: 'bg-[#ECFEFF] text-[#0E7490] border border-[#0891B2]',
    purple: 'bg-[#f3e8ff] text-[#7c3aed] border border-[#a855f7]',
    accent: 'bg-[#FDF8E8] text-[#7A5A07] border border-[#B8860B]'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-[12px]',
    lg: 'px-4 py-1.5 text-[13px]'
  };

  return (
    <span className={`
      inline-flex items-center font-semibold rounded-full
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};

// ============================================================================
// BUTTON - Style Samsung (rectangulaire arrondi, pas pilule)
// ============================================================================

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon = null,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: `bg-[#2563EB] text-white font-semibold
              hover:bg-[#1D4ED8] active:bg-[#1E40AF]
              disabled:bg-[#e4e4e4] disabled:text-[#ababab]`,
    secondary: `bg-white border-2 border-[#e0e0e0] text-[#1f1f1f] font-medium
                hover:bg-[#f7f7f7] active:bg-[#f0f0f0]
                disabled:bg-[#f7f7f7] disabled:text-[#ababab] disabled:border-[#e4e4e4]`,
    samsung: `bg-[#0381fe] text-white font-semibold
              hover:bg-[#0070e0] active:bg-[#005bc4]
              disabled:bg-[#e4e4e4] disabled:text-[#ababab]`,
    ghost: `bg-transparent text-[#555555] font-medium
            hover:bg-[#f0f0f0] active:bg-[#e4e4e4]`,
    danger: `bg-[#DC2626] text-white font-semibold
             hover:bg-[#B91C1C] active:bg-[#991B1B]`,
    text: `bg-transparent text-[#2563EB] font-semibold
           hover:bg-[#EFF6FF] active:bg-[#DBEAFE]`,
    accent: `bg-[#B8860B] text-white font-semibold
             hover:bg-[#9A7209] active:bg-[#7A5A07]`
  };

  const sizes = {
    sm: 'px-4 py-2 text-[13px] gap-1.5 rounded-lg',
    md: 'px-5 py-3 text-[14px] gap-2 rounded-xl',
    lg: 'px-6 py-4 text-[15px] gap-2 rounded-xl'
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !loading && <Icon className="w-5 h-5" />}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className="w-5 h-5" />}
    </button>
  );
};

// ============================================================================
// INPUT - Style Samsung (bordure visible, focus bleu Samsung)
// ============================================================================

export const Input = ({
  label,
  error,
  helper,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="text-[14px] font-semibold text-[#1f1f1f] block mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ababab]" />
        )}
        <input
          className={`
            w-full px-4 py-3.5 bg-white border-2 rounded-xl transition-all duration-200
            text-[15px] text-[#1f1f1f] placeholder-[#ababab]
            focus:outline-none focus:border-[#0381fe] focus:bg-white
            ${Icon ? 'pl-12' : ''}
            ${error
              ? 'border-[#ff3b30] focus:border-[#ff3b30]'
              : 'border-[#e0e0e0] hover:border-[#d1d1d1]'
            }
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-[13px] text-[#ff3b30] font-medium">{error}</p>}
      {helper && !error && <p className="mt-2 text-[13px] text-[#757575]">{helper}</p>}
    </div>
  );
};

// ============================================================================
// SELECT - Style Samsung
// ============================================================================

export const Select = ({
  label,
  options = [],
  error,
  helper,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="text-[14px] font-semibold text-[#1f1f1f] block mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3.5 bg-white border-2 rounded-xl transition-all duration-200
          text-[15px] text-[#1f1f1f] appearance-none cursor-pointer
          focus:outline-none focus:border-[#0381fe]
          ${error
            ? 'border-[#ff3b30] focus:border-[#ff3b30]'
            : 'border-[#e0e0e0] hover:border-[#d1d1d1]'
          }
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23757575' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px'
        }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-2 text-[13px] text-[#ff3b30] font-medium">{error}</p>}
      {helper && !error && <p className="mt-2 text-[13px] text-[#757575]">{helper}</p>}
    </div>
  );
};

// ============================================================================
// TEXTAREA - Style Samsung
// ============================================================================

export const Textarea = ({
  label,
  error,
  helper,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="text-[14px] font-semibold text-[#1f1f1f] block mb-2">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-3.5 bg-white border-2 rounded-xl transition-all duration-200 resize-none
          text-[15px] text-[#1f1f1f] placeholder-[#ababab]
          focus:outline-none focus:border-[#0381fe]
          ${error
            ? 'border-[#ff3b30] focus:border-[#ff3b30]'
            : 'border-[#e0e0e0] hover:border-[#d1d1d1]'
          }
        `}
        {...props}
      />
      {error && <p className="mt-2 text-[13px] text-[#ff3b30] font-medium">{error}</p>}
      {helper && !error && <p className="mt-2 text-[13px] text-[#757575]">{helper}</p>}
    </div>
  );
};

// ============================================================================
// SWITCH - Style Samsung (toggle switch)
// ============================================================================

export const Switch = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`
          w-[52px] h-[32px] rounded-full transition-colors duration-200
          ${checked ? 'bg-[#2563EB]' : 'bg-[#e0e0e0]'}
        `}>
          <div className={`
            absolute top-1 w-[24px] h-[24px] bg-white rounded-full shadow-md
            transition-transform duration-200
            ${checked ? 'translate-x-[22px]' : 'translate-x-1'}
          `} />
        </div>
      </div>
      {label && <span className="text-[15px] text-[#1f1f1f]">{label}</span>}
    </label>
  );
};

// ============================================================================
// MODAL BASE - Style Samsung (coins arrondis, animation fluide)
// ============================================================================

export const ModalBase = ({
  children,
  onClose,
  title,
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[90vw]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className={`
        relative bg-white w-full ${sizes[size]} max-h-[90vh] overflow-hidden
        rounded-t-3xl sm:rounded-2xl
        shadow-[0_8px_24px_rgba(0,0,0,0.15)]
        animate-[slideUp_0.3s_ease-out]
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
          <h2 className="text-[18px] font-semibold text-[#1f1f1f]">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e4e4e4] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TABS - Style Samsung (segmented control ou underline)
// ============================================================================

export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline', // underline ou segmented
  className = ''
}) => {
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex bg-[#f0f0f0] rounded-xl p-1 ${className}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-5 py-2.5 text-[14px] font-medium rounded-lg transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white text-[#1f1f1f] shadow-sm'
                : 'text-[#757575] hover:text-[#1f1f1f]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex border-b-2 border-[#f0f0f0] ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-5 py-4 text-[14px] font-semibold transition-all relative
            ${activeTab === tab.id
              ? 'text-[#2563EB]'
              : 'text-[#757575] hover:text-[#1f1f1f]'
            }
          `}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2563EB] rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// PROGRESS BAR - Style Samsung (couleurs vives, contraste)
// ============================================================================

export const ProgressBar = ({
  value,
  max = 100,
  color = 'gold',
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    primary: 'bg-[#2563EB]',
    gold: 'bg-[#2563EB]',
    green: 'bg-[#059669]',
    red: 'bg-[#DC2626]',
    blue: 'bg-[#3B82F6]',
    orange: 'bg-[#D97706]',
    accent: 'bg-[#B8860B]'
  };

  const trackColors = {
    primary: 'bg-[#DBEAFE]',
    gold: 'bg-[#DBEAFE]',
    green: 'bg-[#D1FAE5]',
    red: 'bg-[#FEE2E2]',
    blue: 'bg-[#DBEAFE]',
    orange: 'bg-[#FEF3C7]',
    accent: 'bg-[#F5E6B3]'
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-[13px] font-semibold text-[#1f1f1f]">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${trackColors[color]} rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// TOOLTIP - Style Samsung
// ============================================================================

export const Tooltip = ({
  children,
  content,
  position = 'top'
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative group">
      {children}
      <div className={`
        absolute ${positions[position]} px-3 py-2 bg-[#1f1f1f] text-white text-[12px] font-medium rounded-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 whitespace-nowrap z-50
        shadow-lg
      `}>
        {content}
      </div>
    </div>
  );
};

// ============================================================================
// EMPTY STATE - Style Professionnel avec illustrations
// ============================================================================

export const EmptyState = ({
  icon: Icon,
  illustration: Illustration, // Composant illustration SVG optionnel
  illustrationSize = 100,
  title,
  description,
  action,
  actionLabel,
  variant = 'default', // default, success, info, search, error
  className = '',
  animated = true
}) => {
  const variants = {
    default: {
      iconBg: 'bg-[#F3F4F6]',
      iconColor: 'text-[#9CA3AF]'
    },
    success: {
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#059669]'
    },
    info: {
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]'
    },
    search: {
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]'
    },
    error: {
      iconBg: 'bg-[#FEF2F2]',
      iconColor: 'text-[#DC2626]'
    }
  };

  const config = variants[variant] || variants.default;

  return (
    <div className={`text-center py-12 px-6 ${animated ? 'animate-fade-in' : ''} ${className}`}>
      {/* Illustration SVG (priorité) ou icône */}
      {Illustration ? (
        <div className="mx-auto mb-6 animate-bounce-soft">
          <Illustration size={illustrationSize} />
        </div>
      ) : Icon && (
        <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 ${animated ? 'animate-scale-in' : ''}`}>
          <Icon className={`w-8 h-8 ${config.iconColor}`} />
        </div>
      )}

      {/* Titre */}
      <h3 className="text-lg font-medium text-[#111827] mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-[15px] text-[#6B7280] mb-5 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <Button
          variant="primary"
          onClick={action}
          className="hover-lift"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// LOADING SPINNER - Style Samsung
// ============================================================================

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg
        className="animate-spin"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="#e0e0e0"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          fill="none"
          stroke="#2563EB"
          strokeWidth="3"
          strokeLinecap="round"
          d="M12 2a10 10 0 0 1 10 10"
        />
      </svg>
    </div>
  );
};

// ============================================================================
// DIVIDER - Style Samsung
// ============================================================================

export const Divider = ({ className = '' }) => (
  <div className={`h-[1px] bg-[#f0f0f0] ${className}`} />
);

// ============================================================================
// SECTION HEADER - Style Samsung (titre de section avec action optionnelle)
// ============================================================================

export const SectionHeader = ({
  title,
  action,
  actionLabel,
  className = ''
}) => (
  <div className={`flex items-center justify-between px-5 py-3 ${className}`}>
    <h3 className="text-[13px] font-semibold text-[#757575] uppercase tracking-wide">{title}</h3>
    {action && (
      <button
        onClick={action}
        className="text-[13px] font-semibold text-[#0381fe] hover:text-[#0070e0]"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// ============================================================================
// DROPZONE - Zone de dépôt drag & drop avec animation
// ============================================================================

export const DropZone = ({
  onFilesDropped,
  accept = '*/*',
  multiple = true,
  maxSize = 20 * 1024 * 1024, // 20 Mo par défaut
  maxFiles = 10,
  label = 'Glissez vos fichiers ici',
  sublabel = 'ou cliquez pour parcourir',
  hint = '',
  className = '',
  compact = false,
  showPreview = true,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  // Valider un fichier
  const validateFile = useCallback((file) => {
    if (maxSize && file.size > maxSize) {
      return `${file.name} dépasse la taille max (${Math.round(maxSize / 1024 / 1024)} Mo)`;
    }
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        }
        return file.type === type;
      });
      if (!isAccepted) {
        return `${file.name} n'est pas un type de fichier accepté`;
      }
    }
    return null;
  }, [accept, maxSize]);

  // Traiter les fichiers déposés
  const processFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList);
    const validFiles = [];
    const newErrors = [];

    // Limite de fichiers
    const availableSlots = maxFiles - files.length;
    if (newFiles.length > availableSlots && multiple) {
      newErrors.push(`Maximum ${maxFiles} fichiers autorisés`);
    }

    const filesToProcess = multiple ? newFiles.slice(0, availableSlots) : [newFiles[0]];

    filesToProcess.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        // Ajouter preview pour les images
        if (file.type.startsWith('image/')) {
          file.preview = URL.createObjectURL(file);
        }
        validFiles.push(file);
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);
      onFilesDropped?.(updatedFiles);
    }
  }, [files, maxFiles, multiple, validateFile, onFilesDropped]);

  // Gestionnaires drag & drop
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (disabled) return;

    const { files: droppedFiles } = e.dataTransfer;
    if (droppedFiles?.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  // Supprimer un fichier
  const removeFile = useCallback((index) => {
    const newFiles = files.filter((_, i) => i !== index);
    // Révoquer URL preview
    if (files[index]?.preview) {
      URL.revokeObjectURL(files[index].preview);
    }
    setFiles(newFiles);
    onFilesDropped?.(newFiles);
  }, [files, onFilesDropped]);

  // Clic sur la zone
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Formatage taille fichier
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Zone de dépôt */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
          ${compact ? 'p-4' : 'p-8'}
          ${disabled
            ? 'border-[#e5e5e5] bg-[#f5f5f5] cursor-not-allowed opacity-60'
            : isDragging
              ? 'border-[#2563EB] bg-[#EFF6FF] scale-[1.02] shadow-lg shadow-[#2563EB]/20'
              : 'border-[#e5e5e5] hover:border-[#2563EB] hover:bg-[#FAFBFF]'
          }
        `}
      >
        {/* Animation de fond pendant le drag */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#EFF6FF] via-[#DBEAFE] to-[#EFF6FF] animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin opacity-30" />
            </div>
          </div>
        )}

        {/* Contenu */}
        <div className={`relative text-center ${isDragging ? 'opacity-80' : ''}`}>
          <div className={`
            mx-auto rounded-2xl flex items-center justify-center transition-all duration-300
            ${compact ? 'w-12 h-12 mb-2' : 'w-16 h-16 mb-4'}
            ${isDragging
              ? 'bg-[#2563EB] text-white scale-110'
              : 'bg-[#EFF6FF] text-[#2563EB]'
            }
          `}>
            {isDragging ? (
              <FileUp className={compact ? 'w-6 h-6' : 'w-8 h-8'} />
            ) : (
              <Upload className={compact ? 'w-6 h-6' : 'w-8 h-8'} />
            )}
          </div>

          <p className={`font-medium text-[#1a1a1a] ${compact ? 'text-sm' : 'text-base'}`}>
            {isDragging ? 'Déposez vos fichiers ici' : label}
          </p>

          {!isDragging && (
            <p className={`text-[#737373] mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
              {sublabel}
            </p>
          )}

          {hint && !compact && (
            <p className="text-xs text-[#a3a3a3] mt-2">{hint}</p>
          )}
        </div>

        {/* Input caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
          disabled={disabled}
        />
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Prévisualisation des fichiers */}
      {showPreview && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded-xl group animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Miniature ou icône */}
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <File className="w-5 h-5 text-[#737373]" />
                </div>
              )}

              {/* Infos fichier */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1a1a1a] truncate">{file.name}</p>
                <p className="text-xs text-[#737373]">{formatSize(file.size)}</p>
              </div>

              {/* Indicateur succès */}
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />

              {/* Bouton supprimer */}
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                className="p-1.5 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// INDEX EXPORT
// ============================================================================

export default {
  Card,
  ListItem,
  ListGroup,
  Badge,
  Button,
  Input,
  Select,
  Textarea,
  Switch,
  ModalBase,
  Tabs,
  ProgressBar,
  Tooltip,
  EmptyState,
  LoadingSpinner,
  Divider,
  SectionHeader,
  DropZone
};
