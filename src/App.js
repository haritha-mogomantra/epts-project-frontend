import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CSpinner, useColorModes } from "@coreui/react";

import "./scss/style.scss";
import "./scss/examples.scss";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// layouts
const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"));

// pages
const Login = React.lazy(() => import("./views/pages/login/Login"));
const Register = React.lazy(() => import("./views/pages/register/Register"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));

const App = () => {
  // clear auth on login/root
  if (
    window.location.pathname === "/" ||
    window.location.pathname === "/login"
  ) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
  }

  useEffect(() => {
    if (window.location.pathname === "/login") {
      localStorage.clear();
    }
  }, []);

  const { isColorModeSet, setColorMode } = useColorModes(
    "Employee performance tracking system"
  );

  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme =
      urlParams.get("theme") &&
      urlParams.get("theme").match(/^[A-Za-z0-9\s]+/)[0];

    if (theme) setColorMode(theme);
    if (!isColorModeSet()) setColorMode(storedTheme);
  }, []);

  // protected route
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role")?.toLowerCase();

    if (!token) return <Navigate to="/login" replace />;
    if (allowedRoles && role && !allowedRoles.includes(role))
      return <Navigate to="/login" replace />;

    return children;
  };

  // root redirect
  const RootRedirect = () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role")?.toLowerCase();

    if (!token) return <Navigate to="/login" replace />;
    if (role === "employee")
      return <Navigate to="/employee-dashboard" replace />;

    return <Navigate to="/dashboard" replace />;
  };

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* root */}
          <Route index element={<RootRedirect />} />

          {/* auth pages – FULL SCREEN */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* error pages – FULL SCREEN */}
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

          {/* ✅ MASTER PAGE – FULL SCREEN */}
          <Route
            path="/pages/page404"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Page404 />
              </ProtectedRoute>
            }
          />

          {/* dashboard + sidebar */}
          <Route
            path="/*"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
                <DefaultLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
