import { Box, CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../common/hooks";
import Sidebar from "./navigation/Sidebar";
import { Page } from "./navigation/Types";
import AlbumsPage from "./pages/albums/AlbumsPage";
import ArtistsPage from "./pages/artists/ArtistsPage";
import HomePage from "./pages/home/HomePage";
import { initialFetchTracks } from "./pages/tracks/trackActionAndReducer";
import TracksPage from "./pages/tracks/TracksPage";

const App = () => {
    //#region Props and States
    const dispatch = useAppDispatch();

    const [activePage, setActivePage] = useState<Page>(Page.Home);
    //#endregion

    //#region Effects
    useEffect(() => {
        window.electron.getSetting<string[]>("selectedFolderPaths").then((selectedFolderPaths) => {
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
