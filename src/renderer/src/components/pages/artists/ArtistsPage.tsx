import { Button, List, ListItem, Theme, Typography, useTheme } from "@mui/material";
import { FC, ReactElement, useCallback } from 'react';
import { useSelector } from "react-redux";
import { fetchTracks } from "../tracks/tracksSlice";
import { getArtists } from "../tracks/trackSelectors";
import { useAppDispatch } from "../../../../../common/hooks";
import { RootState } from "../../../store";

const ArtistsPage: FC = (): ReactElement => {
    //#region Props and States
    const theme = useTheme<Theme>();
    const dispatch = useAppDispatch();

    const artists = useSelector((state: RootState) => getArtists(state));
    //#endregion

    //#region Methods
    const handleFolderSelect = useCallback(async () => {
        dispatch(fetchTracks());
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
        </List>
    </div>;
    //#endregion
};

export default ArtistsPage;
