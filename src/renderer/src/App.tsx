import { Button, List, ListItem, Typography } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../common/hooks";
import { AudioFile } from "../../common/types";
import { fetchAudio, setFiles } from "./audioActionAndReducer";
import { RootState } from "./store";

const App = () => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const dispatch = useAppDispatch();

    const selectedAudio = useSelector((state: RootState) => state.audio.selectedAudio);
    const files = useSelector((state: RootState) => state.audio.audioFiles);

    const audioRef = useRef<HTMLAudioElement>(null);
    //#endregion

    //#region Handlers
    const handleFolderSelect = useCallback(async () => {
        const files = await window.electron.openFolder();

        if (files) {
            dispatch(setFiles(files));
        }
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

    //#region Effects
    useEffect(() => {
        const handleSetFiles = (files: AudioFile[]) => {
            dispatch(setFiles(files));
        };

        window.electron.onSetFiles(handleSetFiles);

        return () => {
            window.electron.removeSetFilesListener();
        };
    }, [dispatch]);
    //#endregion

    //#region Render
    return <div style={{
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "auto",
    }}>
        <Button
            style={{
                marginTop: 50,
            }}
            onClick={handleFolderSelect}
        >
            Select Folder
        </Button>
        <Typography variant="body1">
            {
                selectedAudio?.metadata.artist + " - " + selectedAudio?.metadata.title
            }
        </Typography>
        {
            <audio
                ref={audioRef}
                key={selectedAudio?.url}
                style={{
                    minHeight: 50,
                }}
                controls
            >
                {selectedAudio &&
                    <source src={selectedAudio?.url} />
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
