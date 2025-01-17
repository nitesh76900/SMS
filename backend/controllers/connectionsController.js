const Connections = require("../models/connectionModels");

// Add a new connection
exports.addConnection = async (req, res) => {
  try {
    const { name, email, profession, otherProfession, phoneNo } = req.body;
    console.log('req.body', req.body)
    // Check for required fields
    if (!name || !email || !profession || !phoneNo) {
      return res.status(400).json({
        error: "Name, email, profession, and phone number are required.",
      });
    }
    // If profession is "other", then otherProfession is required
    if (profession === "other" && !otherProfession) {
      return res.status(400).json({
        error:
          "Other profession is required when profession is set to 'other'.",
      });
    }
    // Create the connection if validations pass
    const connection = await Connections.create({
      name,
      email,
      profession,
      otherProfession,
      phoneNo,
    });
    return res
      .status(201)
      .json({ message: "Connection created!", data: connection });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all connections
exports.getAllConnections = async (req, res) => {
  try {
    const connections = await Connections.find();
    res.status(200).json({ message: "get all connection", data: connections });
  } catch (error) {
    res.status(500).json({ errore: error.message });
  }
};

// Get a specific connection by ID
exports.getConnectionById = async (req, res) => {
  try {
    const connection = await Connections.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    res.status(200).json({
      message: `get ${connection.name} connection info.`,
      data: connection,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a connection by ID
exports.updateConnection = async (req, res) => {
	try {
	  console.log("Executing updateConnection function...");
	  console.log("Request params ID:", req.params.id);
	  console.log("Request Body in Update function:", req.body);
	  
	  const { profession, otherProfession } = req.body;
	  console.log("Profession:", profession);
	  console.log("Other Profession:", otherProfession);
  
	  // Check for required fields
	  // If profession is "other", then otherProfession is required
	  if (profession === "other" && !otherProfession) {
		console.log("Validation failed: 'otherProfession' is required when profession is 'other'.");
		return res.status(400).json({
		  error: "Other profession is required when profession is set to 'other'.",
		});
	  }
  
	  console.log("Validation passed, proceeding to find and update the connection...");
	  const connection = await Connections.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
		  new: true,
		  runValidators: true,
		}
	  );
  
	  if (!connection) {
		console.log("No connection found with the provided ID.");
		return res.status(404).json({ error: "Connection not found" });
	  }
  
	  console.log("Connection updated successfully:", connection);
	  res.status(200).json({ message: "Connection updated!", data: connection });
	} catch (error) {
	  console.log("An error occurred:", error.message);
	  res.status(400).json({ error: error.message });
	}
  };
  
// Delete a connection by ID
exports.deleteConnection = async (req, res) => {
  try {
    const connection = await Connections.findByIdAndDelete(req.params.id);
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    res.status(200).json({ message: "Connection deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
