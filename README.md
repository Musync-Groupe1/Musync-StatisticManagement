# 🚀 Guide des Bonnes Pratiques Git & GitFlow

## 📌 Branches principales

### `main`

- Contient le code **stable** en production.
- Ne jamais pousser directement dessus.
- Seules les **develop branche** et les **hotfixes** y sont mergées.

### `develop`

- Contient le dernier code **validé**.
- Toutes les nouvelles fonctionnalités partent de `develop`.

---

## 🌱 Branches de développement

### Feature branches (`feature/nom-feature`)

- Pour développer une **nouvelle fonctionnalité**.
- Créée à partir de `develop`.
- Merge **uniquement** dans `develop`.
- Nom explicite (`feature/login-page` et non `feature/authentication`).

#### 📌 Création d'une feature branch

```bash
# Se placer sur develop
git checkout develop

# Créer une nouvelle branche feature
git checkout -b feature/login-page
```

#### 📌 Pousser une feature branch

```bash
git push origin feature/login-page
```

#### 📌 Fusionner une feature branch après validation

```bash
git checkout develop
git merge feature/login-page
git push origin develop
```

#### 📌 Merge de la develop dans `main`

```bash
git checkout main
git merge develop
git push origin main
```

### Hotfix branches (`hotfix/x.y.z`)

- Utilisée pour **corriger un bug urgent** en production.
- Créée depuis `main`, merge dans `main` et `develop`.

#### 📌 Création d’un hotfix

```bash
git checkout main
git checkout -b hotfix/1.0.1
```

#### 📌 Merge du hotfix

```bash
git checkout main
git merge hotfix/1.0.1
git push origin main

git checkout develop
git merge hotfix/1.0.1
git push origin develop
```

---

## 🏷️ Gestion des Tags

Les **tags** permettent d’identifier les versions stables.

#### 📌 Création d’un tag versionné

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

#### 📌 Voir tous les tags

```bash
git tag
```

#### 📌 Supprimer un tag

```bash
git tag -d v1.0.0
git push origin --delete v1.0.0
```

---

## 📝 Bonnes pratiques

✅ Toujours travailler sur une **feature branch** et non sur `develop` ou `main`. 
✅ Écrire des **messages de commit clairs**. 
✅ Toujours **mettre à jour **`` avant de créer une nouvelle branche. 
✅ Faire une **pull request** et demander une revue avant de merger. 
✅ Supprimer une **feature branch** après le merge pour garder un repo propre.

---

Avec cette méthodologie, nous assurons un workflow propre, structuré et efficace. 🚀🔥
