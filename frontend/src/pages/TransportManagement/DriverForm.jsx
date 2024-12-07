import React, { useState } from "react";

const DriverForm = ({ onClose, onSave, driver }) => {
  const [formData, setFormData] = useState({
    name: driver?.name || "",
    license: driver?.license || "",
    phone: driver?.phone || "",
    experience: driver?.experience || "",
    status: driver?.status || "active",
    img: driver?.img || "", // Initialize with driver's photo if editing
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert the file to a data URL for preview and saving
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, img: reader.result }); // Save as base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Pass the updated form data (including the image) to the parent
  };

  return (
    <div className="modal">
      <h2>{driver ? "Edit Driver" : "Add New Driver"}</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>License Number</label>
        <input
          type="text"
          name="license"
          value={formData.license}
          onChange={handleChange}
          required
        />
        

        <label>Phone</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        

        <label>Experience (in years)</label>
        <input
          type="number"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          required
        />
        

        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        

        <label>Upload Photo</label>
        <input
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        {formData.img && (
          <div className="photo-preview">
            <img
              src={formData.img}
              alt="Preview"
              style={{ width: "100px", height: "100px", borderRadius: "50%" }}
            />
          </div>
        )}

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

export default DriverForm;
