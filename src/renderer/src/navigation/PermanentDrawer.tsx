import { Button, Drawer, styled } from "@mui/material";
import { FC, ReactElement } from 'react';

const DrawerButton = styled(Button)(() => ({
    borderRadius: 100,
    margin: "4px 10px",
    textTransform: "none",
    justifyContent: "flex-start",
    color: "white",
}));

const PermanentDrawer: FC = (): ReactElement => {
    //#region Props and States
    //#endregion

    //#region Methods
    //#endregion

    //#region useEffects
    //#endregion

    //#region Render
    return <Drawer
        sx={{
            width: 200,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: 200,
                boxSizing: 'border-box',
            },
        }}
        variant="permanent"
        anchor="left"
    >
        <DrawerButton size="small">
            All songs
        </DrawerButton>
        <DrawerButton size="small">
            Albums
        </DrawerButton>
        <DrawerButton size="small">
            Artists
        </DrawerButton>
    </Drawer >;
    //#endregion
};

export default PermanentDrawer;
