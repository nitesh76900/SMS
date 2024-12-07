import React, { useState } from "react";

const VehicleForm = ({ onClose, onSave, vehicle, availableRoutes, availableDrivers }) => {
  const [formData, setFormData] = useState({
    model: vehicle?.model || "",
    registration: vehicle?.registration || "",
    capacity: vehicle?.capacity || "",
    fuelType: vehicle?.fuelType || "Petrol",
    status: vehicle?.status || "active",
    img: vehicle?.img || "",
    ownership: vehicle?.ownership || "self-owned",
    yearOfManufacture: vehicle?.yearOfManufacture || "",
    pollutionVaildUntil: vehicle?.pollutionVaildUntil || "",
    lastServiceDate: vehicle?.lastServiceDate || "",
    totalKm: vehicle?.totalKm || "",
    insuranceExpiry: vehicle?.insuranceExpiry || "",
    maintenanceCost: vehicle?.maintenanceCost || "0",
    fuelCharge: vehicle?.fuelCharge || "",
    chassisNumber:vehicle?.chassisNumber || "",
    engineNumber: vehicle?.engineNumber || "",
    color: vehicle?.color || "Yellow",
    // routeAssigned: vehicle?.routeAssigned || "00",
    driverAssigned: vehicle?.driverAssigned || "Not Assigned"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  console.log(availableDrivers);
  console.log(availableRoutes);

  return (
    <div className="modal">
      <h2>{vehicle ? "Edit Vehicle" : "Add New Vehicle"}</h2>
      <form onSubmit={handleSubmit}>
       
        <label>Model</label>
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          required
        />

        <label>Registration Number</label>
        <input
          type="text"
          name="registration"
          value={formData.registration}
          onChange={handleChange}
          required
        />

        
        {/* <label>Assigned Route</label>
        <select
          name="routeAssigned"
          value={formData.routeAssigned}
          onChange={handleChange}
          required
        >
          {availableRoutes.map((route, index) => (
            <option key={route.busNo} value={route.busNo}>
              {route.busNo}
           </option>
          ))}
        </select> */}


        <label>Assigned Driver</label>
        <select
          name="driverAssigned"
          value={formData.driverAssigned}
          onChange={handleChange}
          required
        >
           {availableDrivers.map((driver, index) => (
             <option key={driver.name} value={driver.name}>
              {driver.name}
             </option>
           ))}
        </select>

        

        <label>Insurance Expiry</label>
        <input
          type="date"
          name="insuranceExpiry"
          value={formData.insuranceExpiry}
          onChange={handleChange}
        />
        

        <label>Capacity </label>
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          required
        />
       

        <label>Fuel Type </label>
        <select
          name="fuelType"
          value={formData.fuelType}
          onChange={handleChange}
          required
        >
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>
       

        <label>Vechile color</label>
        <input
          type="text"
          name="color"
          value={formData.color}
          onChange={handleChange}
        />  
        

        <label>Status </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
       

        

        <label>Year Of Manufacture </label>
        <input
          type="date"
          name="yearOfManufacture"
          value={formData.yearOfManufacture}
          onChange={handleChange}
          placeholder="Year Of Manufacture"
        />
       

       

        <label>Ownership</label>
        <select
          name="ownership"
          value={formData.ownership}
          onChange={handleChange}
          required
        >
          <option value="self-owned">Self-Owned</option>
          <option value="leased">Leased</option>
        </select>
        

        <label>Pollution Vaild Until</label>
        <input
          type="date"
          name="pollutionVaildUntil"
          value={formData.pollutionVaildUntil}
          onChange={handleChange}
          placeholder="Polluction last date"
        />
        

       <label>Last Service </label>
        <input
          type="date"
          name="lastServiceDate"
          value={formData.lastServiceDate}
          onChange={handleChange}
          placeholder="last Service date"
        />
       

        <label>Total KM</label>
        <input
          type="number"
          name="totalKm"
          value={formData.totalKm}
          onChange={handleChange}
          placeholder="Last Day KM"
        />
        

        <label>Today Maintenance Cost</label>
        <input
          type="number"
          name="maintenanceCost"
          value={formData.maintenanceCost}
          onChange={handleChange}
          placeholder="Today Maintenance Cost"
        />  
        

        <label>Today Fuel Cost </label> 
        <input
          type="number"
          name="fuelCharge"
          value={formData.fuelCharge}
          onChange={handleChange}
          placeholder="Today Fuel Cost"
        />  
       

        <label>Chassis Number</label>
        <input
          type="text"
          name="chassisNumber"
          value={formData.chassisNumber}
          onChange={handleChange}
        />  
         

        <label>Engine Number</label>
        <input
          type="text"
          name="engineNumber"
          value={formData.engineNumber}
          onChange={handleChange}
        />  
        

        <label>
          Image:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} />
        

        <div className="form-actions">
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
