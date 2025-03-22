import cors from "cors";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import Constant from "../common/constants";
import { getMetadata } from "../main";
import { TrackMetadata } from "../renderer/src/pages/tracks/types";
import { MimeTypes } from "./types";

// Create an Express app
const server = express();

// Enable CORS
server.use(cors({
    origin: process.env.NODE_ENV === "production"
        ? Constant.port.production
        : Constant.port.development,
}));

console.log("Server initialized, waiting for requests...");

// Endpoint to get the stream URL and file metadata
server.get("/track", async (req: Request, res: Response) => {
    const filePath = decodeURIComponent(req.query.filePath as string);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return res.status(404).json({ error: "File not found" });
    }

    try {
        console.log(`🔍 Extracting metadata for: ${filePath}`);
        const metadata = await getMetadata(filePath);
        console.log(`✅ Metadata extracted: ${metadata.common.title || path.basename(filePath)}`);

        // Construct response with stream URL and metadata
        return res.json({
            url: `/stream?filePath=${encodeURIComponent(filePath)}&format=${encodeURIComponent(metadata.format.codec || "mpeg")}`,
            metadata: {
                title: metadata.common.title || path.basename(filePath), // Use file name if title isn't available
                artist: metadata.common.artist || "Unknown Artist",
                album: metadata.common.album || "Unknown Album",
                genre: metadata.common.genre || [],
                duration: metadata.format.duration || "Unknown Duration",
                format: metadata.format.codec || "Unknown Format",
                size: fs.statSync(filePath).size, // File size in bytes
            },
        });
    } catch (err) {
        console.error(`❌ Error reading metadata for ${filePath}:`, err);
        return res.status(500).json({ error: "Could not read file metadata" });
    }
});

// Endpoint to get the track URLs and metadata
server.get("/tracks", async (req: Request, res: Response): Promise<TrackMetadata> => {
    const folderPath = decodeURIComponent(req.query.folderPath as string);

    if (!fs.existsSync(folderPath)) {
        console.log(`❌ Folder not found: ${folderPath}`);
        return res.status(404).json({ error: "Folder not found" });
    }

    try {
        // Create regex from MimeTypes enum
        const trackExtensions = Object.keys(MimeTypes).join("|");
        const trackRegex = new RegExp(`\\.(${trackExtensions})$`, "i");

        // Function to recursively scan folders
        const getTracksRecursively = (dir: string): string[] => {
            let results: string[] = [];

            const items = fs.readdirSync(dir);

            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    // If it's a folder, recurse into it
                    results = results.concat(getTracksRecursively(fullPath));
                } else if (trackRegex.test(item)) {
                    // If it's an track, add it to results
                    results.push(fullPath);
                }
            });

            return results;
        };

        // Get all tracks recursively
        const files = getTracksRecursively(folderPath);

        console.log(`📁 Folder Path ${folderPath}`);

        // Extract metadata for each file
        const metadataList: Array<TrackMetadata | null> = await Promise.all(files.map(async (filePath) => {
            try {
                console.log(`🎵 Extracting metadata for: ${filePath}`);
                const metadata = await getMetadata(filePath);

                return {
                    id: uuidv4(),
                    url: `${Constant.port.server}/stream?filePath=${encodeURIComponent(filePath)}&format=${encodeURIComponent(metadata.format.codec || "mpeg")}`,
                    metadata: {
                        title: metadata.common.title ?? path.basename(filePath),
                        artist: metadata.common.artist ?? "Unknown Artist",
                        album: metadata.common.album ?? "Unknown Album",
                        genre: metadata.common.genre ?? [],
                        duration: metadata.format.duration ?? "Unknown Duration",
                        format: metadata.format.codec ?? "Unknown Format",
                        size: fs.statSync(filePath).size,
                    }
                };
            } catch (err) {
                console.warn(`⚠️ Skipping metadata extraction for ${filePath}:`, err);

                // Fallback for corrupted or problematic files
                return null;
            }
        }));

        // Filter out null values (if any)
        const validMetadata = metadataList.filter(item => item !== null);

        console.log(`✅ Successfully processed ${validMetadata.length} out of ${files.length} files.`);
        return res.json(validMetadata);
    } catch (err) {
        console.error(`❌ Error reading folder: ${folderPath}`, err);
        return res.status(500).json({ error: "Could not read folder contents" });
    }
});

// Endpoint to handle track streaming
server.get("/stream", (req: Request, res: Response) => {
    const filePath = decodeURIComponent(req.query.filePath as string);
    const format = decodeURIComponent(req.query.format as string || "mp3").toLowerCase();

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Stream request failed. File not found: ${filePath}`);
        return res.status(404).send("File not found");
    }

    // Get MIME type from the enum
    const mimeType = MimeTypes[format as keyof typeof MimeTypes] || MimeTypes.mp3;

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
            console.log(`❌ Invalid range requested: ${start}-${end} (File size: ${fileSize})`);
            res.status(416).send("Requested range not satisfiable");
            return;
        }

        // Set headers for partial content
        console.log(`📡 Streaming partial content: ${start}-${end} of ${filePath}`);

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Content-Type": mimeType,
        });

        // Create a read stream for the requested range
        const fileStream = fs.createReadStream(filePath, { start, end });

        fileStream.on("open", () => console.log(`➡️ Started streaming: ${filePath} (Range: ${start}-${end})`));
        fileStream.on("close", () => console.log(`🏁 Finished streaming chunk of: ${filePath}`));
        fileStream.on("error", (err) => console.error(`❌ Error streaming file: ${err.message}`));

        fileStream.pipe(res);
    } else {
        // Send the entire file if no range is requested
        console.log(`📡 Streaming entire file: ${filePath}`);
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": mimeType,
        });

        const fileStream = fs.createReadStream(filePath);

        fileStream.on("open", () => console.log(`➡️ Started streaming: ${filePath} (Full File)`));
        fileStream.on("close", () => console.log(`🏁 Finished streaming: ${filePath}`));
        fileStream.on("error", (err) => console.error(`❌ Error streaming file: ${err.message}`));

        fileStream.pipe(res);
    }
});

// Set the Express server to listen on a port (e.g., 3001)
const startServer = () => {
    server.listen(3001, () => {
        console.log("🚀 Express server running on http://localhost:3001");
    });
};

export default startServer;
