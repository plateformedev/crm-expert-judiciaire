# Améliorations UX Pennylane - Plan de développement

## Objectif
Implémenter les améliorations UX inspirées de Pennylane pour rendre le CRM plus intuitif et agréable.

---

## PRIORITÉ 1 - Quick Wins (FAIT)
- [x] Améliorer le message de bienvenue (chaleureux + emoji + contexte actions)
- [x] Agrandir les chiffres clés KPI (48px) + flèches tendances
- [x] Améliorer les états vides avec illustrations
- [x] Corriger l'affichage des heures (2h30 au lieu de 2.50)

---

## PRIORITÉ 2 - Impact Moyen

### 2.1 Menu latéral repliable ✅
- [x] ~~Modifier Sidebar.jsx pour ajouter un état collapsed/expanded~~ (déjà existant)
- [x] Afficher icônes seules quand replié, texte au survol (ajout title)
- [x] Sauvegarder la préférence dans localStorage

### 2.2 Panneau notifications latéral droit ✅
- [x] Créer composant NotificationsPanel.jsx
- [x] 3 onglets : À faire | Alertes | Historique
- [x] Message positif quand tout est fait ("🎉 Vous êtes à jour !")

### 2.3 Améliorer la recherche globale ✅
- [x] ~~Ajouter raccourci clavier Ctrl+K~~ (déjà existant)
- [x] Afficher le raccourci ⌘K visuellement dans la barre
- [ ] Catégoriser les résultats (reporté - complexe)

### 2.4 Améliorer les listes d'affaires ✅
- [x] Style épuré : Référence + Ville + Montant
- [x] Limiter à 4 items avec "Voir toutes les affaires →"
- [x] Indicateurs de statut colorés (🔴🟡🟢🔵)

---

## PRIORITÉ 3 - Refonte (Plus tard)
- [ ] Zone de dépôt drag & drop visuel
- [ ] Micro-interactions et transitions fluides
- [ ] Illustrations personnalisées pour états vides

---

## Review

### Résumé des modifications (Priorité 2)

| Tâche | Fichiers modifiés | Changement |
|-------|-------------------|------------|
| 2.1 Menu repliable | `Sidebar.jsx`, `App.jsx` | Tooltip + localStorage |
| 2.2 Notifications | `NotificationsPanel.jsx`, `Header.jsx` | Nouveau panneau 3 onglets |
| 2.3 Recherche | `Header.jsx` | Badge ⌘K visible |
| 2.4 Listes | `dashboard/index.jsx` | Style épuré + indicateurs couleur |

### Principes respectés
- ✅ Changements minimaux et simples
- ✅ Impact limité sur le code existant
- ✅ Pas de régression (build OK)
- ✅ Style cohérent avec l'existant

---

## CORRECTION BUGS CRITIQUES

### Analyse

#### Bug 1 : Heures décimales dans Statistiques
- **Symptôme** : Affiche "4.45999999999999" au lieu de "4.46"
- **Fichier** : `src/components/pages/PageStatistiques.jsx`, ligne 412
- **Cause** : Somme de flottants sans arrondi → erreur de précision JavaScript
- **Fix** : Arrondir `totalHeures` à 2 décimales

#### Bug 2 : Modale OPALEXE intempestive
- **Symptôme** : Modale s'ouvre automatiquement sur certains onglets
- **Statut** : ⚠️ Non reproductible - besoin étapes exactes
- **Note** : Aucun useEffect trouvé qui déclenche une modale au changement d'onglet

#### Bug 3 : Carnet d'adresses en chargement infini
- **Symptôme** : Spinner tourne indéfiniment
- **Fichier** : `src/components/sapiteurs/index.jsx` + `src/App.jsx`
- **Cause** : `CarnetSapiteurs` appelé sans `expertId` → le hook ne fetch jamais, `loading=true` pour toujours
- **Fix** : Gérer le cas sans expertId (terminer loading + liste vide/démo)

---

### Plan de correction

- [x] Bug 1 : Arrondir totalHeures (1 ligne)
- [x] Bug 3 : Gérer expertId manquant dans useSapiteurs
- [ ] Bug 2 : Investiguer si reproductible (besoin étapes)

---

### Review Bugs
| Bug | Statut | Fichier | Fix |
|-----|--------|---------|-----|
| Heures décimales | ✅ | `PageStatistiques.jsx` | `Math.round(x * 100) / 100` |
| Carnet chargement | ✅ | `sapiteurs/index.jsx` | `setLoading(false)` si pas d'expertId |
| Modale OPALEXE | 🔍 | - | Besoin reproduction |

---

## AMÉLIORATION TABLEAU DES AFFAIRES (9.4)

### État actuel
Le tableau a déjà :
- ✅ Filtres complets (9 critères)
- ✅ Recherche texte
- ✅ Stats rapides
- ✅ 12 colonnes (Référence, RG, Tribunal, Ville, Statut, Échéance, Progress., Parties, Réunions, Désordres, Provision, Actions)

### Améliorations prévues

- [x] 9.4.1 Tri par colonnes (clic sur en-tête = tri ASC/DESC)
- [x] 9.4.2 Sauvegarde filtres dans localStorage
- [x] 9.4.3 Export CSV des affaires filtrées

### Détails techniques

#### 9.4.1 Tri par colonnes ✅
- État `sortConfig = { key, direction }` ajouté
- Fonction `handleSort(key)` toggle ASC/DESC
- Icônes ↑↓ sur les 11 colonnes triables
- `affairesTriees` = tri de `affairesFiltrees`

#### 9.4.2 Sauvegarde filtres ✅
- Initialisation depuis `localStorage.getItem('affaires_filters')`
- `useEffect` sauvegarde à chaque modification

#### 9.4.3 Export CSV ✅
- Bouton "Export CSV" ajouté dans la barre d'outils
- Génère CSV avec 10 colonnes (séparateur `;`)
- Téléchargement automatique `affaires_YYYY-MM-DD.csv`

---

### Review Tableau
| Amélioration | Statut | Fichier |
|--------------|--------|---------|
| Tri colonnes | ✅ | `affaires/index.jsx` |
| Sauvegarde filtres | ✅ | `affaires/index.jsx` |
| Export CSV | ✅ | `affaires/index.jsx` |

---

## TIME TRACKING INTÉGRÉ (5.2)

### État actuel
Il existe déjà :
- ✅ `useAutoTimer` - Timer automatique qui démarre en consultant une affaire
- ✅ `Chronometre` - Composant manuel dans /outils
- ✅ `useTimer` - Hook basique

### Améliorations prévues

- [x] 5.2.1 Widget timer flottant visible sur page affaire
- [x] 5.2.2 Bouton Play/Pause pour contrôle manuel
- [x] 5.2.3 Affichage temps session + temps total affaire

### Détails techniques

#### 5.2.1 Widget timer flottant ✅
- Créer `TimerWidget.jsx` - petit widget compact
- Position fixe en bas à droite de la page affaire
- Affiche : temps session, bouton play/pause, montant estimé

#### 5.2.2 Contrôle manuel ✅
- Hook `useControllableTimer` avec toggle play/pause
- Auto-save du temps à la fermeture (si > 10 secondes)
- État visible : pastille verte (actif) ou grise (pause)

#### 5.2.3 Affichage temps ✅
- Session actuelle : `00:12:34`
- Total affaire : `2h 45min`
- Montant estimé : `247.50 €`

---

### Review Time Tracking
| Amélioration | Statut | Fichier |
|--------------|--------|---------|
| Widget timer flottant | ✅ | `affaires/TimerWidget.jsx` |
| Hook controllable | ✅ | `affaires/TimerWidget.jsx` |
| Intégration FicheAffaire | ✅ | `affaires/index.jsx` |

