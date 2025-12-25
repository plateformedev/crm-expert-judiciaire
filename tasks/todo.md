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

### 2.4 Améliorer les listes d'affaires
- [ ] Style épuré : Référence + Ville + Montant
- [ ] Limiter à 4-5 items avec "Voir toutes"
- [ ] Icônes de statut colorées

---

## PRIORITÉ 3 - Refonte (Plus tard)
- [ ] Zone de dépôt drag & drop visuel
- [ ] Micro-interactions et transitions fluides
- [ ] Illustrations personnalisées pour états vides

---

## Review
*À compléter après implémentation*

