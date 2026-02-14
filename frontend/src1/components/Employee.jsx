import React, { useState } from 'react';

// Sample data for employees (replace with actual data)
const employees = [
  {
    employeeName: 'John Doe',
    employeeId: 'EMP001',
    position: 'Driver',
    workingStatus: 'Working',
    vehicleId: 'VEH001',
    rating: 4.5,
    jobsDone: 10,
  },
  {
    employeeName: 'Jane Smith',
    employeeId: 'EMP002',
    position: 'Mechanic',
    workingStatus: 'Not Working',
    vehicleId: 'VEH002',
    rating: 3.8,
    jobsDone: 5,
  },
  {
    employeeName: 'Sam Brown',
    employeeId: 'EMP003',
    position: 'Technician',
    workingStatus: 'Working',
    vehicleId: 'VEH003',
    rating: 4.0,
    jobsDone: 8,
  },
  {
    employeeName: 'Lucy Lee',
    employeeId: 'EMP004',
    position: 'Cleaner',
    workingStatus: 'Not Working',
    vehicleId: 'VEH004',
    rating: 4.2,
    jobsDone: 7,
  },
  {
    employeeName: 'Mike Johnson',
    employeeId: 'EMP005',
    position: 'Manager',
    workingStatus: 'Working',
    vehicleId: 'VEH005',
    rating: 4.8,
    jobsDone: 12,
  },
];

const Employee = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeList, setEmployeeList] = useState(employees);

  // A canonical list of vehicle IDs for suggestions / validation.
  // In a real app this should come from the backend.
  const vehicleList = Array.from(new Set([...employees.map((e) => e.vehicleId), 'VEH006', 'VEH007']));

  // Edit state
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editVehicleId, setEditVehicleId] = useState('');
  const [vehicleError, setVehicleError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employeeName: '',
    employeeId: '',
    phone: '',
    email: '',
    position: '',
    designation: '',
    workingStatus: 'Working',
    vehicleId: '',
    rating: '',
    jobsDone: '',
  });

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);

  const handleAddEmployee = () => setShowAddPopup(true);
  const handleAddPopupClose = () => {
    setShowAddPopup(false);
    setNewEmployee({
      employeeName: '', employeeId: '', phone: '', email: '', position: '', designation: '', workingStatus: 'Working', vehicleId: '', rating: '', jobsDone: '',
    });
  };
  const handleNewEmployeeChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddPopupSubmit = (e) => {
    e.preventDefault();
    if (!newEmployee.employeeName || !newEmployee.employeeId || !newEmployee.phone || !newEmployee.email || !newEmployee.position) return;
    setEmployeeList([
      ...employeeList,
      {
        employeeName: newEmployee.employeeName,
        employeeId: newEmployee.employeeId,
        position: newEmployee.position,
        designation: newEmployee.designation,
        workingStatus: newEmployee.workingStatus,
        vehicleId: newEmployee.vehicleId,
        rating: parseFloat(newEmployee.rating) || 0,
        jobsDone: parseInt(newEmployee.jobsDone) || 0,
        phone: newEmployee.phone,
        email: newEmployee.email,
      },
    ]);
    handleAddPopupClose();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleToggleStatus = (employeeId) => {
    // kept for quick toggling if needed elsewhere
    const updatedEmployees = employeeList.map((employee) =>
      employee.employeeId === employeeId
        ? { ...employee, workingStatus: employee.workingStatus === 'Working' ? 'Not Working' : 'Working' }
        : employee
    );
    setEmployeeList(updatedEmployees);
  };

  const openEdit = (employee) => {
    setEditEmployeeId(employee.employeeId);
    setEditStatus(employee.workingStatus);
    setEditVehicleId(employee.vehicleId || '');
    setVehicleError('');
    setShowSuggestions(false);
  };

  const handleVehicleInputChange = (value) => {
    setEditVehicleId(value);
    setVehicleError('');
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (vehicleId) => {
    setEditVehicleId(vehicleId);
    setShowSuggestions(false);
    setVehicleError('');
  };

  const handleSaveEdit = (employeeId) => {
    // Allow multiple vehicle IDs, comma separated, and validate each
    const vehicleIds = editVehicleId.split(',').map(v => v.trim()).filter(Boolean);
    const invalid = vehicleIds.find(v => v && !vehicleList.includes(v));
    if (invalid) {
      setVehicleError(`Vehicle ID '${invalid}' not found. Please choose valid vehicles.`);
      return;
    }
    const updatedEmployees = employeeList.map((employee) =>
      employee.employeeId === employeeId
        ? { ...employee, workingStatus: editStatus, vehicleId: editVehicleId }
        : employee
    );
    setEmployeeList(updatedEmployees);
    setEditEmployeeId(null);
    setShowSuggestions(false);
  };

  const handleCancelEdit = () => {
    setEditEmployeeId(null);
    setVehicleError('');
    setShowSuggestions(false);
  };

  const handleDeleteEmployee = (employeeId) => {
    const employee = employeeList.find(emp => emp.employeeId === employeeId);
    if (!employee) return;
    if (window.confirm(`Are you sure you want to delete employee '${employee.employeeName}' (ID: ${employee.employeeId})? This action cannot be undone.`)) {
      setEmployeeList(employeeList.filter(emp => emp.employeeId !== employeeId));
    }
  };

  const handleEditEmployee = (employee) => {
    setEditEmployeeData({ ...employee });
    setShowEditPopup(true);
  };
  const handleEditPopupClose = () => {
    setShowEditPopup(false);
    setEditEmployeeData(null);
  };
  const handleEditEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEditEmployeeData((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditPopupSubmit = (e) => {
    e.preventDefault();
    setEmployeeList(employeeList.map(emp =>
      emp.employeeId === editEmployeeData.employeeId ? {
        ...emp,
        ...editEmployeeData,
        rating: parseFloat(editEmployeeData.rating) || 0,
        jobsDone: parseInt(editEmployeeData.jobsDone) || 0,
      } : emp
    ));
    handleEditPopupClose();
  };

  const filteredEmployees = employeeList.filter((employee) =>
    employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute ranked employees for sidebar
  const rankedEmployees = [...employeeList].sort((a, b) => b.rating - a.rating);

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 p-5">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">Employee </h1>

        {/* Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search by Employee Name or ID"
            value={searchTerm}
            onChange={handleSearch}
            className="border border-stone-300 p-2 rounded-xl w-full max-w-md bg-white hover:border-blue-300 focus:border-indigo-400 focus:outline-none transition duration-200"
          />
          <button
            className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center ml-6"
            onClick={handleAddEmployee}
          >
            <span className="block text-purple-600 text-lg mb-1">➕</span>
            <span className="text-sm font-medium text-purple-700">Add Employee</span>
          </button>
        </div>

        {/* Employee Table */}
        <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Employee Name</th>
              <th className="p-3 text-left">Employee ID</th>
              <th className="p-3 text-left">Position</th>
              <th className="p-3 text-left">Working Status</th>
              <th className="p-3 text-left">Vehicle ID</th>
              <th className="p-3 text-left">Rating</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.employeeId} className="border-t border-gray-300">
                <td className="p-3">{employee.employeeName}</td>
                <td className="p-3">{employee.employeeId}</td>
                <td className="p-3">{employee.position}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full ${
                      employee.workingStatus === 'Working' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {employee.workingStatus}
                  </span>
                </td>
                <td className="p-3">
                  {employee.vehicleId
                    ? employee.vehicleId.split(',').map((v, i) => (
                        <span key={i} className="inline-block bg-gray-100 text-gray-700 rounded px-2 py-0.5 mr-1 mb-1 text-xs font-medium">
                          {v.trim()}
                        </span>
                      ))
                    : ''}
                </td>
                <td className="p-3">{employee.rating}</td>
                <td className="p-3 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.employeeId)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Sidebar: Ranked Employees */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 h-screen self-start overflow-y-auto mt-46">
        {/* Removed total jobs done box */}
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">Top Ranked Employees</h2>
        <ol className="space-y-3">
          {rankedEmployees.map((emp, idx) => (
            <li key={emp.employeeId} className="flex items-center bg-white rounded-lg shadow p-3">
              <span className="text-lg font-semibold text-gray-800 mr-2">#{idx + 1}</span>
              <div className="flex-1">
                <div className="font-medium text-indigo-700">{emp.employeeName}</div>
                <div className="text-sm text-gray-500">{emp.position} | ID: {emp.employeeId}</div>
                <div className="mt-2">
                  <span className="block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold mb-1">
                    {emp.jobsDone} jobs
                  </span>
                  <span className="block px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                    {emp.rating}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {showAddPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <form
            className="flex flex-col space-y-6 bg-white p-10 rounded-3xl shadow-xl relative w-full max-w-lg"
            onSubmit={handleAddPopupSubmit}
          >
            <button
              className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
              onClick={handleAddPopupClose}
              type="button"
            >
              ❌
            </button>
            <div className="flex flex-col items-center space-y-6 mb-4">
              <h2 className="text-3xl font-bold text-center">Add Employee</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Name <span className="text-red-500">*</span></label>
                <input name="employeeName" value={newEmployee.employeeName} onChange={handleNewEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Employee ID <span className="text-red-500">*</span></label>
                <input name="employeeId" value={newEmployee.employeeId} onChange={handleNewEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Phone <span className="text-red-500">*</span></label>
                <input name="phone" value={newEmployee.phone} onChange={handleNewEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Email <span className="text-red-500">*</span></label>
                <input name="email" type="email" value={newEmployee.email} onChange={handleNewEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Job Title <span className="text-red-500">*</span></label>
                <input name="position" value={newEmployee.position} onChange={handleNewEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Designation</label>
                <input name="designation" value={newEmployee.designation} onChange={handleNewEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Working Status</label>
                <select name="workingStatus" value={newEmployee.workingStatus} onChange={handleNewEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full">
                  <option value="Working">Working</option>
                  <option value="Not Working">Not Working</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Vehicle IDs (comma separated)</label>
                <input name="vehicleId" value={newEmployee.vehicleId} onChange={handleNewEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Rating</label>
                <input name="rating" type="number" step="0.1" value={newEmployee.rating} onChange={handleNewEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Jobs Done</label>
                <input name="jobsDone" type="number" value={newEmployee.jobsDone} onChange={handleNewEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gray-800 text-white font-bold py-2 rounded-2xl hover:bg-gray-900 transition mt-2"
            >
              Add Employee
            </button>
          </form>
        </div>
      )}
      {showEditPopup && editEmployeeData && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <form
            className="flex flex-col space-y-6 bg-white p-10 rounded-3xl shadow-xl relative w-full max-w-lg"
            onSubmit={handleEditPopupSubmit}
          >
            <button
              className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
              onClick={handleEditPopupClose}
              type="button"
            >
              ❌
            </button>
            <div className="flex flex-col items-center space-y-6 mb-4">
              <h2 className="text-3xl font-bold text-center">Edit Employee</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Name <span className="text-red-500">*</span></label>
                <input name="employeeName" value={editEmployeeData.employeeName} onChange={handleEditEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Employee ID <span className="text-red-500">*</span></label>
                <input name="employeeId" value={editEmployeeData.employeeId} onChange={handleEditEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" disabled />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Phone <span className="text-red-500">*</span></label>
                <input name="phone" value={editEmployeeData.phone || ''} onChange={handleEditEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Email <span className="text-red-500">*</span></label>
                <input name="email" type="email" value={editEmployeeData.email || ''} onChange={handleEditEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Job Title <span className="text-red-500">*</span></label>
                <input name="position" value={editEmployeeData.position || ''} onChange={handleEditEmployeeChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Designation</label>
                <input name="designation" value={editEmployeeData.designation || ''} onChange={handleEditEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Working Status</label>
                <select name="workingStatus" value={editEmployeeData.workingStatus} onChange={handleEditEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full">
                  <option value="Working">Working</option>
                  <option value="Not Working">Not Working</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Vehicle IDs (comma separated)</label>
                <input name="vehicleId" value={editEmployeeData.vehicleId || ''} onChange={handleEditEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Rating</label>
                <input name="rating" type="number" step="0.1" value={editEmployeeData.rating} onChange={handleEditEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Jobs Done</label>
                <input name="jobsDone" type="number" value={editEmployeeData.jobsDone} onChange={handleEditEmployeeChange} className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-800 text-white font-bold py-2 rounded-2xl hover:bg-blue-900 transition mt-2"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Employee;
