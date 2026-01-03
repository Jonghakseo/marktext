import { Tray, Menu, nativeImage, app } from 'electron'
import path from 'path'
import log from 'electron-log'

export function createTray(windowManager) {
  try {
    const iconPath = path.join(global.__static, 'logo-tray.png')
    log.info(`Creating tray with icon: ${iconPath}`)

    const icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) {
      log.warn('Tray icon is empty, skipping tray creation')
      return null
    }
    icon.setTemplateImage(true)

    const tray = new Tray(icon)
    tray.setToolTip('MarkText')

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show MarkText', click: () => showAllWindows(windowManager) },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ])

    tray.setContextMenu(contextMenu)
    tray.on('click', () => showAllWindows(windowManager))

    log.info('Tray created successfully')
    return tray
  } catch (err) {
    log.error('Failed to create tray:', err)
    return null
  }
}

function showAllWindows(windowManager) {
  for (const window of windowManager.windows.values()) {
    window.browserWindow.show()
  }
}
