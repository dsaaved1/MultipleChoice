import { createSlice } from "@reduxjs/toolkit";

const groupSlice = createSlice({
    name: "groups",
    initialState: {
        groupsData: {}
    },
    reducers: {
        setGroupsData: (state, action) => {
            state.groupsData = { ...action.payload.groupsData };
        }
    }
});
export const setGroupsData = groupSlice.actions.setGroupsData;
export default groupSlice.reducer;