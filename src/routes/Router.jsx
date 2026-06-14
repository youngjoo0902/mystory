import { createHashRouter } from "react-router-dom";

const router = createHashRouter([
  {
    lazy: () =>
    import("../layouts/DefaultLayout").then(module => ({Component: module.default,})),
    children: [
      {
        path: "/",
        lazy: () => import("../pages/Main").then(module => ({Component: module.default,})),
      },
      {
        path: "/about",
        lazy: () => import("../pages/About").then(module => ({Component: module.default,})),
      },
      {
        path: "/memo",
        lazy: () => import("../pages/Memo").then(module => ({Component: module.default,})),
      },
      {
        path: "/story",
        lazy: () => import("../pages/Story").then(module => ({Component: module.default,})),
      },
      {
        path: "/community",
        lazy: () => import("../pages/Community").then(module => ({Component: module.default,})),
      },
      {
        path: "/guest",
        lazy: () => import("../pages/Guest").then(module => ({Component: module.default,})),
      },
      {
        path: "/login",
        lazy: () => import("../pages/Login").then(module => ({Component: module.default,})),
      },
      {
        path: "/join",
        lazy: () => import("../pages/Join").then(module => ({Component: module.default,})),
      },
    ],
  },
  {
    lazy: () =>
      import("../layouts/EmptyLayout").then(module => ({Component: module.default,})),
      children: [
        // 필요 시 popup 같은 것
      ],
  },
]);

export default router;