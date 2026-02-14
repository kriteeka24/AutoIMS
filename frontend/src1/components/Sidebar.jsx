import { Search, User, LayoutDashboard, Users, Wrench, Boxes, CreditCard } from "lucide-react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const location = useLocation(); // Hook to access the current URL
  const navigate = useNavigate();
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleUserIconClick = () => {
    setShowLogoutDropdown((prev) => !prev);
  };
  const handleLogout = () => {
    setShowLogoutDropdown(false);
    setShowLogoutPopup(true);
  };
  const confirmLogout = () => {
    setShowLogoutPopup(false);
    // Clear any auth tokens here if needed
    navigate("/login");
  };
  const cancelLogout = () => {
    setShowLogoutPopup(false);
  };

  const handleSidebarToggle = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    if (!showLogoutDropdown) return;
    const handleClick = (e) => {
      if (!e.target.closest('.user-dropdown-trigger')) {
        setShowLogoutDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLogoutDropdown]);

  return (
    <div className="flex min-h-screen bg-stone-200">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${collapsed ? 'w-20' : 'w-60'} bg-stone-200 border-r border-gray-300 p-4 flex flex-col`}>
        <button
          className="mb-6 text-xl font-semibold focus:outline-none text-left w-full"
          onClick={handleSidebarToggle}
          title="Toggle Sidebar"
          style={{justifyContent: 'flex-start'}}
        >
          ☰
        </button>
        <nav className="space-y-5 text-xl font-bold flex-1">
          <Link to="/sidebar/dashboard">
            <SidebarItem
              icon={<LayoutDashboard size={24} />}
              label="Dashboard"
              active={location.pathname === "/sidebar/dashboard"} // Dynamically set active state
              collapsed={collapsed}
            />
          </Link>

          <Link to="/sidebar/employees">
            <SidebarItem
              icon={<Users size={24} />}
              label="Employees"
              active={location.pathname === "/sidebar/employees"} // Dynamically set active state
              collapsed={collapsed}
            />
          </Link>

          <Link to="/sidebar/service_requests">
            <SidebarItem
              icon={<Wrench size={24} />}
              label="Service Requests"
              active={location.pathname === "/sidebar/service_requests"} // Dynamically set active state
              collapsed={collapsed}
            />
          </Link>

          <Link to="/sidebar/inventory">
            <SidebarItem
              icon={<Boxes size={24} />}
              label="Inventory"
              active={location.pathname === "/sidebar/inventory"} // Dynamically set active state
              collapsed={collapsed}
            />
          </Link>

          <Link to="/sidebar/billing">
            <SidebarItem
              icon={<CreditCard size={24} />}
              label="Billings"
              active={location.pathname === "/sidebar/billing"} // Dynamically set active state
              collapsed={collapsed}
            />
          </Link>
        </nav>
      </aside>

      {/* Routed page content */}
      <main className="grow p-6">
        <Outlet />
      </main>

      <div className="fixed top-4 right-4 z-50">
        <div className="relative user-dropdown-trigger">
          <button
            className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center hover:bg-indigo-300 transition"
            title="User Menu"
            onClick={handleUserIconClick}
          >
            <User size={24} className="text-indigo-600" />
          </button>
          {showLogoutDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {showLogoutPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Are you sure you want to logout?</h2>
            <div className="flex gap-6 mt-2">
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-700 transition"
                onClick={confirmLogout}
              >
                Logout
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl font-semibold hover:bg-gray-300 transition"
                onClick={cancelLogout}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active, collapsed }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
        active
          ? "bg-purple-100 text-purple-700"
          : "text-gray-600 hover:bg-gray-100"
      } ${collapsed ? 'justify-center' : ''}`}
      style={{ minHeight: 44 }}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </div>
  );
}
