import { useDispatch } from "react-redux";
import { AppDispatch } from "../renderer/src/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
