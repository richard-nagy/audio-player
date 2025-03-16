import { Button, List, ListItem, Typography } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { useCallback, useRef, useState } from 'react';

const App = () => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    //#endregion

    //#region Handlers
    const handleFolderSelect = useCallback(async () => {
        const files = await window.electron.openFolder();
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
    //#endregion

    //#region Render
    return <div style={{
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        justifyContent: "center",
        alignItems: "center",
    }}>
        <Button onClick={handleFolderSelect}>
            Select Folder
        </Button>
        {
            <audio controls key={currentFile} ref={audioRef}>
                {audioUrl && <source src={audioUrl} />}
                Your browser does not support the audio element.
            </audio>
        }
        <List>
            {files.map((file) => (
                <ListItem
                    key={file.path}
                    style={{
                        cursor: 'pointer',
                        fontWeight: currentFile === file.path
                            ? 'bold'
                            : 'normal',
                    }}
                    onClick={() => handleFileClick(file.path)}
                >
                    <Typography variant="body2">
                        {file.name}
                    </Typography>
                </ListItem>
            ))}
        </List>
    </div>;
    //#endregion
};

export default App;
