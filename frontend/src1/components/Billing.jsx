import React, { useState } from 'react';
import { usePopupTrigger } from "./PopupTriggerContext";

// Sample data (replace with your actual data from the backend/API)
const customers = [
  { customerId: 1, name: 'John Doe', email: 'johndoe@example.com', amount: 100, vehicleStatus: 'Completed', paidStatus: 'Unpaid' },
  { customerId: 2, name: 'Jane Smith', email: 'janesmith@example.com', amount: 150, vehicleStatus: 'In Progress', paidStatus: 'Paid' },
  { customerId: 3, name: 'Tom Brown', email: 'tombrown@example.com', amount: 120, vehicleStatus: 'Not Started', paidStatus: 'Unpaid' },
];

const charges = {
  1: {
    serviceCharge: 50,
    tax: 15,
    items: [
      { itemCode: 'A23', itemName: 'Item A', charge: 20 },
      { itemCode: 'B44', itemName: 'Item B', charge: 30 },
    ],
  },
  2: {
    serviceCharge: 75,
    tax: 20,
    items: [
      { itemCode: 'C11', itemName: 'Item C', charge: 40 },
      { itemCode: 'D22', itemName: 'Item D', charge: 35 },
    ],
  },
  3: {
    serviceCharge: 60,
    tax: 18,
    items: [
      { itemCode: 'E55', itemName: 'Item E', charge: 25 },
      { itemCode: 'F66', itemName: 'Item F', charge: 35 },
    ],
  },
};

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerCharges, setCustomerCharges] = useState(null); // Store charges for the selected customer
  const { triggers } = usePopupTrigger();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerId.toString().includes(searchTerm)
  );

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);
    setCustomerCharges(charges[customerId]); // Set the charges for the selected customer
  };

  const printReceipt = () => {
    if (!customerCharges) return; // Ensure charges are loaded before printing

    const printWindow = window.open('', '', 'height=600,width=800');
    
    // Ensure the printWindow is fully loaded before proceeding
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              width: 300px;
              margin: 0 auto;
              font-size: 14px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .items {
              margin-bottom: 20px;
            }
            .items div {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            hr {
              margin: 10px 0;
              border: 1px dashed #000;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>AutoIMS</h2>
            <p>123 Service center, KTM</p>
            <p>Tel: (000) 000-0000</p>
            <hr />
          </div>

          <p><strong>Invoice #:</strong> ${Math.floor(Math.random() * 10000)}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <hr />

          <p><strong>Customer:</strong> ${filteredCustomers.find(c => c.customerId === selectedCustomer)?.name}</p>
          <p><strong>Customer ID:</strong> ${selectedCustomer}</p>

          <hr />
          
          <div class="items">
            <h3>Items:</h3>
            ${customerCharges.items.map(item => `
              <div>
                <span>${item.itemName}</span>
                <span>$${item.charge}</span>
              </div>
            `).join('')}
          </div>

          <hr />

          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <strong>Service Charge:</strong>
            <span>$${customerCharges.serviceCharge}</span>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <strong>Tax:</strong>
            <span>$${customerCharges.tax}</span>
          </div>

          <hr />

          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <strong>Total:</strong>
            <span style="font-size: 18px; font-weight: bold;">$${customerCharges.serviceCharge + customerCharges.tax}</span>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Print</button>
          </div>
          
          <hr />
          <p style="text-align: center; font-size: 12px; margin-top: 10px;">Thank you for using our Service!</p>
        </body>
      </html>
    `);

    // Close the document to render the content
    printWindow.document.close();
  };

  React.useEffect(() => {
    if (triggers.billing) setShowAddPopup(true);
    // ...existing code...
  }, [triggers.billing]);

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">Billing</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Customer ID/Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border border-stone-100 p-2 rounded-xl mb-4 w-full max-w-md bg-white hover:border-blue-300 focus:border-indigo-400 focus:outline-none transition duration-200"
      />

      {/* Customer List */}
      <ul className="space-y-4">
        {filteredCustomers.map((customer) => (
          <li
            key={customer.customerId}
            className={`cursor-pointer p-3 border-3 rounded-md bg-white
              ${selectedCustomer === customer.customerId ? 'border-indigo-400 scale-99' : 'border-gray-300 hover:border-blue-300 hover:scale-101'}`}
            onClick={() => handleCustomerSelect(customer.customerId)}
          >
            <div className="flex justify-between">
              <span className="font-bold text-md">{customer.name} ({customer.customerId})</span>
              <span className="text-gray-600 font-semibold">${customer.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm font-semibold ${customer.vehicleStatus === 'Completed' ? 'text-green-600' : customer.vehicleStatus === 'In Progress' ? 'text-blue-600' : 'text-gray-600'}`}>
                {customer.vehicleStatus}
              </span>
              <span className={`text-sm font-semibold ${customer.paidStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                {customer.paidStatus}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Print Button */}
      {selectedCustomer && customerCharges && (
        <button
          onClick={printReceipt}
          className="mt-4 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          Print Invoice
        </button>
      )}
    </div>
  );
};

export default Billing;
