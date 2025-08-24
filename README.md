# Calculateur de coûts BTP

Application web one-page permettant de suivre les coûts de main d'œuvre et de matériaux par chantier.

## Utilisation

1. Ouvrez `index.html` dans votre navigateur.
2. Ajoutez un chantier puis renseignez les salariés et les matériaux associés.
3. Les coûts sont calculés automatiquement (salaire net → brut → charges → coût employeur).
4. Chaque chantier affiche un récapitulatif détaillé avec possibilité d'export PDF ou CSV.
5. Les données sont conservées temporairement dans le `localStorage` du navigateur.

## Développement

Installez les dépendances puis lancez les tests :

```bash
npm install
npm test
```

Le script de test actuel affiche simplement un message et retourne un code de succès.
