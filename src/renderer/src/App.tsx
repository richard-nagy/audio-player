import { Box, CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../common/hooks";
import AlbumsPage from "./pages/albums/AlbumsPage";
import ArtistsPage from "./pages/artists/ArtistsPage";
import { initialFetchTracks } from "./pages/tracks/trackActionAndReducer";
import TracksPage from "./pages/tracks/TracksPage";
import HomePage from "./pages/home/HomePage";
import Sidebar from "./navigation/Sidebar";
import { Page } from "./navigation/Types";

const App = () => {
    //#region Props and States
    const dispatch = useAppDispatch();

    const [activePage, setActivePage] = useState<Page>(Page.Home);
    //#endregion

    //#region Effects
    useEffect(() => {
        window.electron.ipcRenderer.on("set-files", (_, files) => {
            if (files.length > 0) {
                dispatch(initialFetchTracks(files));
            }
        });

        return () => {
            window.electron.ipcRenderer.removeAllListeners("set-files");
        };
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
