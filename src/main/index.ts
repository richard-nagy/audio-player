import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import cors from "cors";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import express from "express";
import fs from "fs";
import { join } from "path";
import icon from "../../resources/icon.png?asset";

// Create an Express app
const server = express();

server.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'http://localhost:5173', // Replace with your production domain
}));

// Serve a simple message (or modify it to serve anything you like)
server.get('/download', (req, res) => {
    const filePath = req.query.file; // Get file path from query params
    if (filePath && fs.existsSync(filePath as string)) {
        res.sendFile(filePath as string); // Send the audio file to the client
    } else {
        res.status(404).send('File not found');
    }
});

// Set the Express server to listen on a port (e.g., 3001)
server.listen(3001, () => {
    console.log('Express server running on http://localhost:3001');
});

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === "linux" ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            nodeIntegration: false, // Don't use node integration for security reasons
            sandbox: false
        }
    });

    mainWindow.loadURL('http://localhost:3001');  // If you want to load the Express server

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

// Open the folder selector
ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'], // Specify that you want to open a folder
    });
    return result.filePaths[0]; // Return the first selected folder path
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId("com.electron");

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    // IPC test
    ipcMain.on("ping", () => console.log("pong"));

    createWindow();

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
