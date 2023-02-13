import { createSlice } from "@reduxjs/toolkit";

const convoSlice = createSlice({
    name: "convos",
    initialState: {
        convosData: {},
    },
    reducers: {
        setConvosData: (state, action) => {
            const existingConvos = state.convosData;

            const { chatId, convosData } = action.payload;

            existingConvos[chatId] = convosData;

            state.convosData = existingConvos;
        }
    }
});
export const {  setConvosData } = convoSlice.actions;
export default convoSlice.reducer;