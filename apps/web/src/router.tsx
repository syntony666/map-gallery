import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { DistrictPage } from "./pages/DistrictPage";
import { PhotoDetailPage } from "./pages/PhotoDetailPage";
import { PhotoEditPage } from "./pages/PhotoEditPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/district/:districtId",
    Component: DistrictPage,
  },
  {
    path: "/district/:districtId/photo/new",
    Component: PhotoEditPage,
  },
  {
    path: "/district/:districtId/photo/:photoId",
    Component: PhotoDetailPage,
  },
  {
    path: "/district/:districtId/photo/:photoId/edit",
    Component: PhotoEditPage,
  },
]);