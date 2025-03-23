import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { join } from "path";
import icon from "../../resources/icon.png?asset";
import { Logger } from "../common/logger";
import startServer from "../server";
import { settingsStore } from "./store";

/**
 * Extracts metadata from a track.
 * 
 * @param {string} filePath - The path to the track.
 * @returns {Promise<object>} A promise that resolves to the metadata of the track.
 */
export async function getMetadata(filePath: string) {
    const musicMetadata = await import("music-metadata");
    return await musicMetadata.parseFile(filePath);
}

// Start Express server
startServer();

function createWindow(): void {
    // Create the browser window.
    Logger.debug("🪟 Electron main window created");
    const mainWindow = new BrowserWindow({
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === "linux" ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });

    mainWindow.maximize();

    // Load the Express server
    mainWindow.loadURL("http://localhost:3001");

    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }
}

// This method will be called when Electron has finished initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    Logger.debug("🌟 Electron Ready");

    // Handle settings retrieval and updates
    ipcMain.handle("get-setting", (_, key) => settingsStore.get(key));
    ipcMain.handle("set-setting", (_, key, value) => settingsStore.set(key, value));

    // Handle folder selection
    ipcMain.handle("dialog-openFolder", async (): Promise<string | null> => {
        Logger.debug("📂 Open folder");
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        Logger.debug(`📁 Selected folder: ${result.filePaths[0]}`);
        return result.filePaths[0];
    });

    // Set app user model id for windows
    electronApp.setAppUserModelId("com.electron");

    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        Logger.debug("👋 Close App");
        app.quit();
    }
});
