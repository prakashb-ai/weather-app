import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "./App";
import weatherReducer from "./Components/WheatherSlice"; // Update path if needed
import './App.css'; // Import your global CSS

const store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
});

// Create a root element and render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
