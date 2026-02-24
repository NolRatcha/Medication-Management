import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import AddMedication from './pages/AddMedication';
import AddStock from './pages/AddStock';
import AddMedInfo from './pages/AddMedInfo';
import ViewMedications from './pages/ViewMedications';

const PatientPage = () => <div style={{ padding: "40px" }}>PatientPage — Coming Soon</div>;
const StaffPage = () => <div style={{ padding: "40px" }}>StaffPage — Coming Soon</div>;

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/patients", label: "Patients" },
  { to: "/inventory/add-medication", label: "Add Medication" },
  { to: "/inventory/add-stock", label: "Add Stock" },
  { to: "/inventory/add-medinfo", label: "Add Med Info" },
  { to: "/inventory/view", label: "View Medications" },
  { to: "/staff", label: "Staff" },
];

function Navbar() {
  const location = useLocation();
  return (
    <nav style={styles.nav}>
      <b style={styles.logo}>🏥 Clinic App</b>
      <div style={styles.links}>
        {navLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{ ...styles.link, ...(location.pathname === l.to ? styles.activeLink : {}) }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'sans-serif' }}>
        <Navbar />
        <div>
          <Routes>
            <Route path="/" element={<h1 style={{ padding: "40px" }}>Welcome to Clinic Management System</h1>} />
            <Route path="/patients" element={<PatientPage />} />
            <Route path="/inventory/add-medication" element={<AddMedication />} />
            <Route path="/inventory/add-stock" element={<AddStock />} />
            <Route path="/inventory/add-medinfo" element={<AddMedInfo />} />
            <Route path="/inventory/view" element={<ViewMedications />} />
            <Route path="/staff" element={<StaffPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  nav: { padding: "14px 24px", background: "#e0f7fa", borderBottom: "2px solid #b2ebf2", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" },
  logo: { marginRight: "10px", fontSize: "16px" },
  links: { display: "flex", gap: "6px", flexWrap: "wrap" },
  link: { padding: "6px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "500", color: "#374151" },
  activeLink: { background: "#0891b2", color: "#fff" },
};

export default App;