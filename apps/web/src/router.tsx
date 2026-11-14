import {
  createBrowserRouter,
  type NavigateOptions,
  type To,
} from "react-router";
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

/* Every navigation crossfades through the View Transitions API; the
   router no-ops the flag on browsers without support, and history
   pops (back/forward) bypass navigate() by design. */
const rawNavigate = router.navigate.bind(router);
router.navigate = ((to: To | number, opts?: NavigateOptions) =>
  typeof to === "number"
    ? rawNavigate(to)
    : rawNavigate(to, { ...opts, viewTransition: opts?.viewTransition ?? true })) as
  typeof router.navigate;
