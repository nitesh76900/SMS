const Notice = require("../models/noticeModels");
const Student = require("../models/studentModel");
const Teachers = require("../models/teacherModels");
const Parents = require("../models/parentModels");
const sendEmail = require("../utils/sendMail");
const uploadOnCloudinary = require("../utils/cloudinary");

// Add a new notice
exports.addNotice = async (req, res) => {
    console.log("Notice Data in Controller:", req.body); // Log the incoming request data
  
    try {
      const {
        title,
        date,
        subject,
        description,
        for:forUse,
        emailStudent,
        emailTeacher,
        emailParent,
      } = req.body;
  
      // Validation
      console.log("Validating input fields...");
      if (!title || !subject || !description || !forUse) {
        console.log("Validation failed: Missing required fields.");
        return res.status(400).json({
          error: "Title, date, subject, description, and forUse are required.",
        });
      }
      console.log("Validation passed.");
  
      let imageUrl = null;
      let imagePublicId = null;
  
      // Check if image file is provided and upload it to Cloudinary
      if (req.file) {
        console.log("Image file detected. Uploading to Cloudinary...");
        const { url, public_id } = await uploadOnCloudinary(req.file.path);
        imageUrl = url;
        imagePublicId = public_id;
        console.log("Image uploaded. URL:", imageUrl, "Public ID:", imagePublicId);
      } else {
        console.log("No image file provided.");
      }
  
      // Create the notice in the database
      console.log("Creating the notice in the database...");
      const notice = await Notice.create({
        title,
        date,
        subject,
        description,
        for: forUse,
        img: {
          url: imageUrl,
          public_id: imagePublicId,
        },
      });
      console.log("Notice created successfully:", notice);
  
      // Send emails in chunks if any email flag is true
      if (emailStudent || emailTeacher || emailParent) {
        console.log("Preparing to send emails to relevant recipients...");
        // Gather email lists based on flags
        const emails = [];
        if (emailStudent) {
          console.log("Fetching student emails...");
          const students = await Student.find({}, "email");
          emails.push(...students.map((student) => student.email));
          console.log("Found student emails:", emails);
        }
        if (emailTeacher) {
          console.log("Fetching teacher emails...");
          const teachers = await Teachers.find({}, "email");
          emails.push(...teachers.map((teacher) => teacher.email));
          console.log("Found teacher emails:", emails);
        }
        if (emailParent) {
          console.log("Fetching parent emails...");
          const parents = await Parents.find({}, "email");
          emails.push(...parents.map((parent) => parent.email));
          console.log("Found parent emails:", emails);
        }
  
        // Set batch size (for example, 100 emails at a time)
        const batchSize = 10;
        let currentBatch = 0;
  
        // Recursive function to process emails in batches
        const sendEmailInChunks = async () => {
          console.log(`Processing batch ${currentBatch + 1} of emails...`);
          const start = currentBatch * batchSize;
          const end = start + batchSize;
          const batch = emails.slice(start, end);
  
          // Exit the recursive loop when no more emails to process
          if (batch.length === 0) {
            console.log("All emails sent. Ending response.");
            return res.end(); // End response when all batches are processed
          }
  
          console.log(`Sending ${batch.length} emails in this batch...`);
          // Send emails in the current batch
          const emailStatuses = await Promise.allSettled(
            batch.map((email) =>
              sendEmail(
                email,
                `New Notice: ${title}`,
                emailForNotice({
                  title: notice.title,
                  date: notice.date,
                  subject: notice.subject,
                  description: notice.description,
                  img: notice.img.url || null,
                })
              )
            )
          );
  
          // Build email send status for current batch
          const batchStatus = emailStatuses.map((result, index) => ({
            email: batch[index],
            status: result.status,
            error: result.reason ? result.reason.message : null,
          }));
  
          // Send response chunk for this batch
          console.log(`Batch ${currentBatch + 1} email statuses:`, batchStatus);
          res.write(
            JSON.stringify({
              batch: currentBatch + 1,
              status: "Emails sent for current batch",
              sentEmails: batch.length,
              totalEmails: emails.length,
              emailStatus: batchStatus,
            }) + "\n"
          );
  
          currentBatch++;
          setImmediate(sendEmailInChunks); // Schedule the next batch
        };
  
        // Start sending emails in chunks
        sendEmailInChunks();
      } else {
        console.log("No email flags set. Returning success response.");
        // If no email flags are true, just return the success response
        return res.status(201).json({ message: "Notice Created!", data: notice });
      }
    } catch (error) {
      console.log("Error occurred:", error.message);
      return res.status(400).json({ error: error.message });
    }
  };
  

// Get all notices, with optional filtering by target audience
exports.getAllNotices = async (req, res) => {
  try {
    const audience = req.user.role;
    const filter =
      audience === "student"
        ? { $or: [{ for: "all" }, { for: "students" }] }
        : audience === "parent"
        ? { $or: [{ for: "students" }, { for: "parents" }, { for: "all" }] }
        : {}; // filter by audience if provided
    const notices = await Notice.find(filter).sort({ date: -1 }); // sorted by latest date
    return res.status(200).json({ message: "get all notices", data: notices });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update a notice by ID
exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }
    if (req.file) {
      if (notice.img.public_id) {
        await cloudinary.uploader.destroy(notice.img.public_id); // Delete old image from Cloudinary
      }

      const { url, public_id } = await uploadOnCloudinary(req.file.path); // Upload new image to Cloudinary
      notice.img = { url, public_id }; // Update image data
    }
    return res.status(200).json({ message: "update notice", data: notice });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Delete a notice by ID
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }
    // if (education.image.public_id) {
    //   await cloudinary.uploader.destroy(education.image.public_id);
    // }
    return res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
