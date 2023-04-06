import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import Controller from './pages/Controller';
import Settings from './pages/Settings';

document.body.addEventListener('contextmenu', function (e) { e.preventDefault(); return false; });

const router = createBrowserRouter([
  {
    path: "/",
    element: <Controller w={844} h={390}/>,
  },
  {
    path: "settings",
    element: <Settings/>
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
