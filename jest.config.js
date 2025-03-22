module.exports = {
  // Utilisation du preset 'ts-jest' pour les tests avec TypeScript
  preset: 'ts-jest',

  // Configuration du transformateur pour gérer les fichiers TypeScript et JavaScript
  transform: {
    // Cette règle permet de transformer tous les fichiers .ts, .tsx et .js
    '^.+\\.(ts|tsx|js)$': ['ts-jest', {
      tsconfig: 'tsconfig.json', // Utilisation du fichier tsconfig.json pour la configuration TypeScript
    }],
  },

  // Définition de l'environnement de test comme étant Node.js
  testEnvironment: 'node',

  // Extensions de fichier que Jest doit traiter. Ici, on inclut .ts, .tsx, .js et .jsx
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Configuration des rapports de couverture de code
  collectCoverage: true,

  // Définition des formats de rapports de couverture
  coverageReporters: ['html', 'text'],

  // Spécification du répertoire où seront stockés les rapports de couverture
  coverageDirectory: 'coverage',
};