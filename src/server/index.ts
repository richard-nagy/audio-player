import cors from "cors";
import express, { Request, Response } from "express";
import fs from "fs";
import Constant from "../common/constants";

// Create an Express app
const server = express();

server.use(cors({
    origin: process.env.NODE_ENV === "production"
        ? Constant.port.production
        : Constant.port.development,
}));

// Stream audio file
server.get("/audio", (req: Request, res: Response) => {
    const filePath = decodeURIComponent(req.query.filePath as string);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    // Get file stats (e.g., file size)
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Handle range requests (for streaming)
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        // Validate range
        if (start >= fileSize) {
            res.status(416).send("Requested range not satisfiable");
            return;
        }

        // Set headers for partial content
        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Content-Type": "audio/mpeg",
        });

        // Create a read stream for the requested range
        const fileStream = fs.createReadStream(filePath, { start, end });

        fileStream.pipe(res);
    } else {
        // Send the entire file if no range is requested
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "audio/mpeg",
        });

        fs.createReadStream(filePath).pipe(res);
    }
});

// Set the Express server to listen on a port (e.g., 3001)
const startServer = () => {
    server.listen(3001, () => {
        console.log("Express server running on http://localhost:3001");
    });
};

export default startServer;