import { Button, List, ListItem, Typography } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../common/hooks";
import { fetchAudio, setFiles } from "./audioActionAndReducer";
import { RootState } from "./store";

const App = () => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const dispatch = useAppDispatch();

    const audioUrl = useSelector((state: RootState) => state.audio.audioUrl);
    const audioRef = useRef<HTMLAudioElement>(null);

    const files = useSelector((state: RootState) => state.audio.audioFiles);
    //#endregion

    //#region Handlers
    const handleFolderSelect = useCallback(async () => {
        const files = await window.electron.openFolder();
        dispatch(setFiles(files));
    }, [dispatch]);

    const handleFileClick = useCallback((filePath: string) => {
        // Stop the previous audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Dispatch the action to fetch the audio file
        dispatch(fetchAudio(filePath));
    }, [dispatch]);
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
            <audio
                ref={audioRef}
                key={audioUrl}
                controls
            >
                {audioUrl &&
                    <source src={audioUrl} />
                }
                Your browser does not support the audio element.
            </audio>
        }
        <List>
            {files.map((file) => (
                <ListItem
                    key={file.path}
                    style={{
                        cursor: "pointer",
                        fontWeight: audioUrl?.includes(file.path)
                            ? "bold"
                            : "normal",
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
