import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { AreaPage } from "./pages/AreaPage";
import { PhotoDetailPage } from "./pages/PhotoDetailPage";
import { PhotoEditPage } from "./pages/PhotoEditPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/area/:areaId",
    Component: AreaPage,
  },
  {
    path: "/area/:areaId/photo/new",
    Component: PhotoEditPage,
  },
  {
    path: "/area/:areaId/photo/:photoId",
    Component: PhotoDetailPage,
  },
  {
    path: "/area/:areaId/photo/:photoId/edit",
    Component: PhotoEditPage,
  },
]);