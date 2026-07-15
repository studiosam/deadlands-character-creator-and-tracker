const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");
const { fileURLToPath } = require("node:url");

const APP_ROOT = path.resolve(__dirname, "..");
const DEFAULT_ZOOM_FACTOR = 1;
const MIN_ZOOM_FACTOR = 0.5;
const MAX_ZOOM_FACTOR = 2;
const ZOOM_STEP = 0.1;
const SMOKE_TEST = process.env.DEADLANDS_ELECTRON_SMOKE_TEST === "1";

function clampZoomFactor(factor) {
  return Math.min(
    MAX_ZOOM_FACTOR,
    Math.max(MIN_ZOOM_FACTOR, Number(factor.toFixed(2))),
  );
}

function changeZoom(window, amount) {
  const current = window.webContents.getZoomFactor();
  window.webContents.setZoomFactor(clampZoomFactor(current + amount));
}

function installWindowShortcuts(window) {
  window.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown" || input.isAutoRepeat) return;

    if (input.key === "F11") {
      event.preventDefault();
      window.setFullScreen(!window.isFullScreen());
      return;
    }

    const commandKey = input.control || input.meta;
    if (!commandKey || input.alt) return;

    const key = String(input.key || "");
    if (key === "+" || key === "=" || input.code === "NumpadAdd") {
      event.preventDefault();
      changeZoom(window, ZOOM_STEP);
      return;
    }

    if (key === "-" || key === "_" || input.code === "NumpadSubtract") {
      event.preventDefault();
      changeZoom(window, -ZOOM_STEP);
      return;
    }

    if (key === "0" || input.code === "Numpad0") {
      event.preventDefault();
      window.webContents.setZoomFactor(DEFAULT_ZOOM_FACTOR);
    }
  });

  window.webContents.on("zoom-changed", (event, direction) => {
    event.preventDefault();
    changeZoom(window, direction === "in" ? ZOOM_STEP : -ZOOM_STEP);
  });
}

function localAppFile(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "file:") return "";
    const file = fileURLToPath(parsed);
    const relative = path.relative(APP_ROOT, file);
    return relative === "" ||
      (!relative.startsWith("..") && !path.isAbsolute(relative))
      ? file
      : "";
  } catch {
    return "";
  }
}

function restrictNavigation(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (url === window.webContents.getURL()) return;
    event.preventDefault();
    if (/^https?:\/\//i.test(url)) {
      void shell.openExternal(url);
      return;
    }

    const file = localAppFile(url);
    if (file) void shell.openPath(file);
  });
}

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 650,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0b1118",
    icon: path.join(__dirname, "..", "favicon", "apple-touch-icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  installWindowShortcuts(window);
  restrictNavigation(window);
  window.once("ready-to-show", () => {
    if (!SMOKE_TEST) window.show();
  });
  window.webContents.once("did-finish-load", () => {
    if (!SMOKE_TEST) return;
    console.log("Electron desktop shell loaded.");
    app.quit();
  });
  void window.loadFile(path.join(__dirname, "..", "index.html"));
  return window;
}

app.whenReady().then(() => {
  app.setName("Deadlands Character Tracker");
  if (process.platform === "win32") {
    app.setAppUserModelId("com.studiosam.deadlands-character-tracker");
  }
  Menu.setApplicationMenu(null);
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
