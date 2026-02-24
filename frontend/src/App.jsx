import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const PatientPage = () => <div>PatientPage</div>;
const InventoryPage = () => <div>InventoryPage</div>;
const StaffPage = () => <div>StaffPage</div>;

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'sans-serif' }}>
        
        {/* แถบเมนูนำทาง (Navbar) */}
        <nav style={{ padding: '15px', background: '#e0f7fa', borderBottom: '2px solid #b2ebf2' }}>
          <b style={{ marginRight: '20px' }}> Clinic App</b>
          <Link to="/" style={{ marginRight: '15px', textDecoration: 'none' }}>Home</Link>
          <Link to="/patients" style={{ marginRight: '15px', textDecoration: 'none' }}>PatientPage</Link>
          <Link to="/inventory" style={{ marginRight: '15px', textDecoration: 'none' }}>InventoryPage</Link>
          <Link to="/staff" style={{ textDecoration: 'none' }}>StaffPage</Link>
        </nav>

        {/* พื้นที่แสดงผลเนื้อหาของแต่ละหน้า */}
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<h1>Welcome to clinic management system</h1>} />
            <Route path="/patients" element={<PatientPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/staff" element={<StaffPage />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;