import { Box, CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../common/hooks";
import AlbumsPage from "./albums/AlbumsPage";
import ArtistsPage from "./artists/ArtistsPage";
import { initialFetchAudios } from "./audio/audioActionAndReducer";
import TracksPage from "./audio/TracksPage";
import HomePage from "./home/HomePage";
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
