import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import "./index.css";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import End from "./pages/End";

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/lobby", element: <Lobby /> },
  { path: "/game", element: <Game /> },
  { path: "/end", element: <End /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
