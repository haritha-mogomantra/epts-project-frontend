import React, { Suspense, useEffect } from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CSpinner, useColorModes } from "@coreui/react";
import "./scss/style.scss";
import "./scss/examples.scss";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"));
const Login = React.lazy(() => import("./views/pages/login/Login"));
const Register = React.lazy(() => import("./views/pages/register/Register"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));

const App = () => {

  // Clear all tokens when opening login page (prevents auto-redirect to dashboard)
  if (
    window.location.hash === "" ||            // First time app loads
    window.location.hash === "#/" ||          // Root route
    window.location.hash === "#/login"        // Login route
  ) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
  }

  React.useEffect(() => {
    const checkLoginRoute = () => {
      if (window.location.hash === "#/login") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");
      }
    };

    checkLoginRoute();
    window.addEventListener("hashchange", checkLoginRoute);
    return () => window.removeEventListener("hashchange", checkLoginRoute);
  }, []);


  const { isColorModeSet, setColorMode } = useColorModes(
    "Employee performance tracking system"
  );
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split("?")[1]);
    const theme =
      urlParams.get("theme") &&
      urlParams.get("theme").match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }

    if (isColorModeSet()) return;

    setColorMode(storedTheme);
  }, []);

  //  ProtectedRoute
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role")?.toLowerCase();

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  const RootRedirect = () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role")?.toLowerCase();

    // Not logged in → go to login
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    // Logged in employee
    if (role === "employee") {
      return <Navigate to="/employee-dashboard" replace />;
    }

    // Logged in admin / manager
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route index element={<RootRedirect />} />

          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/404" element={<Page404 />} />
          <Route exact path="/500" element={<Page500 />} />

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
    </HashRouter>
  );
};

export default App;