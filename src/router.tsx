import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { DistrictPage } from "./pages/DistrictPage";
import { ItemDetailPage } from "./pages/ItemDetailPage";

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
    path: "/district/:districtId/item/:itemId",
    Component: ItemDetailPage,
  },
]);
