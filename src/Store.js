import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "./components/WheatherSlice"; // Update path if needed

const store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
});

export default store;
