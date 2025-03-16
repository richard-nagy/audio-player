import { Theme, useTheme } from "@mui/material/styles";
import { useCallback, useState } from 'react';

const App = () => {
    const theme = useTheme<Theme>();
    const [folderPath, setFolderPath] = useState<string | null>(null);

    const handleOpenFolder = useCallback(async () => {
        try {
            //@ts-ignore
            const path = await window.electron.openFolder();
            setFolderPath(path);
        } catch (error) {
            console.error('Failed to open folder:', error);
        }
    }, []);

    return <div style={{
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }}>
        <div>
            <button onClick={handleOpenFolder}>Select Folder</button>
            {folderPath}
        </div></div >;
};

export default App;
