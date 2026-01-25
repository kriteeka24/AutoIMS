import {
  Search,
  User,
  LayoutDashboard,
  Users,
  Wrench,
  Boxes,
  CreditCard,
} from "lucide-react";
import { Outlet, Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="flex min-h-screen bg-stone-200">
      {/* Sidebar */}
      <aside className="w-60 bg-stone-200 border-r border-gray-300 p-4">
        <div className="mb-6 text-xl font-semibold">☰</div>

        <nav className="space-y-5 text-xl font-bold">
          <Link to="/sidebar/dashboard">
            <SidebarItem
              icon={<LayoutDashboard size={24} />}
              label="Dashboard"
              active
            />
          </Link>

          <SidebarItem icon={<Users size={24} />} label="Employees" />
          <SidebarItem icon={<Wrench size={24} />} label="Service Requests" />
          <SidebarItem icon={<Boxes size={24} />} label="Inventory" />
          <SidebarItem icon={<CreditCard size={24} />} label="Billings" />
        </nav>
      </aside>

      {/* Routed page content */}
      <main className="flex-grow p-6">
        <Outlet />
      </main>

      <div className="fixed top-4 right-4">
        <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center">
          <User size={24} className="text-indigos-600" />
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
        active
          ? "bg-purple-100 text-purple-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
