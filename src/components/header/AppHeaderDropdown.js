import React from "react";
import { Link } from "react-router-dom";
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from "@coreui/react";

const AppHeaderDropdown = ({ userRole }) => {
  const first = localStorage.getItem("first_name") || "";
  const last = localStorage.getItem("last_name") || "";
  const fullName = `${first} ${last}`.trim() || "User";
  const role = (localStorage.getItem("role") || "").toLowerCase();

  return (
    <CDropdown variant="nav-item" placement="bottom-end">
      <CDropdownToggle caret className="fw-bold text-black">
        {fullName}
      </CDropdownToggle>

      <CDropdownMenu className="pt-2">
        <CDropdownItem
          as={Link}
          to={role === "admin" ? "/pages/profile" : "/pages/employeeprofile"}
        >
          <i className="bi bi-person-circle me-2"></i> Profile
        </CDropdownItem>

        <CDropdownItem as={Link} to="/pages/change-password">
          <i className="bi bi-key me-2"></i> Change Password
        </CDropdownItem>

        <CDropdownItem
          as="button"
          className="text-danger"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/#/login";
          }}
        >
          <i className="bi bi-box-arrow-right me-2 text-danger"></i> Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;


/*
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const AppHeaderDropdown = ({ userRole }) => {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  // Your format: first_name + last_name
  const first = localStorage.getItem("first_name") || "";
  const last = localStorage.getItem("last_name") || "";
  const fullName = `${first} ${last}`.trim() || "User";

  const role = (localStorage.getItem("role") || "").toLowerCase();

  return (
    <div className="dropdown text-end">
      <button
        className="btn btn-link text-decoration-none text-dark dropdown-toggle fw-semibold"
        type="button"
        id="headerDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {fullName}
      </button>

      <ul
        className="dropdown-menu dropdown-menu-end shadow"
        aria-labelledby="headerDropdown"
      >
        <li>
          <Link
            className="dropdown-item"
            to={role === "admin" ? "/pages/profile" : "/pages/employeeprofile"}
          >
            <i className="bi bi-person-circle me-2"></i> Profile
          </Link>
        </li>

        <li>
          <Link className="dropdown-item" to="/pages/change-password">
            <i className="bi bi-key me-2"></i>Change Password
          </Link>
        </li>

        <li>
          <button
            className="dropdown-item text-danger"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            <i className="bi bi-box-arrow-right me-2 text-danger"></i> Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AppHeaderDropdown;
*/