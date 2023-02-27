import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MantineProvider } from "@mantine/core";
import { router } from "./router";
import "./index.scss";
import { ModalsProvider } from "@mantine/modals";
import { NewGame } from "./components/Games/New";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <RouterProvider router={router} />
    </MantineProvider>
    <Toaster />
  </>
);
