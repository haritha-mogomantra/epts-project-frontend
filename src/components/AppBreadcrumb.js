import React from "react";
import { useLocation, Link } from "react-router-dom";
import routes from "../routes";
import "../scss/style.scss";

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname;

  // Directly find matching route (no folder names)
  const getRouteName = (pathname) => {
    const route = routes.find((r) => r.path === pathname);
    return route ? route.name : null;
  };

  const currentPage = getRouteName(currentLocation);

  return (
    <nav className="breadcrumb-container">
      <ul className="breadcrumb">
        {/* Always show Home */}
        <li>
          <Link to="/dashboard">Home</Link>
        </li>

        {/* Show only the final matching page */}
        {currentPage && (
          <li className="active">
            <span>{currentPage}</span>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default AppBreadcrumb;
