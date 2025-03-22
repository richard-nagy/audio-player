import { Button, List, ListItem, Theme, Typography, useTheme } from "@mui/material";
import { FC, ReactElement, useCallback, useRef } from 'react';
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../common/hooks";
import { Guid } from "../../../../common/types";
import { RootState } from "../../store";
import { fetchTracks, setSelectedTracks } from "./trackActionAndReducer";
import { getActiveTrack } from "./trackSelectors";

const TracksPage: FC = (): ReactElement => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const dispatch = useAppDispatch();

    const tracks = useSelector((state: RootState) => state.track.tracks);
    const activeTrack = useSelector((state: RootState) => getActiveTrack(state));

    const audioRef = useRef<HTMLAudioElement>(null);
    //#endregion

    //#region Methods
    const handleFolderSelect = useCallback(async () => {
        dispatch(fetchTracks());
    }, [dispatch]);

    const handleFileClick = useCallback((id: Guid) => {
        // Stop the previous track
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Dispatch the action to fetch the track
        dispatch(setSelectedTracks(id));
    }, [dispatch]);
    //#endregion

    //#region useEffects
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
                activeTrack?.metadata.artist + " - " + activeTrack?.metadata.title
            }
        </Typography>
        {
            <audio
                ref={audioRef}
                key={activeTrack?.url}
                style={{
                    minHeight: 50,
                }}
                controls
            >
                {activeTrack &&
                    <source src={activeTrack?.url} />
                }
            </audio>
        }
        {/* <Typography variant="h4">
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
        </List> */}
        <Typography variant="h4">
            Songs
        </Typography>
        <List>
            {tracks.map((file) => (
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
    </div>;
    //#endregion
};

export default TracksPage;
