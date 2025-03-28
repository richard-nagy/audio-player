import { Button, List, ListItem, Theme, Typography, useTheme } from "@mui/material";
import { FC, ReactElement, useCallback } from 'react';
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../common/hooks";
import { UserSettingKey } from "../../../../../main/types";
import { RootState } from "../../../store";
import { fetchTracks, setPlaylistPosition, toggleAutoPlay } from "./tracksSlice";

const TracksPage: FC = (): ReactElement => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const dispatch = useAppDispatch();

    const tracks = useSelector((state: RootState) => state.track.tracks);

    //#endregion

    //#region Methods
    const handleFolderSelect = useCallback(async () => {
        dispatch(fetchTracks());
    }, [dispatch]);

    const handleFileClick = useCallback((_, position: number) => {
        // // Stop the previous track
        // if (audioRef.current) {
        //     audioRef.current.pause();
        //     audioRef.current.currentTime = 0;
        // }

        // Dispatch the action to fetch the track
        dispatch(setPlaylistPosition(position));

        window.electron.setSetting(UserSettingKey.PlaylistPosition, position);
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
        <Typography variant="h4">
            Songs
        </Typography>
        <List>
            {tracks.map((t, i) => (
                <ListItem
                    key={t.id}
                    style={{
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        handleFileClick(t.id, i);
                        dispatch(toggleAutoPlay(true));
                        // audioRef?.current?.play();
                    }}
                >
                    <Typography variant="body2">
                        {t.metadata.artist} - {t.metadata.title}
                    </Typography>
                </ListItem>
            ))}
        </List>
    </div >;
    //#endregion
};

export default TracksPage;
