# macOS Signing + Notarization

This repository now includes dedicated scripts for a notarized macOS build:

- `npm run build:mac:notarized`
- `npm run build:mac:dmg:notarized`

These use `electron-builder.mac-notarized.yml` and notarize the generated `.app` bundle with `xcrun notarytool` before packaging finishes.

## Why this exists

For apps shared directly with other users, Developer ID signing alone is not enough for a smooth Gatekeeper experience. Apple recommends notarization for software distributed outside the Mac App Store.

Official references:

- Apple: Notarizing macOS software before distribution  
  https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution
- electron-builder: macOS code signing  
  https://www.electron.build/code-signing-mac.html
- electron-builder: code signing setup  
  https://www.electron.build/code-signing.html

## Prerequisites

1. A valid **Developer ID Application** certificate installed in your macOS login keychain.
2. Xcode command line tools available (`xcrun notarytool`, `xcrun stapler`).
3. Apple notarization credentials in environment variables.

According to the electron-builder docs, on a macOS development machine a valid signing identity in the keychain is auto-discovered. If you have multiple certificates, you can set `CSC_NAME` explicitly.

## Required environment variables

```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="YOURTEAMID"

# Optional if auto-discovery is not enough
export CSC_NAME="Developer ID Application: Your Name (YOURTEAMID)"
```

## Build

Universal-ish macOS build targets from the notarized config:

```bash
npm run build:mac:notarized
```

ARM64 DMG only:

```bash
npm run build:mac:dmg:notarized
```

## Notes

- The notarized config enables `hardenedRuntime: true` and `forceCodeSigning: true`.
- If signing credentials are missing, the notarized build should fail instead of silently producing a non-distributable app.
- The default `build:mac` scripts are left unchanged for unsigned/local packaging flows.
