import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            main: "#E9B949",
        },
        background: {
            default: "#222222",
            paper: "#333333",
        },
        text: {
            primary: "#F4EAE6",
            secondary: "#ada6a3",
        }
    },
    typography: {
        allVariants: {
            color: "#F4EAE6",
        },
    },
});

export default theme;
