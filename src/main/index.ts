import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import fs from "fs";
import os from "os";
import path, { join } from "path";
import icon from "../../resources/icon.png?asset";
import { filterAudioFiles } from "../common/functions";
import startServer from "../server";

/**
 * Extracts metadata from an audio file.
 * 
 * @param {string} filePath - The path to the audio file.
 * @returns {Promise<object>} A promise that resolves to the metadata of the file.
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

    mainWindow.webContents.on("did-finish-load", () => {
        const userDocumentsPath = path.join(os.homedir(), "Documents");
        const dataFilePath = path.join(userDocumentsPath, "data.json");

        if (fs.existsSync(dataFilePath)) {
            const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
            const folderPath = data.lastLocation;

            if (folderPath && fs.existsSync(folderPath)) {
                const files = fs.readdirSync(folderPath)
                    .filter(filterAudioFiles)
                    .map((file) => ({
                        name: file,
                        path: path.join(folderPath, file),
                    }));

                mainWindow.webContents.send("set-files", files);
            }
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Handle folder selection
    ipcMain.handle("dialog-openFolder", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const folderPath = result.filePaths[0];
            const files = fs.readdirSync(folderPath)
                .filter(filterAudioFiles)
                .map((file) => {
                    return {
                        name: file,
                        path: join(folderPath, file),
                    };
                });

            // Save the last selected folder to data.json
            const userDocumentsPath = path.join(os.homedir(), "Documents");
            const dataFilePath = path.join(userDocumentsPath, "data.json");
            const data = { lastLocation: folderPath };
            fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

            return files;
        }

        return [];
    });

    // Set app user model id for windows
    electronApp.setAppUserModelId("com.electron");

    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    createWindow();

    app.on("activate", function () {
        // On macOS it"s common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
