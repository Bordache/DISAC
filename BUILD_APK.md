# Guide de Construction de l'APK DISAC

## Prérequis

- Node.js 18+
- Java 11+
- Android SDK (via Android Studio ou sdkmanager)
- Gradle

## Installation rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Construire l'application web

```bash
npm run build
```

### 3. Ajouter la plateforme Android

```bash
npx cap add android
```

### 4. Synchroniser avec Android

```bash
npx cap sync android
```

## Génération de la clé de signature (première fois seulement)

```bash
mkdir -p android/app

keytool -genkey -v -keystore android/app/release-signing.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias disac-release \
  -storepass password123 \
  -keypass password123 \
  -dname "CN=DISAC,O=Marina,L=Madagascar,S=Antananarivo,C=MG"
```

**Gardez cette clé en lieu sûr !** Elle est nécessaire pour toutes les mises à jour.

## Construire l'APK de release

### Option 1 : Avec variables d'environnement

```bash
export KEYSTORE_PASSWORD=password123
export KEYSTORE_ALIAS=disac-release
export KEYSTORE_ALIAS_PASSWORD=password123

chmod +x android/gradlew
cd android
./gradlew assembleRelease
cd ..
```

### Option 2 : Directement en ligne de commande

```bash
chmod +x android/gradlew
cd android
./gradlew assembleRelease \
  -PKEYSTORE_PASSWORD=password123 \
  -PKEYSTORE_ALIAS=disac-release \
  -PKEYSTORE_ALIAS_PASSWORD=password123
cd ..
```

## Résultat

L'APK signé sera généré dans :

```
android/app/build/outputs/apk/release/app-release.apk
```

## Installation sur Android

### Via ADB (Android Debug Bridge)

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Pour une mise à jour (remplacer l'app existante)

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Mise à jour de la version

Pour chaque nouvelle release, incrémentez :

1. **android/app/build.gradle**

```gradle
defaultConfig {
    versionCode 2        # Augmentez ceci
    versionName "1.0.1"  # Mettez à jour ceci
}
```

2. **capacitor.config.json**

```json
{
  "version": "1.0.1"
}
```

3. **package.json**

```json
{
  "version": "1.0.1"
}
```

## Automatisation avec GitHub Actions

Pour activer les builds automatiques :

1. Ajoutez les secrets dans GitHub Settings :
   - `KEYSTORE_PASSWORD` : password123
   - `KEYSTORE_ALIAS` : disac-release
   - `KEYSTORE_ALIAS_PASSWORD` : password123

2. À chaque push sur `main`, une APK sera générée automatiquement et ajoutée aux releases GitHub.

## Dépannage

### Erreur : "gradlew not found"

```bash
npx cap sync android
chmod +x android/gradlew
```

### Erreur : "Gradle sync failed"

```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Erreur de signature

Vérifiez que les variables d'environnement sont correctes :

```bash
echo $KEYSTORE_PASSWORD
echo $KEYSTORE_ALIAS
echo $KEYSTORE_ALIAS_PASSWORD
```

### L'APK ne remplace pas l'ancienne version

Vérifiez que :
- L'`applicationId` est identique : `mg.disac.app`
- La clé de signature est la même
- Le `versionCode` est plus grand que la version précédente

## Vérifier l'APK

```bash
# Afficher les informations de l'APK
aapt dump badging android/app/build/outputs/apk/release/app-release.apk

# Vérifier la signature
jarsigner -verify -verbose android/app/build/outputs/apk/release/app-release.apk
```

## Support

Pour plus d'informations :
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Build Documentation](https://developer.android.com/build)
