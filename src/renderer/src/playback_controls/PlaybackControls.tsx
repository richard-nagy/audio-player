import { AppBar, Button, Theme, Toolbar, Typography, useTheme } from "@mui/material";
import { FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../common/hooks";
import { getPlaylistMap, getTrackMap } from "../components/pages/tracks/trackSelectors";
import { setPlaylistPosition, toggleAutoPlay } from "../components/pages/tracks/tracksSlice";
import { TrackMetadata } from "../components/pages/tracks/types";
import { RootState } from "../store";
import StyledSlider from "./StyledSlider";

const PlaybackControl: FC = (): ReactElement => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const dispatch = useAppDispatch();

    const autoPlayIsOn = useSelector((state: RootState) => state.track.autoPlayIsOn);
    const trackMap = useSelector((state: RootState) => getTrackMap(state));
    const playlistPosition = useSelector((state: RootState) => state.track.playlistPosition);
    const playlistMap = useSelector((state: RootState) => getPlaylistMap(state));

    const [time, setTime] = useState(0);
    // const [volume, setVolume] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    const currentTime = () => audioRef?.current?.currentTime ?? 0;
    const currentVolume = () => audioRef?.current?.volume ?? 0;

    const activeTrack = useMemo((): TrackMetadata | null =>
        trackMap.get(playlistMap.get(playlistPosition ?? -1)?.id ?? "") ?? null,
        [playlistMap, playlistPosition, trackMap]
    );
    //#endregion

    //#region Methods
    const setCurrentTime = (value: number) => {
        if (audioRef?.current?.currentTime) {
            audioRef.current.currentTime = value;
            setTime(value);
        }
    };

    const setCurrentVolume = (value: number) => {
        if (audioRef?.current?.volume) {
            audioRef.current.volume = value;
        }
    };

    const play = useCallback(() => {
        if (audioRef?.current) {
            audioRef.current.play();
            dispatch(toggleAutoPlay(true));
        }
    }, [dispatch]);

    const pause = useCallback(() => {
        if (audioRef?.current) {
            audioRef.current.pause();
            dispatch(toggleAutoPlay(false));
        }
    }, [dispatch, audioRef]);

    //#region Handlers
    const onVolumeChange = useCallback((value => {
        setCurrentVolume(value / 100);
    }), []);

    const onPlayButtonClick = useCallback(() =>
        autoPlayIsOn
            ? pause()
            : play(),
        [autoPlayIsOn, pause, play]
    );

    const onNextClick = useCallback(() => {
        play();
        setCurrentTime(0);
        dispatch(setPlaylistPosition(
            playlistPosition
                ? playlistPosition + 1
                : -1
        ));
    }, [dispatch, play, playlistPosition]);

    const onPrevClick = useCallback(() => {
        play();
        if (currentTime() > 3) {
            setCurrentTime(0);
            return;
        }

        dispatch(setPlaylistPosition(
            playlistPosition
                ? playlistPosition - 1
                : -1
        ));
    }, [dispatch, play, playlistPosition]);

    const onAudioEnd = useCallback(() => {
        dispatch(setPlaylistPosition((playlistPosition ?? 0) + 1));
    }, [dispatch, playlistPosition]);
    //#endregion
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
            clearInterval(timer);
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
                maxHeight: 0,
                maxWidth: 0,
            }}
            controls
            autoPlay={autoPlayIsOn}
            onEnded={onAudioEnd}
        >
            {activeTrack &&
                <source src={activeTrack?.url} />
            }
        </audio>
        <Button onClick={onPlayButtonClick}>
            {autoPlayIsOn
                ? "stop"
                : "play"
            }
        </Button>
        <Button onClick={onNextClick}>
            next
        </Button>
        <Button onClick={onPrevClick}>
            prev
        </Button>
        {time} - {activeTrack?.metadata.duration.toFixed(0) ?? 0}
        <Toolbar>
            track
            <StyledSlider
                max={activeTrack?.metadata.duration ?? 0}
                defaultValue={0}
                value={time}
                onChange={setCurrentTime}
            />
            volume
            <StyledSlider
                max={100}
                defaultValue={50}
                value={currentVolume()}
                onChange={onVolumeChange}
            />
        </Toolbar>
    </AppBar>;
    //#endregion
};

export default PlaybackControl;
