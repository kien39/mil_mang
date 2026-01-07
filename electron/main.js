const path = require("path")
const { app, BrowserWindow } = require("electron")
const http = require("http")

const isDev = process.env.NODE_ENV !== "production"
const port = process.env.PORT || 3000
let server = null
let mainWindow = null

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.loadURL(url)
  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

async function startNextServer() {
  // Start Next.js programmatically so we don't spawn external child processes
  try {
    const next = require("next")
    const projectDir = path.resolve(__dirname, "..")
    const nextApp = next({ dev: isDev, dir: projectDir })
    const handle = nextApp.getRequestHandler()

    await nextApp.prepare()

    server = http.createServer((req, res) => {
      return handle(req, res)
    })

    return new Promise((resolve, reject) => {
      server.listen(port, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  } catch (err) {
    console.error("Failed to start Next server:", err)
    throw err
  }
}

app.whenReady().then(async () => {
  if (!isDev) {
    // In production, ensure .next build is available; start server
    await startNextServer()
    createWindow(`http://localhost:${port}`)
  } else {
    // Dev: assume dev server is started via npm script; wait then open
    createWindow(`http://localhost:${port}`)
  }

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(`http://localhost:${port}`)
  })
})

app.on("window-all-closed", () => {
  if (server) {
    try {
      server.close()
    } catch (e) {
      // ignore
    }
  }
  if (process.platform !== "darwin") {
    app.quit()
  }
})
