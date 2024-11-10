import { createSlice } from "@reduxjs/toolkit";

export const UserEmptyState = {
  name: "",
  token: "",
  email: "",
  role: "",
  confirmed: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState: UserEmptyState,
  reducers: {
    createUser: (state, action) => action.payload,
    modifyUser: (state, action) => ({ ...state, ...action.payload }),
    resetUser: () => UserEmptyState,
  },
});

export const { createUser, modifyUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
