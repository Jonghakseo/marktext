'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

module.exports = async function notarizeMac(context) {
  if (!context || context.electronPlatformName !== 'darwin') {
    return
  }

  const requiredEnv = ['APPLE_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'APPLE_TEAM_ID']
  const missingEnv = requiredEnv.filter((name) => !process.env[name])
  if (missingEnv.length) {
    throw new Error(
      `Missing notarization environment variables: ${missingEnv.join(', ')}. ` +
        'Set them before running the notarized mac build.'
    )
  }

  const productFilename =
    context?.packager?.appInfo?.productFilename || context?.packager?.appInfo?.productName
  if (!productFilename) {
    throw new Error('Unable to resolve macOS app name for notarization.')
  }

  const appPath = path.join(context.appOutDir, `${productFilename}.app`)
  if (!fs.existsSync(appPath)) {
    throw new Error(`Unable to find app bundle for notarization: ${appPath}`)
  }

  const zipPath = path.join(os.tmpdir(), `${productFilename}-${Date.now()}.zip`)

  try {
    console.log(`[notarize] Creating zip for notarization submission: ${zipPath}`)
    execFileSync('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', appPath, zipPath], {
      stdio: 'inherit'
    })

    console.log(`[notarize] Submitting ${zipPath} to Apple notary service...`)
    execFileSync(
      'xcrun',
      [
        'notarytool',
        'submit',
        zipPath,
        '--apple-id',
        process.env.APPLE_ID,
        '--password',
        process.env.APPLE_APP_SPECIFIC_PASSWORD,
        '--team-id',
        process.env.APPLE_TEAM_ID,
        '--wait'
      ],
      { stdio: 'inherit' }
    )

    console.log(`[notarize] Stapling notarization ticket to ${appPath}...`)
    execFileSync('xcrun', ['stapler', 'staple', appPath], { stdio: 'inherit' })
  } finally {
    if (fs.existsSync(zipPath)) {
      fs.rmSync(zipPath, { force: true })
    }
  }
}
