import { Slider, Theme, useTheme } from "@mui/material";
import { FC, ReactElement, useCallback, useEffect, useState } from 'react';

interface StyledSliderProps {
    onChange: (value: number) => void;
    max: number;
    defaultValue: number;
    value?: number;
}
const StyledSlider: FC<StyledSliderProps> = (props: StyledSliderProps): ReactElement => {
    //#region Props and States
    const { max, defaultValue, value: valueProps, onChange } = props;

    const [value, setValue] = useState(defaultValue);

    const theme = useTheme<Theme>();
    //#endregion

    //#region Methods
    const handleChange = useCallback((_: Event, value: number | number[]) => {
        if (typeof value === "number") {
            setValue(value);
            onChange(value);
        }
    }, [onChange]);
    //#endregion

    //#region useEffects
    useEffect(() => {
        if (valueProps !== undefined) {
            setValue(valueProps);
        }
    }, [valueProps]);
    //#endregion

    //#region Render
    return <Slider
        min={0}
        max={max}
        value={value}
        sx={{
            width: 100,
            height: 4,
            "& .MuiSlider-track": {
                height: 4,
            },
            "& .MuiSlider-rail": {
                height: 4,
                backgroundColor: theme.palette.text.secondary,
            },
            "& .MuiSlider-thumb": {
                opacity: 0,
                width: 16,
                height: 16,
                boxShadow: "none"
            },
            "& .MuiSlider-thumb:hover": {
                color: theme.palette.text.primary,
                opacity: 1,
            },
        }}
        onChange={handleChange}
    />;
    //#endregion
};

export default StyledSlider;
