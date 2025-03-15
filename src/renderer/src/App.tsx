import { Theme, Typography, useTheme } from "@mui/material";
import './global.css';

function App(): JSX.Element {
    const theme = useTheme<Theme>();

    return <div style={{
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }}>
        <Typography variant="h1">Audic!</Typography>
    </div>;
}

export default App;
