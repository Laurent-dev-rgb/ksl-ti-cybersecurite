# Gestion du responsable de la protection des renseignements personnels

Le site public charge les coordonnées depuis `data/responsables-confidentialite.json`.

## Modifier le responsable principal

1. Ouvrir `data/responsables-confidentialite.json`.
2. Modifier le bloc dont `"principal": true`.
3. Le champ `name` peut rester vide : le site publie au minimum le titre et les coordonnées professionnelles.
4. Mettre `"public": false` pour un contact qui ne doit pas être affiché.
5. Déployer le site puis vérifier :
   - `/confidentialite.html`
   - le pied de page du site.

## Ajouter un délégué ou un second contact

Ajouter un objet dans le tableau `responsables`, par exemple :

```json
{
  "role": "Délégué à la protection des renseignements personnels",
  "organization": "KSL GROUPE INC.",
  "name": "Nom public facultatif",
  "email": "vieprivee@kslgroupe.ca",
  "address": "Adresse professionnelle",
  "public": true,
  "principal": false
}
```

Le site affiche actuellement le responsable principal dans le pied de page et la page Confidentialité. Le fichier accepte plusieurs contacts pour une future interface KSL Admin.
