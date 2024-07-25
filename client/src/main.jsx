import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/music",
    element: <Home />,
  },
  {
    path: "/results",
    element: <Results />,
  },
  {
    path: "/callback",
    element: <SpotifyCallback />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <RouterProvider router={router} />
  </React.StrictMode>,
)
