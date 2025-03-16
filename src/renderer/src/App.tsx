import { Theme, useTheme } from "@mui/material/styles";
import { useCallback, useRef, useState } from 'react';

const App = () => {
    const theme = useTheme<Theme>();
    const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleFolderSelect = useCallback(async () => {
        //@ts-ignore
        const files = await window.electronAPI.openFolder();
        setFiles(files);
    }, []);

    const handleFileClick = useCallback((filePath: string) => {
        // Stop the previous audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Fetch the audio file from the backend
        setCurrentFile(filePath);
        setAudioUrl(`http://localhost:3001/audio?filePath=${encodeURIComponent(filePath)}`);
    }, []);

    return <div style={{
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }}>
        <button onClick={handleFolderSelect}>Select Folder</button>
        <ul>
            {files.map((file) => (
                <li key={file.path} onClick={() => handleFileClick(file.path)} style={{ cursor: 'pointer', fontWeight: currentFile === file.path ? 'bold' : 'normal' }}>
                    {file.name}
                </li>
            ))}
        </ul>
        {audioUrl && (
            <audio controls key={currentFile} ref={audioRef}>
                <source src={audioUrl} />
                Your browser does not support the audio element.
            </audio>
        )}
    </div>;
};

export default App;
