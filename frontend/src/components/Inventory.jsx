import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const Inventory = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showNewEditPopup, setShowNewEditPopup] = useState(false);
  const [showChoicePopup, setShowChoicePopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItemData, setEditItemData] = useState(null);
  const [plateNo, setPlateNo] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [ItemQuantity, setItemQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to handle 401 - redirect to login
  const handleAuthError = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }
    return false;
  };

  // Fetch inventory items on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Handle auth error - redirect to login
      if (handleAuthError(response)) return;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }
      const data = await response.json();
      setItemList(data.items || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      // Don't set error for auth issues
      if (!err.message.includes("401") && !err.message.includes("Session")) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (part_code) => {
    const item = itemList.find((item) => item.part_code === part_code);
    setSelectedItem(item);
    setEditItemData(item);
    setShowChoicePopup(true);
  };

  const handleChooseEdit = () => {
    setShowChoicePopup(false);
    setShowNewEditPopup(true);
  };

  const handleChooseUse = () => {
    setShowChoicePopup(false);
    setShowPopup(true);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedItem.part_name}"?`,
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/inventory/${selectedItem.part_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete item");
      }

      // Remove item from local state
      setItemList(
        itemList.filter((item) => item.part_id !== selectedItem.part_id),
      );
      setShowChoicePopup(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  const handleAddItem = () => {
    setShowAddPopup(true);
  };

  const handlePopupSubmit = async (e) => {
    e.preventDefault();
    if (!plateNo.trim() || !customerId.trim() || !ItemQuantity.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/job-parts/use-for-vehicle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plate_no: plateNo.trim(),
            customer_id: parseInt(customerId),
            part_id: selectedItem.part_id,
            quantity_used: parseInt(ItemQuantity),
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to use part");
      }

      const data = await response.json();

      // Update local inventory state to reflect reduced quantity
      setItemList(
        itemList.map((item) =>
          item.part_id === selectedItem.part_id
            ? {
                ...item,
                quantity_in_stock:
                  item.quantity_in_stock - parseInt(ItemQuantity),
              }
            : item,
        ),
      );

      alert(
        `Part "${selectedItem.part_name}" added to job for ${data.customer_name || "customer"} (${data.service_type || "service"})!`,
      );

      setShowPopup(false);
      setPlateNo("");
      setCustomerId("");
      setItemQuantity("");
      setSelectedItem(null);
    } catch (err) {
      console.error("Error using part:", err);
      alert(`Failed to use part: ${err.message}`);
    }
  };

  const handleAddPopupSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const part_name = form.itemName.value.trim();
    const part_code = form.itemModel.value.trim();
    const brand = form.Brand.value.trim();
    const unit_price = form.PricePerUnit.value.trim();
    const quantity_in_stock = form.Quantity.value.trim();
    const quantity_label = form.quantitylabel.value.trim();
    const description = form.description.value.trim();
    const image = form.ItemImage.files[0];
    if (
      !part_name ||
      !part_code ||
      !brand ||
      !unit_price ||
      !quantity_in_stock ||
      !quantity_label ||
      !image
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("part_name", part_name);
      formData.append("part_code", part_code);
      formData.append("brand", brand);
      formData.append("unit_price", unit_price);
      formData.append("quantity_in_stock", quantity_in_stock);
      formData.append("quantity_label", quantity_label);
      formData.append("description", description);
      formData.append("reorder_level", "10"); // Default reorder level
      formData.append("image", image);

      const response = await fetch(`${API_BASE_URL}/api/inventory`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      const data = await response.json();
      setItemList([...itemList, data.item]);
      setShowAddPopup(false);
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleNewEditPopupSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const part_name = form.itemName.value.trim();
    const part_code = form.itemModel.value.trim();
    const brand = form.Brand.value.trim();
    const unit_price = form.PricePerUnit.value.trim();
    const quantity_in_stock = form.Quantity.value.trim();
    const quantity_label = form.quantitylabel.value.trim();
    const description = form.description.value.trim();
    if (
      !part_name ||
      !part_code ||
      !brand ||
      !unit_price ||
      !quantity_in_stock ||
      !quantity_label
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/inventory/${editItemData.part_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            part_name,
            part_code,
            brand,
            unit_price: parseFloat(unit_price),
            quantity_in_stock: parseInt(quantity_in_stock),
            quantity_label,
            description,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      const data = await response.json();
      setItemList(
        itemList.map((item) =>
          item.part_id === editItemData.part_id ? data.item : item,
        ),
      );
      setShowNewEditPopup(false);
      setEditItemData(null);
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Failed to update item. Please try again.");
    }
  };

  // Filter inventoryItems based on searchTerm
  const filteredItems = itemList.filter(
    (item) =>
      (item.part_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (item.part_code?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  // Helper to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.png";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="p-5">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">
          Inventory
        </h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">
          Inventory
        </h1>

        {/* Flex container for Search and Add Item */}
        <div className="flex justify-between items-center mb-6">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by Item Name or Item ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-stone-300 p-2 rounded-xl w-full max-w-md bg-white hover:border-blue-300 focus:border-indigo-400 focus:outline-none transition duration-200"
          />

          {/* Add Item Button */}
          <div>
            <button
              className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center ml-6"
              onClick={() => handleAddItem()}
            >
              <span className="block text-purple-600 text-lg mb-1">📦</span>
              <span className="text-sm font-medium text-purple-700">
                Add Item
              </span>
            </button>
          </div>
        </div>

        {/* Inventory Items */}
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No inventory items found
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.part_id || item.part_code}
                className="bg-white p-4 border border-stone-400 rounded-lg shadow-md hover:shadow-xl hover:scale-101"
                onClick={() => handleClick(item.part_code)}
              >
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.part_name}
                  className="w-90 h-40 object-cover rounded-md mb-4"
                />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{item.part_name}</h3>
                    <p className="text-sm text-gray-500">{item.part_code}</p>
                    <p className="mt-2 text-xl font-bold">
                      Rs.{item.unit_price}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {item.quantity_in_stock} {item.quantity_label || "pcs"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Choice Popup */}
        {showChoicePopup && selectedItem && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center relative w-full max-w-xs">
              <button
                className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
                onClick={() => setShowChoicePopup(false)}
                type="button"
              >
                ❌
              </button>
              <h2 className="text-xl font-bold mb-6 text-center">
                What would you like to do with{" "}
                <span className="text-indigo-700">
                  {selectedItem.part_name}
                </span>
                ?
              </h2>
              <div className="flex gap-4 w-full justify-center">
                <button
                  className="bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-800 transition"
                  onClick={handleChooseEdit}
                >
                  Edit
                </button>
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
                  onClick={handleChooseUse}
                >
                  Use
                </button>
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-700 transition"
                  onClick={handleDeleteItem}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup for customer and vehicle details */}
        {showPopup && selectedItem && (
          <div className="fixed inset-0 flex items-center justify-center ">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
              <button
                className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
                onClick={() => setShowPopup(false)}
              >
                ❌
              </button>
              <h3 className="text-xl font-semibold mb-4">Enter Details</h3>
              <label className="block mb-4">
                <span className="font-bold">Item Name:</span>{" "}
                {selectedItem.part_name}
              </label>
              <label className="block mb-4">
                <span className="font-bold">Item Model:</span>{" "}
                {selectedItem.part_code}
              </label>
              <label className="block mb-4">
                <span className="font-bold">Plate No:</span>
                <input
                  type="text"
                  value={plateNo}
                  onChange={(e) => setPlateNo(e.target.value)}
                  placeholder="e.g. KA-01-AB-1234"
                  className="w-full p-2 border rounded-md"
                />
              </label>
              <label className="block mb-4">
                <span className="font-bold">Customer ID:</span>
                <input
                  type="number"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter Customer ID"
                  className="w-full p-2 border rounded-md"
                />
              </label>
              <label className="block mb-4">
                <span className="font-bold">Quantity:</span>
                <input
                  type="number"
                  value={ItemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </label>
              <div className="flex justify-between">
                <button
                  onClick={handlePopupSubmit}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Popup */}
        {showAddPopup && (
          <div className="fixed inset-0 flex items-center justify-center">
            <form
              className="flex flex-col space-y-6 bg-white p-10 rounded-3xl shadow-xl relative"
              onSubmit={handleAddPopupSubmit}
            >
              <button
                className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddPopup(false)}
              >
                ❌
              </button>
              <div className="flex flex-col items-center space-y-6 mb-4">
                <h2 className="text-3xl font-bold text-center">📦 Add Item</h2>
              </div>

              {/* Add Item Form */}
              <div className="flex items-center space-x-4 flex-wrap w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="itemName" className="mb-1 font-medium">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="itemModel" className="mb-1 font-medium">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="itemModel"
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 flex-wrap w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="category1" className="mb-1 font-medium">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="Brand"
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="PricePerUnit" className="mb-1 font-medium">
                    Price Per Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="PricePerUnit"
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 flex-wrap w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="Quantity" className="mb-1 font-medium">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="Quantity"
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="quantitylabel" className="mb-1 font-medium">
                    Quantity label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="quantitylabel"
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex space-x-4 flex-wrap w-full">
                <div className="flex flex-col items-start space-y-2 flex-1 min-w-0">
                  <label htmlFor="ItemImage" className="font-medium">
                    Item Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="ItemImage"
                    name="ItemImage"
                    accept="image/*"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col w-full">
                <label htmlFor="description" className="mb-1 font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Description / Summary"
                  className="p-3 border border-gray-300 rounded-xl w-full h-32 resize-y"
                />
              </div>

              <button
                type="submit"
                className="bg-gray-800 text-white font-bold py-2 rounded-2xl hover:bg-gray-900 transition"
              >
                Add Item
              </button>
            </form>
          </div>
        )}
        {showNewEditPopup && editItemData && (
          <div className="fixed inset-0 flex items-center justify-center">
            <form
              className="flex flex-col space-y-6 bg-white p-10 rounded-3xl shadow-xl relative"
              onSubmit={handleNewEditPopupSubmit}
            >
              <button
                className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowNewEditPopup(false);
                  setEditItemData(null);
                }}
                type="button"
              >
                ❌
              </button>
              <div className="flex flex-col items-center space-y-6 mb-4">
                <h2 className="text-3xl font-bold text-center">📦 Edit Item</h2>
              </div>

              {/* Edit Item Form */}
              <div className="flex items-center space-x-4 flex-wrap w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="itemName" className="mb-1 font-medium">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    value={editItemData.part_name || ""}
                    onChange={(e) =>
                      setEditItemData({
                        ...editItemData,
                        part_name: e.target.value,
                      })
                    }
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="itemModel" className="mb-1 font-medium">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="itemModel"
                    value={editItemData.part_code || ""}
                    onChange={(e) =>
                      setEditItemData({
                        ...editItemData,
                        part_code: e.target.value,
                      })
                    }
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 flex-wrap w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="Brand" className="mb-1 font-medium">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="Brand"
                    value={editItemData.brand || ""}
                    onChange={(e) =>
                      setEditItemData({
                        ...editItemData,
                        brand: e.target.value,
                      })
                    }
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="PricePerUnit" className="mb-1 font-medium">
                    Price Per Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="PricePerUnit"
                    value={editItemData.unit_price || ""}
                    onChange={(e) =>
                      setEditItemData({
                        ...editItemData,
                        unit_price: e.target.value,
                      })
                    }
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 flex-wrap w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="Quantity" className="mb-1 font-medium">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="Quantity"
                    value={editItemData.quantity_in_stock || ""}
                    onChange={(e) =>
                      setEditItemData({
                        ...editItemData,
                        quantity_in_stock: e.target.value,
                      })
                    }
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <label htmlFor="quantitylabel" className="mb-1 font-medium">
                    Quantity label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="quantitylabel"
                    value={editItemData.quantity_label || ""}
                    onChange={(e) =>
                      setEditItemData({
                        ...editItemData,
                        quantity_label: e.target.value,
                      })
                    }
                    required
                    className="p-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex flex-col w-full">
                <label htmlFor="description" className="mb-1 font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Description"
                  value={editItemData.description || ""}
                  onChange={(e) =>
                    setEditItemData({
                      ...editItemData,
                      description: e.target.value,
                    })
                  }
                  className="p-3 border border-gray-300 rounded-xl w-full h-32 resize-y"
                />
              </div>
              <button
                type="submit"
                className="bg-gray-800 text-white font-bold py-2 rounded-2xl hover:bg-gray-900 transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Inventory;
