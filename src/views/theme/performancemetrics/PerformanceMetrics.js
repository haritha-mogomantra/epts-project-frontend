import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { CTooltip } from "@coreui/react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const weekInputStyle = {
  fontFamily: "Segoe UI, Arial, sans-serif",
  fontSize: "14px",
  fontWeight: "400",
  color: "#212529",
};

const readOnlyStyle = {
  backgroundColor: "#e9ecef",
  pointerEvents: "none",
};


const getISOWeek = (date) => {
  const temp = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  temp.setDate(temp.getDate() - dayNumber + 3);

  const firstThursday = temp.valueOf();
  temp.setMonth(0, 1);

  const week =
    Math.ceil((((firstThursday - temp) / 86400000) + temp.getDay() + 1) / 7);

  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
};


// Format week as "Week 48 (24 Nov - 30 Nov 2025)"
const formatWeekRange = (weekValue) => {
  if (!weekValue) return "";

  const [year, w] = weekValue.split("-W");
  const week = Number(w);

  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = new Date(simple);

  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - dow + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - dow);

  const ISOweekEnd = new Date(ISOweekStart);
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6);

  const fmt = { day: "numeric", month: "short" };
  return `Week ${week} (${ISOweekStart.toLocaleDateString("en-GB", fmt)} - ${ISOweekEnd.toLocaleDateString("en-GB", fmt)} ${year})`;
};

const PerformanceMetrics = () => {
  const [selectedWeek, setSelectedWeek] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [viewEmployeeId, setViewEmployeeId] = useState("");
  const [employeeData, setEmployeeData] = useState({
    name: "",
    department: "",
    manager: "",
    weeklyCalendar: "",
    presentDate: "",
  });

  const [evaluationId, setEvaluationId] = useState(null);
  const [scores, setScores] = useState([]);
  const [comments, setComments] = useState([]);
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState({
    search: false,
    submit: false,
    print: false,
  });
  const [performanceList, setPerformanceList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [scoreError, setScoreError] = useState("");
  const [showNoEmployeeAlert, setShowNoEmployeeAlert] = useState(false);

  // NEW unified validation modal (industry standard)
  const [validationModal, setValidationModal] = useState({
    show: false,
    message: "",
  });



  const [measurements, setMeasurements] = useState([
    "Communication Skills",
    "Multi Tasking Abilities",
    "Team Skills",
    "Technical Skills",
    "Job Knowledge",
    "Productivity",
    "Creativity",
    "Work Quality",
    "Professionalism",
    "Work Consistency",
    "Attitude",
    "Cooperation",
    "Dependability",
    "Attendance",
    "Punctuality",
  ]);

  const navigate = useNavigate();
  const printRef = useRef(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { employee, mode, selectedWeek: navigatedWeek } = location.state || {};



  useEffect(() => {
    if (navigatedWeek) {
      setSelectedWeek(navigatedWeek);
    }
  }, [navigatedWeek]);


  useEffect(() => {
    if (mode !== "add") return;

    const { year, week } = parseWeek(selectedWeek);
    if (!year || !week) {
      setEligibleEmployees([]);
      setFilteredEmployees([]);
      return;
    }

    axiosInstance
      .get(`/performance/eligible-employees/?week=${week}&year=${year}`)
      .then((res) => {
        const list = res.data || [];
        setEligibleEmployees(list);
        setFilteredEmployees([]);
      })
      .catch((err) => {
        console.error("Failed to load eligible employees", err);
        setEligibleEmployees([]);
        setFilteredEmployees([]);
      });
  }, [selectedWeek]);

  useEffect(() => {
    setShowNoEmployeeAlert(false);
  }, [selectedWeek]);

  useEffect(() => {
    if (mode !== "add") return;

    const { year, week } = parseWeek(selectedWeek);

    if (!year || !week) {
      setEligibleEmployees([]);
      setFilteredEmployees([]);
      return;
    }

    const loadEligible = async () => {
      try {
        const res = await axiosInstance.get(
          `/performance/eligible-employees/?week=${week}&year=${year}`
        );
        const list = res.data || [];
        setEligibleEmployees(list);

        // NEW: Show / auto-hide alert when zero employees
        if (list.length === 0) {
          setShowNoEmployeeAlert(true);

          // Auto hide after 5 seconds
          setTimeout(() => setShowNoEmployeeAlert(false), 5000);
        } else {
          setShowNoEmployeeAlert(false);
        }

        // Re-filter if user already typed something
        if (employeeId.trim()) {
          const value = employeeId.toUpperCase();
          setFilteredEmployees(
            list.filter(
              (emp) =>
                emp.emp_id.toUpperCase().includes(value) ||
                emp.full_name.toUpperCase().includes(value)
            )
          );
        }
      } catch (err) {
        console.error("Failed to load eligible employees:", err);
        setEligibleEmployees([]);
        setFilteredEmployees([]);
      }
    };

    loadEligible();
  }, [selectedWeek, mode]);


  // Keep fields editable ONLY in edit mode
  const [isReadOnly, setIsReadOnly] = useState(true);

  useEffect(() => {
    setIsReadOnly(mode == "view");
  }, [mode]);



  useEffect(() => {
    const fetchPerformanceList = async () => {
      try {
        const res = await axiosInstance.get("/performance/evaluations/");
        setPerformanceList(res.data || []);
      } catch (error) {
        console.error("Error fetching performance list:", error);
      }
    };

    fetchPerformanceList();
  }, []);

  const today = new Date();
  const maxWeek = getISOWeek(today);

  const prevWeek1 = new Date(today);
  prevWeek1.setDate(today.getDate() - 7);

  const prevWeek2 = new Date(today);
  prevWeek2.setDate(today.getDate() - 14);

  const minWeek = getISOWeek(prevWeek2);


  const parseWeek = (weekValue) => {
    if (!weekValue || !weekValue.includes("-W")) return { year: null, week: null };
    const [year, weekStr] = weekValue.split("-W");
    return { year: Number(year), week: Number(weekStr) };
  };


  useEffect(() => {
    if (!employee) return;

    const empId =
      employee.emp_id ||
      employee.employee_emp_id ||
      employee.user?.emp_id ||
      "";

    // always fill visible ID
    setViewEmployeeId(empId);

    // IMPORTANT: for edit mode, set employeeId so submit works
    if (mode === "edit") {
      setEmployeeId(empId);
    }

    setEmployeeData({
      name:
        employee.employee_name ||
        employee.full_name ||
        employee.user?.full_name ||
        "",
      department: employee.department_name || "",
      manager: employee.manager_name || employee.evaluator_name || "",
      designation: employee.designation || employee.role_name || employee.position || "",
    });
  }, [employee, mode]);

  useEffect(() => {
    if (mode === "view" && navigatedWeek) {
      setSelectedWeek(navigatedWeek);
    }
  }, [mode, navigatedWeek]);
  
  
  useEffect(() => {
    const loadEmployeeEvaluation = async () => {
      if (employee) {
        setLoading((prev) => ({ ...prev, page: true }));
        const empId = employee.user?.emp_id || employee.emp_id || employee.id;

        try {
          const evalId = location.state?.evaluation_id || null;

          if (!evalId) {
            console.error("Missing evaluation ID");
            return;
          }

          const res = await axiosInstance.get(`/performance/evaluations/${evalId}/`);


          const evalData = res.data;
          setEvaluationId(evalData.id);

          const metrics = evalData.metrics || {};


          const metricFields = [
            "communication_skills",
            "multitasking",
            "team_skills",
            "technical_skills",
            "job_knowledge",
            "productivity",
            "creativity",
            "work_quality",
            "professionalism",
            "work_consistency",
            "attitude",
            "cooperation",
            "dependability",
            "attendance",
            "punctuality",
          ];

          // Load scores
          setScores(metricFields.map(field => metrics[field] ?? ""));

          // Load comments
          setComments(
            metricFields.map(field => metrics[field + "_comment"] ?? "")
          );

          setEmployeeData({
            name:
              evalData.employee?.full_name ||
              evalData.employee?.user?.full_name ||
              "",
            department:
              evalData.employee?.department_name || "",
            manager:
              evalData.employee?.manager_name ||
              evalData.evaluator?.full_name || "",
            designation:
              evalData.employee?.designation ||
              evalData.employee?.role_name ||
              evalData.employee?.position ||
              "",
            rank: evalData.rank || "-",
          });

        } catch (error) {
          console.error("Error fetching existing evaluation:", error);
        } finally {
          setLoading((prev) => ({ ...prev, page: false }));
        }
      }
    };

    loadEmployeeEvaluation();
  }, [employee, location.state?.evaluation_id]);

  useEffect(() => {
    if (validationModal.show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
}, [validationModal.show]);

  const handleSearch = async () => {

    if (!employeeId) {
      setValidationModal({ show: true, message: "Please enter Employee ID." });
      return;
    }

    setLoading(prev => ({ ...prev, search: true }));

    const cleanEmpId = employeeId.trim().toUpperCase();

    const { year, week } = parseWeek(selectedWeek);

    if (!year || !week) {
      setDuplicateError("Please select a valid week before searching.");
      setLoading(prev => ({ ...prev, search: false }));
      return;
    }

    try {
      // 1️⃣ FIRST load employee details
      const empRes = await axiosInstance.get(`employee/employees/${cleanEmpId}/`);
      const emp = empRes.data;

      setEmployeeId(emp.emp_id);   // <-- FIX: ensures duplicate API receives correct ID
      setEmployeeData({
        name: emp.full_name || "",
        department: emp.department_name || "",
        manager: emp.manager_name || "Not Assigned",
      });

    } catch (error) {
      console.error("Duplicate check failed:", error);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  const handleChange = (e) => {
    setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
  };

  const handleScoreChange = (index, value) => {
    const updatedScores = [...scores];

    // Allow empty while typing
    if (value === "") {
      updatedScores[index] = "";
      setScores(updatedScores);
      return;
    }

    // Allow single zero
    if (value === "0") {
      updatedScores[index] = "0";
      setScores(updatedScores);
      return;
    }

    // Auto-remove leading zeros (e.g., 07 → 7, 050 → 50)
    if (value.length > 1 && value[0] === "0") {
      value = value.replace(/^0+/, "") || "0";
    }

    const num = Number(value);

    if (Number.isNaN(num) || num < 0) {
      setValidationModal({
        show: true,
        message: "Please enter a valid number between 0 and 100.",
      });
      return;
    }

    if (num > 100) {
      setValidationModal({
        show: true,
        message: "Score cannot exceed 100.",
      });
      return;
    }

    // Valid score
    updatedScores[index] = value;
    setScores(updatedScores);
  };


  // VALID EMP-ID format = EMP + 4 digits (EMP0001)
  const isValidEmpId = (value) => /^EMP\d{4}$/i.test(value.trim());

  // VALID NAME format = alphabets + spaces only
  const isValidName = (value) => /^[A-Za-z ]+$/.test(value.trim());

  // INVALID search input conditions → show dropdown alert
  const isInvalidSearchInput = (value) => {
    const v = value.trim();

    if (!v) return false;

    // If starts with EMP but not valid EMP0001 → invalid
    if (v.toUpperCase().startsWith("EMP") && !isValidEmpId(v)) {
      return true;
    }

    // If contains numbers / symbols → invalid
    if (!isValidEmpId(v) && !isValidName(v)) {
      return true;
    }

    return false;
  };

  const columns = ["Score", "Comments/Remarks"];

  const totalScore = scores
    .filter((s) => s !== "")
    .reduce((sum, val) => sum + Number(val), 0);
  const maxPossibleScore = measurements.length * 100;

  //PRINT HANDLER
  const handlePrint = () => {
    setLoading((prev) => ({ ...prev, print: true }));

    setTimeout(() => {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Employee Performance Review</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #000; }
              .report-header {
                background-color: #FFD700;
                color: #000;
                text-align: center;
                font-weight: bold;
                padding: 10px;
                font-size: 22px;
                border: 2px solid #000;
              }
              .section-title {
                background-color: #000;
                color: #fff;
                padding: 6px 10px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
                text-transform: uppercase;
              }
              .info-table td {
                padding: 4px 10px;
                vertical-align: middle;
                border: 1px solid #000;
              }
              .eval-table th, .eval-table td {
                border: 1px solid #000;
                text-align: center;
                font-size: 13px;
                padding: 6px;
              }
              .eval-table th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              .footer-summary td {
                background-color: #001f3f;
                color: white;
                font-weight: bold;
              }
              @media print {
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="report-header">EMPLOYEE PERFORMANCE REVIEW REPORT</div>

            <div class="section-title">Employee Details</div>
            <table class="table table-bordered info-table mb-3">
              <tr>
                <td><strong>Employee Name:</strong> ${employeeData.name || ""}</td>
                <td><strong>Employee ID:</strong> ${employeeId || viewEmployeeId || ""}</td>
                <td><strong>Department:</strong> ${employeeData.department || ""}</td>
                <td><strong>Manager Assigned:</strong> ${employeeData.manager || ""}</td>
              </tr>
              <tr>
                <td><strong>Review Week:</strong> ${formatWeekRange(selectedWeek)}</td>
                <td><strong>Review Date:</strong> ${new Date().toLocaleDateString()}</td>
                <td><strong>Designation:</strong> ${employeeData.designation || ""}</td>
              </tr>
            </table>

            <div class="section-title">Employee Performance Evaluation</div>
            <table class="table table-bordered eval-table mb-3">
              <thead>
                <tr>
                  <th>Measurement</th>
                  <th>Score</th>
                  <th>Comments / Remarks</th>
                </tr>
              </thead>

              <tbody>
                ${measurements
                  .map(
                    (m, i) => `
                      <tr>
                        <td>${m}</td>
                        <td>${scores[i] || ""}</td>
                        <td>${comments[i] || ""}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>

              <tfoot>
                <tr class="footer-summary">
                  <td>Total</td>
                  <td>${totalScore}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <div class="text-end mt-4">
              <strong>Total Score:</strong> ${totalScore} / ${maxPossibleScore}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      setLoading((prev) => ({ ...prev, print: false }));
    }, 600);
  };

  // 🔹 SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      setValidationModal({ show: true, message: "Please search and select an employee first." });
      return;
    }

    if (!employeeData.name) {
      setValidationModal({
        show: true,
        message: "Please search and load employee details before entering performance metrics."
      });
      return;
    }

    const allFilled =
      scores.length === 15 && scores.every((s) => s !== "" && s !== undefined);
    if (!allFilled) {
      setValidationModal({ show: true, message: "Please fill all performance metrics before submitting." });
      return;
    }

    const invalid = scores.some((s) => isNaN(s) || s < 0 || s > 100);
    if (invalid) {
      setValidationModal({ show: true, message: "All scores must be valid numbers between 0 and 100." });
      return;
    }

    const metricFields = [
      "communication_skills",
      "multitasking",
      "team_skills",
      "technical_skills",
      "job_knowledge",
      "productivity",
      "creativity",
      "work_quality",
      "professionalism",
      "work_consistency",
      "attitude",
      "cooperation",
      "dependability",
      "attendance",
      "punctuality",
    ];
    

    if (!selectedWeek) {
      setValidationModal({ show: true, message: "Please select a week for evaluation." });
      return;
    }

    const { year, week } = parseWeek(selectedWeek);

    const payload = {
      employee: employeeId.trim(),
      evaluation_type: "Manager",
      year: year,
      week_number: week, 
      review_date: new Date().toISOString().slice(0, 10),
      remarks: "",
    };


    const metrics = {};
    metricFields.forEach((field, idx) => {
      metrics[field] = Number(scores[idx]);
    });
    // add comments
    metricFields.forEach((field, idx) => {
      metrics[field + "_comment"] = comments[idx] || "";
    });


    payload.metrics = metrics;
    payload.total_score = Object.values(metrics).reduce((sum, val) => sum + (val || 0), 0);


    setLoading((prev) => ({ ...prev, submit: true }));

    try {
      let res;
      if (evaluationId && mode === "edit") {
        // Update existing evaluation (Edit mode)
        res = await axiosInstance.put(`performance/evaluations/${evaluationId}/`, payload);
      } else {
        // Create new evaluation (Add mode)
        res = await axiosInstance.post("performance/evaluations/", payload);
      }


      if (res.status === 201 || res.status === 200) {
        setSuccessMessage(
          mode === "edit"
            ? "Evaluation updated successfully."
            : "Evaluation submitted successfully."
        );

        // AUTO-HIDE
        setTimeout(() => setSuccessMessage(""), 4000);

        // SCROLL TO TOP
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Redirect after 1.2s
        setTimeout(() => {
          navigate("/base/employeeperformance", {
            state: { returnWeek: selectedWeek }
          });
        }, 1200);
      } else {
        console.log("Server responded:", res.status, res.data);
        setValidationModal({ show: true, message: "Unexpected server response. Try again." });
        return;
      }
    } catch (err) {
      console.error("Submit error:", err.response || err);

      // Try to extract a meaningful message from backend
      let serverMsg =
        err.response?.data?.error ||                         // from create() IntegrityError handler
        err.response?.data?.message ||                       // if we ever send {"message": "..."}
        (Array.isArray(err.response?.data?.non_field_errors)
          ? err.response.data.non_field_errors[0]
          : null) ||
        err.response?.data?.detail ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : "") ||
        err.message ||
        "Submission failed. Please try again later.";

      // If the backend says it's a duplicate, mark it as such
      if (serverMsg.toLowerCase().includes("already exists")) {
        setDuplicateError(serverMsg);
      }

      setValidationModal({
        show: true,
        message: serverMsg,
      });
      return;
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // 🔹 CANCEL HANDLER — reset only scores + comments
  const handleCancel = () => {
    setScores(Array(measurements.length).fill(""));
    setComments(Array(measurements.length).fill(""));
  };


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilteredEmployees([]); // close dropdown
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div className="container mt-0">
      <style>
      {`
      input[type="week"] {
        color: #212529 !important;
      }

      input[type="week"]::-webkit-datetime-edit {
        color: #212529 !important;
      }

      input[type="week"]::-webkit-datetime-edit-text {
        color: #212529 !important;
      }

      input[type="week"]::-webkit-datetime-edit-year-field,
      input[type="week"]::-webkit-datetime-edit-week-field {
        color: #212529 !important;
      }
      `}
      </style>
      <div className="d-flex justify-content-between text-black">
        <h5>EMPLOYEE PERFORMANCE METRICS</h5>
      </div>
      {/* Week-based info alert (Dismissible + Auto fade) */}
      {showNoEmployeeAlert && (
        <div
          className="alert alert-info d-flex justify-content-between align-items-center shadow-sm fade show"
          style={{
            fontSize: "14px",
            borderRadius: "6px",
            marginBottom: "10px",
            transition: "opacity 0.4s ease-in-out",
          }}
        >
          <span>
            <i className="bi bi-info-circle-fill me-2"></i>
            No employees are available for this week.
          </span>

          {/* Close button */}
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowNoEmployeeAlert(false)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="card">
        {successMessage && (
          <div className="px-3 pt-3">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {successMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage("")}
              ></button>
            </div>
          </div>
        )}

        {scoreError && (
          <div className="px-3 pt-3">
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <strong>Warning:</strong> {scoreError}
              <button
                type="button"
                className="btn-close"
                onClick={() => setScoreError("")}
              ></button>
            </div>
          </div>
        )}

        {/* Top toolbar: Search (left) + Back & Print (right) */}
        <div className="d-flex justify-content-between align-items-center mb-2 mt-2 p-2">

          {/* Searchable Employee Selector */}
          <div
            style={{ width: "250px", position: "relative" }}
            ref={dropdownRef}
          >

            {/* Search/Typing Input */}
            <input
              type="text"
              className="form-control"
              placeholder="Type or select employee"
              value={employeeId}
              onChange={(e) => {
                const value = e.target.value;
                setEmployeeId(value);

                if (!value) {
                  setFilteredEmployees([]);
                  return;
                }

                // 1️⃣ If invalid pattern → show invalid message row
                if (isInvalidSearchInput(value)) {
                  setFilteredEmployees([{ type: "invalid" }]);
                  return;
                }

                // 2️⃣ Check if typed full EMP0007 but not in eligibleEmployees
                const typedFullMatch = value.length === 7 && value.toUpperCase().startsWith("EMP");

                if (typedFullMatch) {
                  const existsInEligible = eligibleEmployees.some(emp => emp.emp_id === value.toUpperCase());

                  if (!existsInEligible) {
                    // Employee exists in system but not eligible → show evaluation exists message
                    setFilteredEmployees([{ type: "exists" }]);
                    return;
                  }
                }

                // 3️⃣ Normal filtering for eligible employees
                setFilteredEmployees(
                  eligibleEmployees.filter(emp =>
                    emp.emp_id.toUpperCase().includes(value.toUpperCase()) ||
                    emp.full_name.toUpperCase().includes(value.toUpperCase())
                  )
                );
              }}
              onFocus={() => {
                if (eligibleEmployees.length > 0) {
                  setFilteredEmployees(eligibleEmployees);
                }
              }}
              onBlur={() => {
                setTimeout(() => setFilteredEmployees([]), 150);
              }}
            />

            {/* Show message ONLY when typed pattern is invalid */}
            {employeeId.trim() &&
              filteredEmployees.length === 0 &&
              isInvalidSearchInput(employeeId.trim()) && (
                <ul
                  className="list-group position-absolute w-100"
                  style={{ maxHeight: "200px", overflowY: "auto", zIndex: 2000 }}
                >
                  <li className="list-group-item text-muted text-center">
                    No matching employees found
                  </li>
                </ul>
            )}

            <ul className="list-group position-absolute w-100" 
          style={{ maxHeight: "200px", overflowY: "auto", zIndex: 2000 }}>

        {filteredEmployees[0]?.type === "invalid" && (
          <li className="list-group-item text-muted text-center">
            Invalid Employee ID Format
          </li>
        )}

        {filteredEmployees[0]?.type === "exists" && (
          <li className="list-group-item text-muted text-center">
            Evaluation already exists for this employee
          </li>
        )}

        {filteredEmployees[0]?.type !== "invalid" &&
        filteredEmployees[0]?.type !== "exists" &&
        filteredEmployees.map(emp => (
          <li
            key={emp.emp_id}
            className="list-group-item list-group-item-action"
            onClick={() => {
              setEmployeeId(emp.emp_id);
              setEmployeeData({
                name: emp.full_name,
                department: emp.department_name,
                manager: emp.manager_name || "Not Assigned",
              });
              setFilteredEmployees([]);
              handleSearch();
            }}
          >
            {emp.emp_id} — {emp.full_name}
          </li>
        ))}

      </ul>
          </div>

          {/* RIGHT: Back + Print (conditional) */}
          <div className="d-flex align-items-center gap-2">

            <button
              className="btn btn-primary px-3"
              onClick={() =>
                navigate("/base/employeeperformance", {
                  state: { returnWeek: selectedWeek }
                })
              }
            >
              <i className="bi bi-arrow-left me-1"></i> Back
            </button>

            {/* SHOW PRINT ONLY IF NOT ADD MODE */}
            {mode !== "add" && (
              <CTooltip content="Print Evaluation" placement="top">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center px-3"
                  style={{ borderRadius: "6px", fontWeight: "500" }}
                  onClick={handlePrint}
                  disabled={loading.print}
                >
                  {loading.print ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Printing...
                    </>
                  ) : (
                    <i className="bi bi-printer"></i>
                  )}
                </button>
              </CTooltip>
            )}
          </div>
        </div>
        {/* FORM START */}
        <form onSubmit={handleSubmit}>
          <div ref={printRef}>
            {/* Employee Basic Details */}
            <div className="p-2">
              <div className="row">

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Select Week</label>
                  <input
                    type="week"
                    className="form-control week-input"
                    style={mode && mode !== "add" ? readOnlyStyle : {}}
                    value={selectedWeek}
                    onChange={async (e) => {
                      if (mode !== "add") return;

                      const newWeek = e.target.value;
                      setSelectedWeek(newWeek);

                      // fetch eligible employees
                      const { year, week } = parseWeek(newWeek);
                      if (year && week) {
                        try {
                          const res = await axiosInstance.get(
                            `/performance/eligible-employees/?week=${week}&year=${year}`
                          );
                          setEligibleEmployees(res.data || []);

                          // Show top info alert for zero employees
                          if ((res.data || []).length === 0) {
                            setShowNoEmployeeAlert(true);

                            // Fade out after 5 seconds
                            setTimeout(() => {
                              setShowNoEmployeeAlert(false);
                            }, 5000);
                          } else {
                            setShowNoEmployeeAlert(false);
                          }
                        } catch (err) {
                          console.error("Failed to fetch eligible employees", err);
                          setEligibleEmployees([]);
                        }
                      }

                      // run duplicate check if previously typed employee
                      if (employeeId.trim()) {
                        setTimeout(() => {
                          handleSearch();
                        }, 10);
                      }
                    }}
                    min={minWeek}
                    max={maxWeek}
                    disabled={mode && mode !== "add"}
                  />
                </div>

                {mode !== "add" && (
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">Employee ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={viewEmployeeId}
                      readOnly
                      disabled
                    />
                  </div>
                )}

                {/* Hidden Employee ID input — logic remains same */}
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  style={{ display: "none" }}
                  disabled
                />

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Employee Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={employeeData.name}
                    readOnly
                    style={readOnlyStyle}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    name="department"
                    value={employeeData.department}
                    readOnly
                    style={readOnlyStyle}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Manager Assigned</label>
                  <input
                    type="text"
                    className="form-control"
                    name="manager"
                    value={employeeData.manager}
                    readOnly
                    style={readOnlyStyle}
                  />
                </div>

              </div>

              {/* Section Title */}
              <div className="d-flex justify-content-between align-items-center mt-3 mb-3 p-2">
                <h5 className="text-start mb-0">EMPLOYEE PERFORMANCE EVALUATION</h5>
              </div>

              {/* TABLE */}
              <div className="table-responsive p-2">
                <table className="table table-bordered align-middle text-center">
                  <thead className="table-primary">
                    <tr>
                      <th>Measurement</th>
                      {columns.map((col, index) => (
                        <th key={index}>{col}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {measurements.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="fw-bold text-start">{row}</td>

                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-center"
                            min="0"
                            max="100"
                            value={scores[rowIndex] || ""}
                            onChange={(e) => handleScoreChange(rowIndex, e.target.value)}
                            readOnly={isReadOnly || !employeeData.name}
                          />
                        </td>

                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={comments[rowIndex] || ""}
                            onChange={(e) => {
                              const updated = [...comments];
                              updated[rowIndex] = e.target.value;
                              setComments(updated);
                            }}
                            readOnly={isReadOnly || !employeeData.name}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TOTAL SCORE */}
              <div className="text-end fw-bold mt-2 p-2">
                Total Score: {totalScore} / {maxPossibleScore}
              </div>
            </div>
          </div>

          {/* FORM BUTTONS */}
          <div className={`mt-3 d-flex p-2 ${mode === "edit" ? "justify-content-end" : "justify-content-between"}`}>

            {/* LEFT SIDE — CANCEL (only in Add mode) */}
            {mode === "add" && (
              <button
                type="button"
                className="btn btn-secondary px-4 mb-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}

            {/* RIGHT SIDE — SUBMIT / UPDATE */}
            {mode !== "view" && (
              <button
                type="submit"
                className="btn btn-primary px-4 mb-2"
                disabled={loading.submit}
              >
                {loading.submit ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {mode === "edit" ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  mode === "edit" ? "Update" : "Submit"
                )}
              </button>
            )}
          </div>
        </form>
    </div>
  
    {/* === UNIVERSAL VALIDATION MODAL (new industry standard) === */}
    <div
      className={`modal fade ${validationModal.show ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: "420px" }}>
        <div className="modal-content">

          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title fw-bold d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Warning
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setValidationModal({ show: false, message: "" })}
            ></button>
          </div>

          <div className="modal-body">{validationModal.message}</div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={() => setValidationModal({ show: false, message: "" })}
            >
              OK
            </button>
          </div>

        </div>
      </div>
    </div>

    {validationModal.show && (
      <div className="modal-backdrop fade show"></div>
    )}
  </div>
);
};

export default PerformanceMetrics;