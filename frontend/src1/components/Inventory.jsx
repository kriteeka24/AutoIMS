import React, { useState } from 'react';


const inventoryItems = [
  {
    itemName: 'Engine Cylinder',
    itemModel: 'EC2022',
    price: 15000,
    quantity: 30,  // Number of items
    quantityLabel: 'pcs',  // Unit of measurement (pcs)
    image: '/image1.png',
    description: 'High-quality engine cylinder for 2022 models',
    brand: 'EnginePro',
  },
  {
    itemName: 'Brake Pads',
    itemModel: 'BP1999',
    price: 3500,
    quantity: 3,  // Number of items
    quantityLabel: 'sets',  // Unit of measurement (sets)
    image: '/image2.png',
    description: 'Durable brake pads for various vehicles',
    brand: 'BrakeMaster',
  },
  {
    itemName: 'Alloy Wheels',
    itemModel: 'AW2020',
    price: 25000,
    quantity: 20,  // Number of items
    quantityLabel: 'wheels',  // Unit of measurement (wheels)
    image: '/image3.png',
    description: 'Stylish alloy wheels for luxury vehicles',
    brand: 'WheelX',
  },
  {
    itemName: 'Headlights',
    itemModel: 'HL2021',
    price: 12000,
    quantity: 40,  // Number of items
    quantityLabel: 'pcs',  // Unit of measurement (pcs)
    image: '/image4.png',
    description: 'LED headlights for improved visibility',
    brand: 'LightTech',
  },
  {
    itemName: 'Tires Set',
    itemModel: 'TS2022',
    price: 5000,
    quantity: 9,  // Number of items
    quantityLabel: 'sets',  // Unit of measurement (sets)
    image: '/image5.png',
    description: 'All-weather tire set for 2022 models',
    brand: 'TireCo',
  }
];


const Inventory = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showNewEditPopup, setShowNewEditPopup] = useState(false);
  const [showChoicePopup, setShowChoicePopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItemData, setEditItemData] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [ItemQuantity, setItemQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemList, setItemList] = useState(inventoryItems);

  const handleClick = (itemModel) => {
    const item = itemList.find(item => item.itemModel === itemModel);
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

  const handleAddItem = () => {
    setShowAddPopup(true);
  };

  const handlePopupSubmit = (e) => {
    e.preventDefault();
    if (!customerId.trim() || !vehicleId.trim() || !ItemQuantity.trim()) return;
    setShowPopup(false);
    setCustomerId('');
    setVehicleId('');
    setItemQuantity('');
  };

  const handleAddPopupSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const itemName = form.itemName.value.trim();
    const itemModel = form.itemModel.value.trim();
    const brand = form.Brand.value.trim();
    const price = form.PricePerUnit.value.trim();
    const quantity = form.Quantity.value.trim();
    const quantityLabel = form.quantitylabel.value.trim();
    const description = form.description.value.trim();
    const image = form.ItemImage.files[0];
    if (!itemName || !itemModel || !brand || !price || !quantity || !quantityLabel || !image) return;
    setItemList([
      ...itemList,
      {
        itemName,
        itemModel,
        brand,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        quantityLabel,
        image: URL.createObjectURL(image),
        description,
      },
    ]);
    setShowAddPopup(false);
  };

  const handleNewEditPopupSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const itemName = form.itemName.value.trim();
    const itemModel = form.itemModel.value.trim();
    const brand = form.Brand.value.trim();
    const price = form.PricePerUnit.value.trim();
    const quantity = form.Quantity.value.trim();
    const quantityLabel = form.quantitylabel.value.trim();
    const description = form.description.value.trim();
    if (!itemName || !itemModel || !brand || !price || !quantity || !quantityLabel) return;
    setItemList(itemList.map(item =>
      item.itemModel === editItemData.itemModel
        ? { ...item, itemName, itemModel, brand, price: parseFloat(price), quantity: parseInt(quantity), quantityLabel, description }
        : item
    ));
    setShowNewEditPopup(false);
    setEditItemData(null);
  };

  // Filter inventoryItems based on searchTerm
  const filteredItems = itemList.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="p-5">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">Inventory</h1>

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
              onClick={() => handleAddItem()}>
              <span className="block text-purple-600 text-lg mb-1">📦</span>
              <span className="text-sm font-medium text-purple-700">Add Item</span>
            </button>
          </div>
        </div>

        {/* Inventory Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.itemModel} className="bg-white p-4 border border-stone-400 rounded-lg shadow-md hover:shadow-xl hover:scale-101"
              onClick={() => handleClick(item.itemModel)}>
              <img src={item.image} alt={item.itemName} className="w-90 h-40 object-cover rounded-md mb-4" />
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{item.itemName}</h3>
                  <p className="text-sm text-gray-500">{item.itemModel}</p>
                  <p className="mt-2 text-xl font-bold">Rs.{item.price}</p>
                </div>
                
              </div>
              <p className="text-sm text-gray-600">{item.quantity} {item.quantityLabel}</p>
            </div>
          ))}
        </div>

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
              <h2 className="text-xl font-bold mb-6 text-center">What would you like to do with <span className="text-indigo-700">{selectedItem.itemName}</span>?</h2>
              <div className="flex gap-6 w-full justify-center">
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
                <span className="font-bold">Item Name:</span> {selectedItem.itemName}
              </label>
              <label className="block mb-4">
                <span className="font-bold">Item Model:</span> {selectedItem.itemModel}
              </label>
              <label className="block mb-4">
             <span className='font-bold'>Customer ID:</span>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full  p-2 border rounded-md"
                />
              </label>
              <label className="block mb-4">
             <span className='font-bold'>Vehicle ID:</span>
                <input
                  type="text"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </label>
              <label className="block mb-4">
            <span className='font-bold'>Quantity:</span>
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
                onClick={() => { setShowNewEditPopup(false); setEditItemData(null); }}
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
                    value={editItemData.itemName || ''}
                    onChange={e => setEditItemData({ ...editItemData, itemName: e.target.value })}
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
                    value={editItemData.itemModel || ''}
                    onChange={e => setEditItemData({ ...editItemData, itemModel: e.target.value })}
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
                    value={editItemData.brand || ''}
                    onChange={e => setEditItemData({ ...editItemData, brand: e.target.value })}
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
                    value={editItemData.price || ''}
                    onChange={e => setEditItemData({ ...editItemData, price: e.target.value })}
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
                    value={editItemData.quantity || ''}
                    onChange={e => setEditItemData({ ...editItemData, quantity: e.target.value })}
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
                    value={editItemData.quantityLabel || ''}
                    onChange={e => setEditItemData({ ...editItemData, quantityLabel: e.target.value })}
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
                  value={editItemData.description || ''}
                  onChange={e => setEditItemData({ ...editItemData, description: e.target.value })}
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
