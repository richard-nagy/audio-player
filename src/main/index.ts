import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import cors from "cors";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import express, { Response, Request } from "express";
import fs from "fs";
import { join } from "path";
import icon from "../../resources/icon.png?asset";

// Create an Express app
const server = express();

server.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'http://localhost:5173', // Replace with your production domain
}));

// // Serve a simple message (or modify it to serve anything you like)
// server.get('/download', (req, res) => {
//     const filePath = req.query.file; // Get file path from query params
//     if (filePath && fs.existsSync(filePath as string)) {
//         res.sendFile(filePath as string); // Send the audio file to the client
//     } else {
//         res.status(404).send('File not found');
//     }
// });

// Stream audio file
//@ts-ignore
server.get('/audio', (req: Request, res: Response) => {
    const filePath = decodeURIComponent(req.query.filePath as string);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    // Get file stats (e.g., file size)
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Handle range requests (for streaming)
    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        // Validate range
        if (start >= fileSize) {
            res.status(416).send('Requested range not satisfiable');
            return;
        }

        // Set headers for partial content
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': 'audio/mpeg',
        });

        // Create a read stream for the requested range
        const fileStream = fs.createReadStream(filePath, { start, end });
        fileStream.pipe(res);
    } else {
        // Send the entire file if no range is requested
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mpeg',
        });
        fs.createReadStream(filePath).pipe(res);
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

// Handle folder selection
ipcMain.handle('dialog-openFolder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        const files = fs.readdirSync(folderPath).map((file) => ({
            name: file,
            path: join(folderPath, file),
        }));

        return files;
    }

    return [];
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
