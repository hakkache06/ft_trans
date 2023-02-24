import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./app/Home";
import ErrorPage from "./Error";
import "./index.scss";
import App from "./App";
import Login from "./guest/Login";
import { Toaster } from "react-hot-toast";
import Tfa from "./guest/Tfa";
import Profile from "./app/Profile";
import { MantineProvider } from "@mantine/core";
import Chat from "./app/Chat";
import Room, { Welcome } from "./app/Room";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/chat",
        element: <Chat />,
        children: [
          {
            index: true,
            element: <Welcome />,
          },
          {
            path: ":id",
            element: <Room />,
          },
        ],
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/tfa",
    element: <Tfa />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <RouterProvider router={router} />
    </MantineProvider>
    <Toaster />
  </>
);
