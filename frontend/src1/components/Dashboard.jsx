import { usePopupTrigger } from "./PopupTriggerContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { triggerPopup } = usePopupTrigger();
  const navigate = useNavigate();
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-indigo-700"> Dashboard</h1>
        <p className="text-gray-600">
          Real-time inventory status, alerts, and recent activity
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-r from-green-50 to-green-100 rounded-xl p-5 shadow border border-green-200">
          <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
          <h2 className="text-2xl font-bold text-green-700">$0.00</h2>
          <p className="text-green-600 text-sm mt-1">Current month</p>
        </div>

        <div className="bg-linear-to-r from-red-50 to-red-100 rounded-xl p-5 shadow border border-red-200">
          <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
          <h2 className="text-2xl font-bold text-red-700">0</h2>
          <p className="text-red-600 text-sm mt-1">Requires attention</p>
        </div>

        <div className="bg-linear-to-r from-indigo-50 to-indigo-100 rounded-xl p-5 shadow border border-indigo-200">
          <p className="text-gray-600 text-sm font-medium">Active Jobs</p>
          <h2 className="text-2xl font-bold text-indigo-700">0</h2>
          <p className="text-indigo-600 text-sm mt-1">Currently running</p>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Key Metrics Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Customer Metrics Card */}
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm font-medium">Customers</p>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">👥</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">0</h2>
              <p className="text-gray-400 text-xs mt-1">No active customers</p>
            </div>

            {/* Vehicle Metrics Card */}
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm font-medium">Vehicles</p>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">🚗</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">0</h2>
              <p className="text-gray-400 text-xs mt-1">No vehicles in system</p>
            </div>

            {/* Pending Requests Card */}
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm font-medium">Pending Requests</p>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600">⏳</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">0</h2>
              <p className="text-gray-400 text-xs mt-1">All requests processed</p>
            </div>

            {/* Unpaid Bills Card */}
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm font-medium">Unpaid Bills</p>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600">💰</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-red-700">$0.00</h2>
              <p className="text-gray-400 text-xs mt-1">All bills paid</p>
            </div>
          </div>

          {/* Employee Performance Card - Added above Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Employees</h3>
              <span className="text-blue-600 text-sm font-medium">This Month</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    JS
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">John Smith</p>
                    <p className="text-gray-500 text-sm">Service Manager</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">42 Jobs</p>
                  <p className="text-green-600 text-sm">98% Rating</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    MJ
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">Maria Johnson</p>
                    <p className="text-gray-500 text-sm">Inventory Lead</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">38 Jobs</p>
                  <p className="text-green-600 text-sm">96% Rating</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    RK
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">Robert King</p>
                    <p className="text-gray-500 text-sm">Parts Specialist</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">35 Jobs</p>
                  <p className="text-green-600 text-sm">94% Rating</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Team Performance</span>
                <span className="font-medium text-green-600">+15.2% this month</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600">✔</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Inventory updated</p>
                  <p className="text-gray-500 text-sm">Item #A23 • 2 hours ago</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-yellow-600">⚠</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Low stock detected</p>
                  <p className="text-gray-500 text-sm">Item #B11 • 4 hours ago</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600">🧾</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Billing generated</p>
                  <p className="text-gray-500 text-sm">Order #1023 • 6 hours ago</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column - System Status */}
        <div className="space-y-6">
          {/* System Summary Card */}
          <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Summary</h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm mb-1">Database Status</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium text-green-600">Connected</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm mb-1">Last Data Sync</p>
                <p className="font-medium text-gray-800">Just now</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm mb-1">System Uptime</p>
                <p className="font-medium text-gray-800">100%</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium text-gray-800">1/23/2026</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                onClick={() => { triggerPopup('serviceRequest'); navigate('/sidebar/service_requests'); }}>
                <span className="block text-blue-600 text-lg mb-1">+</span>
                <span className="text-sm font-medium text-blue-700">Add Service Requests</span>
              </button>
              <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
                onClick={() => { triggerPopup('employee'); navigate('/sidebar/employees'); }}>
                <span className="block text-green-600 text-lg mb-1">+</span>
                <span className="text-sm font-medium text-green-700">Add Employee</span>
              </button>
              <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
                onClick={() => { triggerPopup('inventory'); navigate('/sidebar/inventory'); }}>
                <span className="block text-purple-600 text-lg mb-1">📦</span>
                <span className="text-sm font-medium text-purple-700">Add Item</span>
              </button>
              <button className="p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center"
                onClick={() => navigate('/sidebar/billing')}>
                <span className="block text-indigo-600 text-lg mb-1">💰</span>
                <span className="text-sm font-medium text-indigo-700">Billings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}