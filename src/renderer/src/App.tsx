import { Box, Button, CssBaseline, List, ListItem, Typography } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../common/hooks";
import { Guid } from "../../common/types";
import { fetchAudios, initialFetchAudios, setSelectedAudio } from "./audio/audioActionAndReducer";
import { getActiveAudio, getAlbums, getArtists } from "./audio/audioSelectors";
import PermanentDrawer from "./navigation/PermanentDrawer";
import { RootState } from "./store";

const App = () => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const dispatch = useAppDispatch();

    const audioFiles = useSelector((state: RootState) => state.audio.audioFiles);
    const activeAudio = useSelector((state: RootState) => getActiveAudio(state));
    const albums = useSelector((state: RootState) => getAlbums(state));
    const artists = useSelector((state: RootState) => getArtists(state));

    const audioRef = useRef<HTMLAudioElement>(null);
    //#endregion

    //#region Handlers
    const handleFolderSelect = useCallback(async () => {
        dispatch(fetchAudios());
    }, [dispatch]);

    const handleFileClick = useCallback((id: Guid) => {
        // Stop the previous audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Dispatch the action to fetch the audio file
        dispatch(setSelectedAudio(id));
    }, [dispatch]);
    //#endregion

    //#region Effects
    useEffect(() => {
        window.electron.ipcRenderer.on("set-files", (_, files) => {
            console.log("Received files:", files);

            if (files.length > 0) {
                console.log("Fetching audios for folder:", files);
                dispatch(initialFetchAudios(files));
            }
        });

        return () => {
            window.electron.ipcRenderer.removeAllListeners("set-files");
        };
    }, [dispatch]);
    //#endregion

    //#region Render
    return <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {/* <AppBar
            position="fixed"
            sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Permanent drawer
                </Typography>
            </Toolbar>
        </AppBar> */}
        <PermanentDrawer />
        <Box
            sx={{ flexGrow: 1, p: 3 }}
        >
            {/* <Toolbar /> */}
            {/* TODO: content comes here */}
        </Box>
    </Box>;

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
                activeAudio?.metadata.artist + " - " + activeAudio?.metadata.title
            }
        </Typography>
        {
            <audio
                ref={audioRef}
                key={activeAudio?.url}
                style={{
                    minHeight: 50,
                }}
                controls
            >
                {activeAudio &&
                    <source src={activeAudio?.url} />
                }
            </audio>
        }
        <Typography variant="h4">
            Albums
        </Typography>
        <List>
            {albums.map((album) => (
                <ListItem key={album.id}>
                    <Typography variant="body2">
                        {album.artist} - {album.name}
                    </Typography>
                </ListItem>
            ))}
        </List>
        <Typography variant="h4">
            Artists
        </Typography>
        <List>
            {artists.map((artist) => (
                <ListItem key={artist.id}>
                    <Typography variant="body2">
                        {artist.name}
                    </Typography>
                </ListItem>
            ))}
        </List>
        <Typography variant="h4">
            Songs
        </Typography>
        <List>
            {audioFiles.map((file) => (
                <ListItem
                    key={file.id}
                    style={{
                        cursor: "pointer",
                    }}
                    onClick={() => handleFileClick(file.id)}
                >
                    <Typography variant="body2">
                        {file.metadata.artist} - {file.metadata.title}
                    </Typography>
                </ListItem>
            ))}
        </List>
    </div >;
    //#endregion
};

export default App;
