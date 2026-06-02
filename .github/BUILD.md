# GitHub Build Setup

Yeh guide Expo app ko GitHub Actions pe build karne ke liye hai.

## 1. GitHub Repo Setup

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 2. Secrets Add Karo (GitHub Repo → Settings → Secrets and variables → Actions)

**Required:**
- `EXPO_TOKEN` - https://expo.dev/accounts/[username]/settings/access-tokens se banao

**Optional (Play Store upload ke liye):**
- `ANDROID_KEYSTORE_BASE64` - Release keystore (base64 encoded)
  ```bash
  base64 -i release.keystore | pbcopy
  ```
- `ANDROID_KEY_ALIAS` - Keystore alias
- `ANDROID_KEY_PASSWORD` - Key password
- `ANDROID_STORE_PASSWORD` - Store password

## 3. Build Trigger Karo

**Option A: Automatic** - `main` branch pe push karo, ya `v1.0.0` tag lagao

**Option B: Manual** - GitHub repo → Actions tab → "Build Expo Android APK" → Run workflow

## 4. APK Download Karo

- Actions run complete hone ke baad → run pe click karo
- Neeche "Artifacts" section me `app-debug` ya `app-release-aab` milega
- Download karke phone pe install karo

## Build Types

| Trigger | Output |
|---------|--------|
| Push to main | Debug APK + Release AAB (if keystore set) |
| Tag v* | Debug APK + Release AAB |
| Pull request | Debug APK only |
| Manual | Debug APK |

## Keystore Banao (pehli baar ke liye)

```bash
keytool -genkey -v -keystore release.keystore \
  -alias htmlcreator -keyalg RSA -keysize 2048 -validity 10000
```

## iOS Build

iOS sirf EAS se hota hai (Mac chahiye ya EAS cloud). GitHub Actions se `eas build --platform ios` queue hota hai - Expo dashboard pe build hota hai.
