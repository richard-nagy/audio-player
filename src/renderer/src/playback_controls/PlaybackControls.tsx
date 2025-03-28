import { AppBar, Button, Theme, Toolbar, Typography, useTheme } from "@mui/material";
import { FC, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../common/hooks";
import { getPlaylistMap, getTrackMap } from "../components/pages/tracks/trackSelectors";
import { setPlaylistPosition, toggleAutoPlay } from "../components/pages/tracks/tracksSlice";
import { TrackMetadata } from "../components/pages/tracks/types";
import { RootState } from "../store";
import StyledSlider from "./StyledSlider";

// TODO: Move playing related controls here
// TODO: Create sound and progression bar as well for the audio
// TODO: render audio player, here, but hide it.
const PlaybackControl: FC = (): ReactElement => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const dispatch = useAppDispatch();

    const autoPlayIsOn = useSelector((state: RootState) => state.track.autoPlayIsOn);
    const trackMap = useSelector((state: RootState) => getTrackMap(state));
    const playlistPosition = useSelector((state: RootState) => state.track.playlistPosition);
    const playlistMap = useSelector((state: RootState) => getPlaylistMap(state));
    const [time, setTime] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    const activeTrack = useMemo((): TrackMetadata | null =>
        trackMap.get(playlistMap.get(playlistPosition ?? -1)?.id ?? "") ?? null,
        [playlistMap, playlistPosition, trackMap]
    );
    //#endregion

    //#region Methods
    //#endregion

    //#region useEffects
    useEffect(() => {
        let timer;
        if (autoPlayIsOn) {
            timer = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }

        return () => {
            clearInterval(timer); // Clean up the timer on unmount or when isActive changes
        };
    }, [autoPlayIsOn]);
    //#endregion

    //#region Render
    return <AppBar sx={{
        left: 200,
        top: 'auto',
        bottom: 0,
        backgroundColor: theme.palette.background.paper,
    }}>
        <Typography variant="body1">
            {activeTrack?.metadata.artist + " - " + activeTrack?.metadata.title}
        </Typography>
        <audio
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
            if (autoPlayIsOn) {
                dispatch(toggleAutoPlay(false));
                audioRef?.current?.pause();
            } else {
                dispatch(toggleAutoPlay(true));
                audioRef?.current?.play();
            }
        }}>
            {autoPlayIsOn
                ? "stop"
                : "play"
            }
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
        {time} - {activeTrack?.metadata.duration.toFixed(0) ?? 0}
        <Toolbar>
            track
            <StyledSlider
                max={activeTrack?.metadata.duration ?? 0}
                defaultValue={0}
                value={time}
                onChange={(value) => {
                    if (audioRef?.current?.currentTime !== undefined) {
                        audioRef.current.currentTime = value;
                        setTime(value);
                    }
                }}
            />
            volume
            <StyledSlider
                max={100}
                defaultValue={50}
                onChange={(value => {
                    if (audioRef?.current?.volume !== undefined) {
                        audioRef.current.volume = value / 100;
                    }
                })}
            />
        </Toolbar>
    </AppBar>;
    //#endregion
};

export default PlaybackControl;
