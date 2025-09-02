import React from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App.jsx"
import CustomerListPage from "./pages/customer-list-page.jsx"
import CustomerFormPage from "./pages/customer-form-page.jsx"
import CustomerDetailPage from "./pages/customer-detail-page.jsx"
import "./styles.css"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <CustomerListPage /> },
      { path: "customers/new", element: <CustomerFormPage /> },
      { path: "customers/:id/edit", element: <CustomerFormPage /> },
      { path: "customers/:id", element: <CustomerDetailPage /> },
    ],
  },
])

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
