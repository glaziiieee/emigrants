import React, { useEffect, useState } from "react";
import {
  addEmigrant,
  getEmigrants,
  updateEmigrant,
  deleteEmigrant,
} from "./services/emigrantServices";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { auth } from "./firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { FiEdit, FiTrash2, FiLogOut } from "react-icons/fi";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [emigrants, setEmigrants] = useState([]);
  const [form, setForm] = useState({
    year: "",
    single: "",
    married: "",
    widower: "",
    separated: "",
    divorced: "",
    notReported: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch data
  const fetchData = async () => {
    const data = await getEmigrants();
    setEmigrants(data);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setEmigrants([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.year) {
      alert("Please enter a year");
      return;
    }

    if (editingId) {
      await updateEmigrant(editingId, {
        year: Number(form.year) || 0,
        single: Number(form.single) || 0,
        married: Number(form.married) || 0,
        widower: Number(form.widower) || 0,
        separated: Number(form.separated) || 0,
        divorced: Number(form.divorced) || 0,
        notReported: Number(form.notReported) || 0,
      });
      setEditingId(null);
    } else {
      await addEmigrant({
        year: Number(form.year) || 0,
        single: Number(form.single) || 0,
        married: Number(form.married) || 0,
        widower: Number(form.widower) || 0,
        separated: Number(form.separated) || 0,
        divorced: Number(form.divorced) || 0,
        notReported: Number(form.notReported) || 0,
      });
    }

    setForm({
      year: "",
      single: "",
      married: "",
      widower: "",
      separated: "",
      divorced: "",
      notReported: "",
    });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      await deleteEmigrant(id);
      fetchData();
    }
  };

  const handleEdit = (emigrant) => {
    setForm({
      year: emigrant.year || "",
      single: emigrant.single || "",
      married: emigrant.married || "",
      widower: emigrant.widower || "",
      separated: emigrant.separated || "",
      divorced: emigrant.divorced || "",
      notReported: emigrant.notReported || "",
    });
    setEditingId(emigrant.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compute totals for bar chart
  const totals = emigrants.reduce(
    (acc, cur) => {
      acc.single += cur.single || 0;
      acc.married += cur.married || 0;
      acc.widower += cur.widower || 0;
      acc.separated += cur.separated || 0;
      acc.divorced += cur.divorced || 0;
      acc.notReported += cur.notReported || 0;
      return acc;
    },
    {
      single: 0,
      married: 0,
      widower: 0,
      separated: 0,
      divorced: 0,
      notReported: 0,
    }
  );

  const chartData = [
    { category: "Single", count: totals.single },
    { category: "Married", count: totals.married },
    { category: "Widower", count: totals.widower },
    { category: "Separated", count: totals.separated },
    { category: "Divorced", count: totals.divorced },
    { category: "Not Reported", count: totals.notReported },
  ];

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Filipino Emigrants Database</h1>
          <p>Please sign in to continue</p>
          <button onClick={handleLogin} className="login-button">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Filipino Emigrants Database</h1>
        <div className="user-profile">
          <img
            src={user.photoURL || "https://via.placeholder.com/40"}
            alt="User Avatar"
            className="user-avatar"
          />
          <div className="user-info">
            <div className="user-name">{user.displayName}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <FiLogOut /> Logout
          </button>
        </div>
      </header>

      <div className="content">
        <section className="form-section">
          <h2 className="section-title">
            {editingId ? "Edit Emigrant Record" : "Add New Emigrant Record"}
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Year:</label>
              <input
                type="number"
                name="year"
                placeholder="Enter year"
                value={form.year}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Single:</label>
              <input
                type="number"
                name="single"
                placeholder="0"
                value={form.single}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Married:</label>
              <input
                type="number"
                name="married"
                placeholder="0"
                value={form.married}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Widower:</label>
              <input
                type="number"
                name="widower"
                placeholder="0"
                value={form.widower}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Separated:</label>
              <input
                type="number"
                name="separated"
                placeholder="0"
                value={form.separated}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Divorced:</label>
              <input
                type="number"
                name="divorced"
                placeholder="0"
                value={form.divorced}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Not Reported:</label>
              <input
                type="number"
                name="notReported"
                placeholder="0"
                value={form.notReported}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <button onClick={handleAdd} className="add-button">
            {editingId ? "Update Record" : "Add Record"}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm({
                  year: "",
                  single: "",
                  married: "",
                  widower: "",
                  separated: "",
                  divorced: "",
                  notReported: "",
                });
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          )}
        </section>

        <section className="table-section">
          <h2 className="section-title">Emigrant Records</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Single</th>
                  <th>Married</th>
                  <th>Widower</th>
                  <th>Separated</th>
                  <th>Divorced</th>
                  <th>Not Reported</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emigrants.map((e) => (
                  <tr key={e.id}>
                    <td>{e.year || 0}</td>
                    <td>{e.single || 0}</td>
                    <td>{e.married || 0}</td>
                    <td>{e.widower || 0}</td>
                    <td>{e.separated || 0}</td>
                    <td>{e.divorced || 0}</td>
                    <td>{e.notReported || 0}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEdit(e)}
                        className="icon-button edit-button"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="icon-button delete-button"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="chart-section">
          <h2 className="section-title">
            Filipino Emigrants by Marital Status
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#e91e63" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}

export default App;
