import { Box, CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../common/hooks";
import { UserSettingKey } from "../../main/types";
import AlbumsPage from "./components/pages/albums/AlbumsPage";
import ArtistsPage from "./components/pages/artists/ArtistsPage";
import HomePage from "./components/pages/home/HomePage";
import TracksPage from "./components/pages/tracks/TracksPage";
import { initialFetchTracks, setPlaylistPosition } from "./components/pages/tracks/tracksSlice";
import Sidebar from "./components/sidebar/Sidebar";
import { Page } from "./components/sidebar/Types";
import PlaybackControl from "./playback_controls/PlaybackControls";

const App = () => {
    //#region Props and States
    const dispatch = useAppDispatch();

    const [activePage, setActivePage] = useState<Page>(Page.Home);
    //#endregion

    //#region Effects
    useEffect(() => {
        window.electron.getSetting<string[]>(UserSettingKey.SelectedFolderPaths).then((selectedFolderPaths) => {
            dispatch(initialFetchTracks(selectedFolderPaths[0]));
        });
    }, [dispatch]);

    useEffect(() => {
        (async () => {
            const lastTrackNumber = await window.electron.getSetting(UserSettingKey.PlaylistPosition) as number;

            if (lastTrackNumber !== null && lastTrackNumber > -1) {
                dispatch((setPlaylistPosition(lastTrackNumber)));
            }
        })();
    }, [dispatch]);
    //#endregion

    //#region Render
    return <Box sx={{ display: 'flex', width: "100%" }}>
        <CssBaseline />
        <Sidebar setActivePage={setActivePage} />
        <Box style={{ width: "100%" }}>
            {
                activePage === Page.Home &&
                <HomePage />
            }
            {
                activePage === Page.Tracks &&
                <TracksPage />
            }
            {
                activePage === Page.Albums &&
                <AlbumsPage />
            }
            {
                activePage === Page.Artists &&
                <ArtistsPage />
            }
        </Box>
        <PlaybackControl />
    </Box>;
    //#endregion
};

export default App;
