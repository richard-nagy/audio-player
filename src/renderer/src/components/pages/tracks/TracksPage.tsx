import { Button, List, ListItem, Theme, Typography, useTheme } from "@mui/material";
import { FC, ReactElement, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from "react-redux";

import { useAppDispatch } from "../../../../../common/hooks";
import { UserSettingKey } from "../../../../../main/types";
import { RootState } from "../../../store";
import { getPlaylistMap, getTrackMap } from "./trackSelectors";
import { fetchTracks, setPlaylistPosition, toggleAutoPlay } from "./tracksSlice";
import { TrackMetadata } from "./types";

const TracksPage: FC = (): ReactElement => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const dispatch = useAppDispatch();

    const tracks = useSelector((state: RootState) => state.track.tracks);
    const trackMap = useSelector((state: RootState) => getTrackMap(state));
    const playlistPosition = useSelector((state: RootState) => state.track.playlistPosition);
    const playlistMap = useSelector((state: RootState) => getPlaylistMap(state));
    const autoPlayIsOn = useSelector((state: RootState) => state.track.autoPlayIsOn);

    const audioRef = useRef<HTMLAudioElement>(null);

    const activeTrack = useMemo((): TrackMetadata | null =>
        trackMap.get(playlistMap.get(playlistPosition ?? -1)?.id ?? "") ?? null,
        [playlistMap, playlistPosition, trackMap]
    );
    //#endregion

    //#region Methods
    const handleFolderSelect = useCallback(async () => {
        dispatch(fetchTracks());
    }, [dispatch]);

    const handleFileClick = useCallback((_, position: number) => {
        // Stop the previous track
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Dispatch the action to fetch the track
        dispatch(setPlaylistPosition(position));

        window.electron.setSetting(UserSettingKey.PlaylistPosition, position);
    }, [dispatch]);
    //#endregion

    //#region UseEffects
    useEffect(() => {
        (async () => {
            const lastTrackNumber = await window.electron.getSetting(UserSettingKey.PlaylistPosition) as number;

            if (lastTrackNumber !== null && lastTrackNumber > -1) {
                dispatch((setPlaylistPosition(lastTrackNumber)));
            }
        })();
    }, [dispatch, playlistMap, tracks]);
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
            <><audio
                ref={audioRef}
                key={activeTrack?.url}
                style={{
                    minHeight: 50,
                }}
                controls
                autoPlay={autoPlayIsOn}
                onEnded={() => dispatch(setPlaylistPosition((playlistPosition ?? 0) + 1))}
            >
                {activeTrack &&
                    <source src={activeTrack?.url} />
                }
            </audio>
                <Button onClick={() => {
                    dispatch(toggleAutoPlay(true));
                    audioRef?.current?.play();
                }}>
                    play
                </Button>
                <Button onClick={() => {
                    dispatch(toggleAutoPlay(false));
                    audioRef?.current?.pause();
                }}>
                    stop
                </Button>
                <Button onClick={() => {
                    dispatch(toggleAutoPlay(true));
                    audioRef?.current?.play();
                    dispatch(setPlaylistPosition(
                        playlistPosition
                            ? playlistPosition + 1
                            : -1
                    ));
                }}>
                    next
                </Button>
                <Button onClick={() => {
                    dispatch(toggleAutoPlay(true));
                    audioRef?.current?.play();
                    if (audioRef?.current?.currentTime && audioRef.current.currentTime > 3) {
                        audioRef.current.currentTime = 0;
                        return;
                    }

                    dispatch(setPlaylistPosition(
                        playlistPosition
                            ? playlistPosition - 1
                            : -1
                    ));
                }}>
                    prev
                </Button>
            </>
        }
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
                        audioRef?.current?.play();
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
