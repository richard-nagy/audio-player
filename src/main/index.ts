import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import fs from "fs";
import os from "os";
import path, { join } from "path";
import icon from "../../resources/icon.png?asset";
import startServer from "../server";

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

    mainWindow.webContents.once("did-finish-load", () => {
        console.log("Main window finished loading.");

        const userDocumentsPath = path.join(os.homedir(), "Documents");
        const dataFilePath = path.join(userDocumentsPath, "data.json");

        console.log(`Checking for data.json at: ${dataFilePath}`);

        if (fs.existsSync(dataFilePath)) {
            console.log("data.json found!");
            const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
            const folderPath = data.lastLocation;

            if (folderPath && fs.existsSync(folderPath)) {
                console.log(`Loading tracks from: ${folderPath}`);
                mainWindow.webContents.send("set-files", folderPath);
            } else {
                console.log("Folder path missing or does not exist:", folderPath);
            }
        } else {
            console.log("data.json not found.");
        }
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
    // Handle folder selection
    ipcMain.handle("dialog-openFolder", async (): Promise<string | null> => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        return result.filePaths[0];
    });

    // Set app user model id for windows
    electronApp.setAppUserModelId("com.electron");

    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
