import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Chat from "./app/Chat";
import Home from "./app/Home";
import Profile from "./app/Profile";
import Room, { Welcome } from "./app/Room";
import Error from "./Error";
import Login from "./guest/Login";
import Tfa from "./guest/Tfa";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
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
