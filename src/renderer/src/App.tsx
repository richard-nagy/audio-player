import { Box, CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../common/hooks";
import { UserSettingKey } from "../../main/types";
import AlbumsPage from "./components/pages/albums/AlbumsPage";
import ArtistsPage from "./components/pages/artists/ArtistsPage";
import HomePage from "./components/pages/home/HomePage";
import TracksPage from "./components/pages/tracks/TracksPage";
import { initialFetchTracks } from "./components/pages/tracks/tracksSlice";
import Sidebar from "./components/sidebar/Sidebar";
import { Page } from "./components/sidebar/Types";

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
    </Box>;
    //#endregion
};

export default App;
