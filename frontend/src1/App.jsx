import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Billing from "./components/Billing";
import Employee from "./components/Employee";
import Service_request from "./components/Service_request";
import Inventory from "./components/Inventory";

/* ---------- Public Layout (Navbar + Footer) ---------- */
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow bg-stone-200">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

/* ---------- Sidebar Layout (No Navbar/Footer) ---------- */
function SidebarLayout() {
  return (
    <div>
      <Sidebar />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages with Navbar/Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Sidebar Layout (No Navbar / Footer) */}
        <Route element={<SidebarLayout />}>
          <Route path="/sidebar" element={<Navigate to="/sidebar/dashboard" />} />
          <Route path="/sidebar/dashboard" element={<Dashboard />} />
          <Route path="/sidebar/billing" element={<Billing />} />
          <Route path="/sidebar/employees" element={<Employee />} />
          <Route path="/sidebar/service_requests" element={<Service_request />} />
          <Route path="/sidebar/inventory" element={<Inventory />} />
        </Route>
      </Routes>
    </Router>
  );
}
