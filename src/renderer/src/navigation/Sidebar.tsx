import { Button, Drawer, styled } from "@mui/material";
import { Dispatch, FC, ReactElement, SetStateAction } from 'react';
import { Page } from "./Types";

const SidebarButton = styled(Button)(() => ({
    borderRadius: 100,
    margin: "4px 10px",
    textTransform: "none",
    justifyContent: "flex-start",
    color: "white",
}));

interface SideBarProps {
    setActivePage: Dispatch<SetStateAction<Page>>;
}
const Sidebar: FC<SideBarProps> = (props: SideBarProps): ReactElement => {
    //#region Props and States
    const { setActivePage } = props;
    //#endregion

    //#region Methods
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
        <SidebarButton size="small" onClick={() => setActivePage(Page.Home)}>
            Home
        </SidebarButton>
        <SidebarButton size="small" disabled>
            Search
        </SidebarButton>
        <SidebarButton size="small" onClick={() => setActivePage(Page.Tracks)}>
            Tracks
        </SidebarButton>
        <SidebarButton size="small" onClick={() => setActivePage(Page.Albums)}>
            Albums
        </SidebarButton>
        <SidebarButton size="small" onClick={() => setActivePage(Page.Artists)}>
            Artists
        </SidebarButton>
    </Drawer>;
    //#endregion
};

export default Sidebar;
