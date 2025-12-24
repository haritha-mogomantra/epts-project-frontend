/*
import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cilUser,
  cilSpeedometer,
  cilCursor,
} from "@coreui/icons";
import { CNavGroup, CNavItem } from "@coreui/react";

// Read role from localStorage
const role = (localStorage.getItem("role") || "").toLowerCase();

// ===============================
// NAV STRUCTURE (Clean Version)
// ===============================

// ADMIN MENU
const adminMenu = [
  {
    component: CNavGroup,
    name: "Admin",
    to: "",
    items: [
      {
        component: CNavItem,
        name: "Dashboard",
        to: "/dashboard",
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      },

      {
        component: CNavGroup,
        name: "Employee",
        to: "",
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: "Employee details",
            to: "/admin/employeedetails",
          },
          {
            component: CNavItem,
            name: "Employee Performance",
            to: "/admin/employeeperformance",
          },
          {
            component: CNavItem,
            name: "Employee credentials",
            to: "/admin/credentials",
          },
        ],
      },

      {
        component: CNavItem,
        name: "Reports",
        to: "/Reports",
        icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
      },
    ],
  },
];

// EMPLOYEE MENU
const employeeMenu = [
  {
    component: CNavGroup,
    name: "Employee",
    to: "",
    items: [
      {
        component: CNavGroup,
        name: "Employee Module",
        to: "",
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: "Employee Dashboard",
            to: "/admin/collapses",
          },
          {
            component: CNavItem,
            name: "Employee Performance",
            to: "/admin/carousels",
          },
        ],
      },
    ],
  },
];

// LOGIN (visible only for guests)
const loginMenu = [
  {
    component: CNavItem,
    name: "Login",
    to: "/login",
  },
];

// ===============================
// FINAL ROLE-adminD MENU OUTPUT
// ===============================
let _nav = [];

if (role === "admin") _nav = [...adminMenu];
else if (role === "employee") _nav = [...employeeMenu];
else _nav = [...loginMenu];

export default _nav;
*/

import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cilUser,
  cilSpeedometer,
  cilCursor,
  cilAddressBook,   // Employee Details
  cilChartLine,     // Employee Performance
  cilLockLocked     // Employee Credentials
} from "@coreui/icons";

import { CNavItem } from "@coreui/react";

// Read role from localStorage
const role = (localStorage.getItem("role") || "").toLowerCase();

// ===============================
// ADMIN MENU (FLAT STYLE LIKE FRIEND)
// ===============================
const adminMenu = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/dashboard",
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Employee Details",
    to: "/admin/employeedetails",       // ✅ your correct route
    icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Employee Performance",
    to: "/admin/employeeperformance",   // ✅ your correct route
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Employee Credentials",
    to: "/admin/credentials",                 // ✅ your correct route
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Reports",
    to: "/Reports",

     icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Master",
    to: "/pages/page404",
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
  },
  
];

// ===============================
// EMPLOYEE MENU (FLAT STYLE)
// ===============================
const employeeMenu = [
  {
    component: CNavItem,
    name: "Employee Dashboard",
    to: "/admin/collapses",   // your actual dashboard route
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Employee Performance",
    to: "/admin/carousels",
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  },
];

// ===============================
// LOGIN MENU
// ===============================
const loginMenu = [
  {
    component: CNavItem,
    name: "Login",
    to: "/login",
  },
];

// ===============================
// FINAL ROLE-adminD MENU OUTPUT
// ===============================
let _nav = [];

if (role === "admin") _nav = [...adminMenu];
else if (role === "employee") _nav = [...employeeMenu];
else _nav = [...loginMenu];

export default _nav;
