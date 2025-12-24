
import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {useNavigate} from "react-router-dom";


const API_BASE = "http://localhost:8080/api"; // 🔁 CHANGE

const api = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "API Error");
  }

  return res.status === 204 ? null : res.json();
};




const ENDPOINTS = {
  roles: `${API_BASE}/masters/roles`,
  departments: `${API_BASE}/masters/departments`,
  projects: `${API_BASE}/masters/projects`,
  measurements: `${API_BASE}/masters/measurements`,
  performance: `${API_BASE}/manager/performance`,
  feedbacks: `${API_BASE}/manager/feedbacks`,
};



const SAMPLE = {
  roles: [
    { id: 1, name: "Admin", created_at: "2024-01-05T10:00:00Z", status: "Active" },
    { id: 2, name: "Manager", created_at: "2024-02-02T09:00:00Z", status: "Active" },
  ],
  departments: [
    { id: 1, name: "Engineering", code: "ENG", status: "Active" },
    { id: 2, name: "HR", code: "HR", status: "Active" },
  ],
  project: [
  {
    
    department_name: "Engineering",
    project_name: "First Project",
    status: "Active",
  },
  {
    
    department_name: "HR",
    project_name: "First Project",
    status: "Active",
  },
],

  measurements: [
    { id: 1, name: "Task Completion", status: "Active" },
    { id: 2, name: "Quality", status: "Active" },
  ],
  performance: [
    { emp_id: "E001", full_name: "Anil", score: 85, week: "2025-W45", comments: "Good" },
    { emp_id: "E002", full_name: "Kavya", score: 92, week: "2025-W45", comments: "Excellent" },
  ],
  feedbacks: [
    { id: 1, manager: "M001", feedback: "Keep improving", date: "2025-11-01" },
  ],
};


export default function App() {
  const [active, setActive] = useState("roles"); // current page key
  const [showAll, setShowAll] = useState(false); // toggle for flat all-items list
  const [showForm, setShowForm] = useState(false);
  
  const TITLES = {
    roles: "Roles",
    departments: "Departments",
    projects: "Projects",
    measurements: "Measurements",
    mgr_performance: "Manager-wise Employee Performance",
    mgr_feedback: "Manager Feedback",
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <Sidebar
        active={active}
        setActive={setActive}
        showAll={showAll}
        setShowAll={setShowAll}
        TITLES={TITLES}
      />

      <div className="flex-grow-1 p-4">
        <TopBar title={TITLES[active]} />
        <div style={{ marginTop: 10 }}>
          {active === "roles" && <RolesPage />}
          {active === "departments" && <DepartmentsPage />}
          {active === "projects" && <ProjectsPage />}
          {active === "measurements" && <MeasurementsPage />}
          {active === "mgr_performance" && <ManagerPerformancePage />}
          {active === "mgr_feedback" && <ManagerFeedbackPage />}
        </div>
      </div>
    </div>
  );
}



function Sidebar({ active, setActive, showAll, setShowAll, TITLES }) {
  const itemClass = (key) =>
    "d-flex align-items-center justify-content-start gap-2 btn btn-ghost w-100 text-start py-2 " +
    (active === key ? "fw-bold text-primary" : "text-dark");

  return (
    <aside className="bg-white border-end p-3" style={{ width: 270 }}>
      <div className="mb-3">
        <h5 className="mb-0">EPTS</h5>
        <small className="text-muted">Employee Performance</small>
      </div>

      

      <div className="mb-3">
        <h6 className="small text-muted mb-2">Admin Module</h6>
        <div className="d-grid gap-1">
          <button className={itemClass("roles")} onClick={() => setActive("roles")}>
            <i className="bi bi-person-badge me-2"></i> Roles
          </button>
          <button className={itemClass("departments")} onClick={() => setActive("departments")}>
            <i className="bi bi-building me-2"></i> Departments
          </button>
          <button className={itemClass("projects")} onClick={() => setActive("projects")}>
            <i className="bi bi-people me-2"></i> Projects
          </button>
          <button className={itemClass("measurements")} onClick={() => setActive("measurements")}>
            <i className="bi bi-graph-up me-2"></i> Measurements
          </button>
        </div>
      </div>

      

      <div className="mb-3">
        <h6 className="small text-muted mb-2">Manager Module</h6>
        <div className="d-grid gap-1">
          <button className={itemClass("mgr_performance")} onClick={() => setActive("mgr_performance")}>
            <i className="bi bi-bar-chart-line me-2"></i> Manager-wise Employee Performance
          </button>
          <button className={itemClass("mgr_feedback")} onClick={() => setActive("mgr_feedback")}>
            <i className="bi bi-chat-left-dots me-2"></i> Manager Feedback
          </button>
        </div>
      </div>

      


    </aside>
  );
}


function TopBar({ title }) {
  const navigate = useNavigate();
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="d-flex align-items-center gap-2">
        
        
        <h4 className="mb-0">{title}</h4>

        
      </div>
      <div>
        <button className="btn btn-outline-primary btn-sm"
        onClick={()=>navigate("/dashboard")}>
          <i className="bi bi-arrow-left"></i>
        </button>
      </div>


    </div>
  );
}




function PageLayout({ children }) {
  return <div className="card shadow-sm p-3">{children}</div>;
}

function TablePanel({ 
  data, columns, loading, 
  searchPlaceholder = "Search...",
   onAddNew,onEdit, onDelete,
  }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((r) =>
      columns.some((c) => {
        const v = String(r[c.key] ?? "").toLowerCase();
        return v.includes(q);
      })
    );
  }, [data, search, columns]);



  return (
    <>
      
      <div className="row mb-3 align-items-center">
        <div className="col-md-6">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search"></i>
            </span>
            <input
              className="form-control border-start-0"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-6 text-end">
          <button className="btn btn-outline-secondary btn-sm me-2">
            <i className="bi bi-arrow-down-up me-1"></i>
            Sort: Newest
          </button>

          <button
            className="btn btn-primary btn-sm shadow-sm"
            onClick={onAddNew}
          >
            <i className="bi bi-plus-lg me-1"></i>Add New
          </button>


        </div>
      </div>

      
      <div className="table-responsive">
        <table
          className="table align-middle table-hover shadow-sm w-100"
          style={{
            borderRadius: "10px",
            overflow: "hidden",
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <thead
            style={{
              background: "#f1f3f5",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="py-3 px-3 text-secondary text-uppercase small text-wrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary"></div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-muted">
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  style={{
                    background: idx % 2 === 0 ? "#fff" : "#f8f9fa",
                  }}
                >
                  {columns.map((c) => (
                    <td key={c.key} className="py-3 px-3 text-wrap">
                      {renderCell(row, c.key, onEdit,onDelete)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
       
      </div>

    </>
  );
}


function renderCell(row, key, onEdit, onDelete) {
  if (key === "status") {
    const st = row.status ?? "Active";
    return (
      <span
        className={`badge px-3 py-2 rounded-pill ${st === "Active" ? "bg-success" : "bg-secondary"
          }`}
      >
        {st}
      </span>
    );
  }

 if (key === "actions") {
  return (
    <div className="d-flex gap-2">
      {onEdit && (
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onEdit(row)}
        >
          <i className="bi bi-pencil"></i>
        </button>
      )}

      {onDelete && (
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(row)}
        >
          <i className="bi bi-trash"></i>
        </button>
      )}
    </div>
  );
}

  if (key === "created_at") return formatDate(row.created_at);
  return row[key] ?? "-";
}

function AddNewModal({ title, fields, onSave, onCancel , initialData}) {
  const [form, setForm] = useState({});

  useEffect(()=>{
    setForm(initialData || {});
  }, [initialData]);

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h6 className="modal-title">{title}</h6>
            <button className="btn-close" onClick={onCancel}></button>
          </div>

          <div className="modal-body">
            {fields.map((f) => (
              <input
                key={f.key}
                className="form-control mb-2"
                placeholder={f.label}
                value={form[f.key] || ""}
                onChange={(e) =>
                  setForm({ ...form, [f.key]: e.target.value })
                }
              />
            ))}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onSave(form)}
            >
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

async function fetchData(endpointUrl) {
  const res = await fetch(endpointUrl);
  if (!res.ok) throw new Error("Fetch failed");
  const data = await res.json();
  return Array.isArray(data) ? data : data.results || [];
}






function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await fetchData(ENDPOINTS.roles);
    setRoles(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveRole = async (data) => {
    if (editItem) {
      await api(`${ENDPOINTS.roles}/${editItem.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await api(ENDPOINTS.roles, {
        method: "POST",
        body: JSON.stringify(data),
      });
    }
    setShowForm(false);
    setEditItem(null);
    load();
  };

  const deleteRole = async (row) => {
    if (!window.confirm("Delete role?")) return;
    await api(`${ENDPOINTS.roles}/${row.id}`, { method: "DELETE" });
    load();
  };

  const columns = [
    { key: "name", label: "Role Name" },
    { key: "created_at", label: "Created On" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <PageLayout>
      <TablePanel
        data={roles}
        columns={columns}
        loading={loading}
        onAddNew={() => setShowForm(true)}
        onEdit={setEditItem}
        onDelete={deleteRole}
      />

      {showForm && (
        <AddNewModal
          title={editItem ? "Edit Role" : "Add Role"}
          fields={[{ key: "name", label: "Role Name" }]}
          initialData={editItem}
          onSave={saveRole}
          onCancel={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}
    </PageLayout>
  );
}




function DepartmentsPage() {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    setLoading(true);
    setDepts(await fetchData(ENDPOINTS.departments));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveDept = async (data) => {
    if (editItem) {
      await api(`${ENDPOINTS.departments}/${editItem.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await api(ENDPOINTS.departments, {
        method: "POST",
        body: JSON.stringify(data),
      });
    }
    setShowForm(false);
    setEditItem(null);
    load();
  };

  const deleteDept = async (row) => {
    if (!window.confirm("Delete department?")) return;
    await api(`${ENDPOINTS.departments}/${row.id}`, { method: "DELETE" });
    load();
  };

  return (
    <PageLayout>
      <TablePanel
        data={depts}
        loading={loading}
        columns={[
          { key: "name", label: "Department" },
          { key: "status", label: "Status" },
          { key: "actions", label: "Actions" },
        ]}
        onAddNew={() => setShowForm(true)}
        onEdit={setEditItem}
        onDelete={deleteDept}
      />

      {showForm && (
        <AddNewModal
          title={editItem ? "Edit Department" : "Add Department"}
          fields={[
            { key: "name", label: "Department Name" },
            { key: "code", label: "Code" },
          ]}
          initialData={editItem}
          onSave={saveDept}
          onCancel={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}
    </PageLayout>
  );
}



function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    setLoading(true);
    setProjects(await fetchData(ENDPOINTS.projects));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveProject = async (data) => {
    if (editItem) {
      await api(`${ENDPOINTS.projects}/${editItem.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await api(ENDPOINTS.projects, {
        method: "POST",
        body: JSON.stringify(data),
      });
    }
    setShowForm(false);
    setEditItem(null);
    load();
  };

  const deleteProject = async (row) => {
    if (!window.confirm("Delete project?")) return;
    await api(`${ENDPOINTS.projects}/${row.id}`, { method: "DELETE" });
    load();
  };

  return (
    <PageLayout>
      <TablePanel
        data={projects}
        loading={loading}
        columns={[
          { key: "department_name", label: "Department" },
          { key: "project_name", label: "Project Name" },
          { key: "status", label: "Status" },
          { key: "actions", label: "Actions" },
        ]}
        onAddNew={() => setShowForm(true)}
        onEdit={setEditItem}
        onDelete={deleteProject}
      />

      {showForm && (
        <AddNewModal
          title={editItem ? "Edit Project" : "Add Project"}
          fields={[
            { key: "department_name", label: "Department" },
            { key: "project_name", label: "Project Name" },
          ]}
          initialData={editItem}
          onSave={saveProject}
          onCancel={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}
    </PageLayout>
  );
}



function MeasurementsPage() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // LOAD DATA
  const loadMeasurements = async () => {
    setLoading(true);
    try {
      const data = await fetchData(ENDPOINTS.measurements);
      setMeasurements(data);
    } catch (e) {
      console.error(e);
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeasurements();
  }, []);

  // SAVE (ADD / EDIT)
  const saveMeasurement = async (data) => {
    try {
      if (editItem) {
        // UPDATE
        await api(`${ENDPOINTS.measurements}/${editItem.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        // CREATE
        await api(ENDPOINTS.measurements, {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      setShowForm(false);
      setEditItem(null);
      loadMeasurements();
    } catch (e) {
      alert("Failed to save measurement");
    }
  };

  // DELETE
  const deleteMeasurement = async (row) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await api(`${ENDPOINTS.measurements}/${row.id}`, {
        method: "DELETE",
      });
      loadMeasurements();
    } catch (e) {
      alert("Failed to delete measurement");
    }
  };

  // TABLE COLUMNS
  const columns = [
    { key: "name", label: "Measurement" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <PageLayout>
      <TablePanel
        data={measurements}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search measurements..."
        onAddNew={() => {
          setEditItem(null);
          setShowForm(true);
        }}
        onEdit={(row) => {
          setEditItem(row);
          setShowForm(true);
        }}
        onDelete={deleteMeasurement}
      />

      {showForm && (
        <AddNewModal
          title={editItem ? "Edit Measurement" : "Add Measurement"}
          fields={[
            { key: "name", label: "Measurement Name" },
            // status optional – backend can default it
          ]}
          initialData={editItem}
          onSave={saveMeasurement}
          onCancel={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}
    </PageLayout>
  );
}




/*

 function ManagerPerformancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api(ENDPOINTS.performance);

      setData(res);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // DELETE
  const deletePerformance = async (row) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
      await api(`${ENDPOINTS.performance}/${row.emp_id}`, { method: "DELETE" });

    loadData();
  };

  // SAVE (ADD / EDIT)
  const savePerformance = async (form) => {
    if (editItem) {
      await api(ENDPOINTS.performance, {
  method: "POST",
  body: JSON.stringify(form),
      });
    } else {
      await api("/manager/performance", {
        method: "POST",
        body: JSON.stringify(form),
      });
    }

    setShowForm(false);
    setEditItem(null);
    loadData();
  };

  const columns = [
    { key: "emp_id", label: "Emp ID" },
    { key: "full_name", label: "Employee Name" },
    { key: "score", label: "Score" },
    { key: "week", label: "Week" },
    { key: "comments", label: "Comments" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <PageLayout>
      <TablePanel
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search performance..."
        onAddNew={() => {
          setEditItem(null);
          setShowForm(true);
        }}
        onEdit={(row) => {
          setEditItem(row);
          setShowForm(true);
        }}
        onDelete={deletePerformance}
      />

      {showForm && (
        <AddNewModal
          title={editItem ? "Edit Performance" : "Add Performance"}
          fields={[
            { key: "full_name", label: "Employee Name" },
            { key: "score", label: "Score" },
            { key: "week", label: "Week (2025-W45)" },
            { key: "comments", label: "Comments" },
          ]}
          initialData={editItem}
          onSave={savePerformance}
          onCancel={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}
    </PageLayout>
  );
}




//function ManagerFeedbackPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api("/manager/feedback");
      setData(res);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // DELETE
  const deleteFeedback = async (row) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    await api(`/manager/feedback/${row.id}`, { method: "DELETE" });
    loadData();
  };

  // SAVE (ADD / EDIT)
  const saveFeedback = async (form) => {
    if (editItem) {
      await api(`/manager/feedback/${editItem.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
    } else {
      await api("/manager/feedback", {
        method: "POST",
        body: JSON.stringify(form),
      });
    }

    setShowForm(false);
    setEditItem(null);
    loadData();
  };

  const columns = [
    { key: "manager", label: "Manager ID" },
    { key: "feedback", label: "Feedback" },
    { key: "date", label: "Date" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <PageLayout>
      <TablePanel
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search feedback..."
        onAddNew={() => {
          setEditItem(null);
          setShowForm(true);
        }}
        onEdit={(row) => {
          setEditItem(row);
          setShowForm(true);
        }}
        onDelete={deleteFeedback}
      />

      {showForm && (
        <AddNewModal
          title={editItem ? "Edit Feedback" : "Add Feedback"}
          fields={[
            { key: "manager", label: "Manager ID" },
            { key: "feedback", label: "Feedback" },
          ]}
          initialData={editItem}
          onSave={saveFeedback}
          onCancel={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}
    </PageLayout>
  );
}  */





function formatDate(v) {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (isNaN(d)) return v;
    return d.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return v;
  }
}
