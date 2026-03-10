const requiredEnv = ['APPLE_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'APPLE_TEAM_ID']
const missingEnv = requiredEnv.filter((name) => !process.env[name])

if (process.platform !== 'darwin') {
  console.error('[build:mac:notarized] This script must be run on macOS.')
  process.exit(1)
}

if (missingEnv.length) {
  console.error(
    `[build:mac:notarized] Missing environment variables: ${missingEnv.join(', ')}`
  )
  console.error(
    '[build:mac:notarized] Also make sure a Developer ID Application certificate is available in your login keychain or set CSC_NAME explicitly.'
  )
  process.exit(1)
}

console.log('[build:mac:notarized] Required Apple notarization environment variables are present.')
