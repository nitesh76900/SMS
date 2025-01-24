const Admin = require("../models/adminModels");
const Class = require("../models/classModels");
const Connections = require("../models/connectionModels");
const Parents = require("../models/parentModels");
const Student = require("../models/studentModel");
const Teachers = require("../models/teacherModels");
const Staff = require("../models/staffModels");
const Department = require("../models/departmentModels");
const generateUniqueId = require("../utils/generateId");
const { registrationEmail } = require("../utils/html/html");
const hashPassword = require("../utils/password");
const sendEmail = require("../utils/sendMail");

exports.addAdmin = async (req, res) => {
  console.log("Received request to add admin:", req.body);
  try {
    const {
      name,
      phoneNo,
      joinDate,
      email,
      role,
      position,
      salary,
      govId,
      address,
    } = req.body;

    // Validation
    console.log("Validating admin data...");
    if (
      !name ||
      !phoneNo ||
      !joinDate ||
      !email ||
      !position ||
      !salary ||
      !govId ||
      !address
    ) {
      console.log("Validation failed: All fields are required.");
      return res.status(400).json({ error: "All fields are required." });
    }
    if (await Staff.findOne({ email })) {
      console.log("Validation failed: Email already used by staff");
      return res.status(400).json({ error: "Email already used by staff" });
    }
    if (await Staff.findOne({ govId })) {
      console.log("Validation failed: govId already used by staff");
      return res.status(400).json({ error: "govId already used by staff" });
    }

    const uId = `A${await generateUniqueId()}`;
    console.log("Generated unique ID for admin:", uId);

    const encryptPassword = await hashPassword(uId);
    if (!encryptPassword) {
      console.log("Error: hash password failed");
      return res.status(500).json({ error: "hash password failed" });
    }

    const department = await Department.findOne({ name: "Administration" });
    if (!department) {
      console.log("Error: Department not created");
      return res.status(400).json({ error: "Department not created" });
    }

    const staff = new Staff({
      name,
      email,
      phoneNo,
      joinDate,
      department: department._id,
      position,
      teacherOrAdmin: "SuperAdmin",
      salary,
      address,
      govId,
    });

    console.log("Saving staff data...");
    const newAdmin = new Admin({
      name,
      staffId: staff._id,
      role: role || "admin",
      password: encryptPassword,
      registrationNumber: uId,
    });

    staff.teacherOrAdminId = newAdmin._id;
    department.staffMembers.push(staff._id);

    await department.save();
    console.log("Department updated with new staff member.");
    await newAdmin.save();
    console.log("New admin saved successfully.");
    await staff.save();
    console.log("Staff saved successfully.");

    console.log("Creating connection for new admin...");
    await Connections.create({
      name: newAdmin.name,
      email: newAdmin.email,
      profession: "admin",
      phoneNo: newAdmin.phoneNo,
    });

    newAdmin.password = "********";
    const sendRegistrationMail = await sendEmail(
      staff.email,
      "Email for Login Id and password",
      registrationEmail(newAdmin.name, newAdmin.registrationNumber)
    );
    if (!sendRegistrationMail) {
      console.log(
        "Warning: Admin added successfully, but Email not sent to Admin"
      );
      return res.status(400).json({
        error: "Admin added successfully, but Email not sent to Admin",
      });
    }

    console.log("Admin added successfully:", newAdmin);
    return res
      .status(201)
      .json({ message: "Admin added successfully", admin: newAdmin });
  } catch (error) {
    console.error("Error in addAdmin:", error);
    return res.status(400).json({ error: error.message });
  }
};

exports.addTeacher = async (req, res) => {
  console.log("Received request to add teacher:", req.body);
  try {
    const {
      name,
      email,
      joinDate,
      phoneNo,
      subject,
      salary,
      classes,
      leadClass,
      address,
      govId,
    } = req.body;

    // Validation
    console.log("Validating teacher data...");
    if (
      !name ||
      !email ||
      !joinDate ||
      !phoneNo ||
      !subject ||
      !salary ||
      !address ||
      !govId
    ) {
      console.log("Validation failed: All fields are required.");
      return res.status(400).json({ error: "All fields are required." });
    }

    if (await Staff.findOne({ email })) {
      console.log("Validation failed: Email already used by other Staff");
      return res
        .status(400)
        .json({ error: "Email already used by other Staff" });
    }

    const uId = `T${await generateUniqueId()}`;
    console.log("Generated unique ID for teacher:", uId);

    const encryptPassword = await hashPassword(uId);
    if (!encryptPassword) {
      console.log("Error: hash password failed");
      return res.status(500).json({ error: "hash password failed" });
    }

    // Modified leadClass validation to allow empty string
    if (leadClass && leadClass !== "") {
      if (!(await Class.findById(leadClass))) {
        console.log("Validation failed: Lead class not found");
        return res.status(400).json({ error: "Lead class not found" });
      }
    }

    let department = await Department.findOne({ name: "Teaching" });
    if (!department) {
      department = await Department.create({name: "Teaching"})
      console.log("Department not created");
    }

    const staff = new Staff({
      name,
      email,
      phoneNo,
      joinDate,
      department: department._id,
      teacherOrAdmin: "Teacher",
      salary,
      address,
      govId,
    });

    console.log("Saving staff data...", staff);
    department.staffMembers.push(staff._id);
    await department.save();
    console.log("Department updated with new teacher.");

    const newTeacher = new Teachers({
      name,
      salary,
      email,
      staffId: staff._id,
      subject,
      leadClass: leadClass || null, // Set to null if empty string
      password: encryptPassword,
      registrationNumber: uId,
    });
    staff.teacherOrAdminId = newTeacher._id;
    await staff.save();
    console.log("Staff saved successfully.");

    if (classes.length <= 0) {
      console.log("Validation failed: Add class or subject");
      return res.status(400).json({ error: "Add class or subject" });
    }

    console.log("Assigning classes to teacher...");
    const teacherSaveInClass = async () => {
      await Promise.all(
        classes.map(async (item, i) => {
          console.log(`Processing class ${i}:`, item);
          if (!item.class || !item.subject)
            throw Error("provide Class and subject");
          const classData = await Class.findById(item.class);
          if (!classData) {
            console.log(`Class ${item.class} not found`);
          } else {
            let index = null;
            classData.subjects.map(async (e, i) => {
              if (e._id.equals(item.subject)) {
                index = i;
              }
            });
            if (index !== null) {
              classData.subjects[index].teacher = newTeacher._id;
              if (!newTeacher.assignedClass.includes(classData._id)) {
                newTeacher.assignedClass.push(classData._id);
                console.log("Teacher assigned to class:", classData._id);
              }
            }
            // Only set classTeacher if leadClass is not empty and matches
            if (leadClass && leadClass !== "" && classData._id.equals(leadClass)) {
              if(classData.classTeacher){
                const existClassteacher = await Teachers.findById(classData.classTeacher)
                if(existClassteacher){
                  existClassteacher.leadClass = null;
                  await existClassteacher.save();
                }
              }
              classData.classTeacher = newTeacher._id;
            }
            await classData.save();
            console.log("Class data updated:", classData);
          }
        })
      );
      const teacher = await newTeacher.save();
      console.log("Teacher saved successfully:", teacher);
      return teacher;
    };
    const teacher = await teacherSaveInClass();

    console.log("Creating connection for new teacher...");
    await Connections.create({
      name: newTeacher.name,
      email: staff.email,
      profession: "teacher",
      phoneNo: staff.phoneNo,
    });

    const sendRegistrationMail = await sendEmail(
      staff.email,
      "Email for Login Id and password",
      registrationEmail(teacher.name, teacher.registrationNumber)
    );
    if (!sendRegistrationMail) {
      console.log(
        "Warning: Teacher added successfully, but Email not sent to teacher"
      );
      return res.status(400).json({
        error: "Teacher added successfully, but Email not sent to teacher",
      });
    }

    console.log("Teacher added successfully:", teacher);
    return res
      .status(201)
      .json({ message: "Teacher added successfully", data: teacher });
  } catch (error) {
    console.error("Error in addTeacher:", error);
    return res.status(400).json({ error: error.message });
  }
};

exports.addClass = async (req, res) => {
  console.log("Received request to add class:", req.body);
  try {
    const { name, section, classSubjects } = req.body;

    // Validation
    console.log("Validating class data...");
    if (!name || !section || !classSubjects) {
      console.log("Validation failed: All fields are required.");
      return res.status(400).json({ error: "All fields are required." });
    }

    if (await Class.findOne({ name, section })) {
      console.log(
        "Validation failed: Same Class name and section already exist"
      );
      return res
        .status(400)
        .json({ error: "Same Class name and section already exist" });
    }

    if (!Array.isArray(classSubjects)) {
      console.log("Validation failed: Subject type must be an array");
      return res.status(400).json({ error: "send subject type is array" });
    }
    if (classSubjects.length < 3) {
      console.log("Validation failed: Enter at least 3 subjects");
      return res.status(400).json({ error: "Enter at least 3 subjects" });
    }

    const subjects = classSubjects.map((e) => {
      return { subjectName: e };
    });

    console.log("Creating new class...");
    const newClass = new Class({
      name,
      section,
      subjects,
    });
    await newClass.save();
    console.log("Class added successfully:", newClass);
    return res
      .status(201)
      .json({ message: "Class added successfully", class: newClass });
  } catch (error) {
    console.error("Error in addClass:", error);
    return res.status(400).json({ error: error.message });
  }
};

exports.studentAddmission = async (req, res) => {
  console.log("Received request for student admission:", req.body);
  const {
    name,
    studentemail,
    studentPhone,
    admissionYear,
    gender,
    studentAddress,
    fatherName,
    motherName,
    parentEmail,
    parentPhone,
    parentAddress,
    classId,
    dob,
    batch,
    addmissionFee,
    tuitionFee,
    computerFee,
    examFee,
    fine,
    miscellaneous,
  } = req.body;

  try {
    console.log("Validating student admission data...");
    if (
      !name ||
      !studentemail ||
      !studentPhone ||
      !admissionYear ||
      !gender ||
      !studentAddress ||
      !fatherName ||
      !motherName ||
      !parentEmail ||
      !parentPhone ||
      !parentAddress ||
      !classId ||
      !dob ||
      addmissionFee === undefined ||
      tuitionFee === undefined ||
      computerFee === undefined ||
      examFee === undefined ||
      fine === undefined ||
      miscellaneous === undefined
    ) {
      console.log("Validation failed: All fields are required.");
      return res.status(400).json({ error: "All fields are required." });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      console.log("Validation failed: Class not found");
      return res.status(400).json({ error: "Class not found" });
    }

    // Check if student email or phone number already exists
    const existingStudent = await Student.findOne({ email: studentemail });
    if (existingStudent) {
      console.log("Validation failed: Student email already exists.");
      return res.status(400).json({ error: "Student email already exists." });
    }

    // Check if parent email or phone number already exists
    const existingParent = await Parents.findOne({ email: parentEmail });
    if (existingParent) {
      console.log("Validation failed: Parent email already exists.");
      return res.status(400).json({ error: "Parent email already exists." });
    }

    const studentUid = `S${await generateUniqueId()}`;
    const parentUid = `P${await generateUniqueId()}`;
    console.log(
      "Generated unique IDs for student and parent:",
      studentUid,
      parentUid
    );

    const studentEncriptPassword = await hashPassword(studentUid);
    const parentEncriptPassword = await hashPassword(parentUid);

    const feeStructure = {
      addmissionFee,
      tuitionFee,
      computerFee,
      examFee,
      fine,
      miscellaneous,
    };
    const totalFee =
      addmissionFee + tuitionFee + computerFee + examFee + fine + miscellaneous;

    // Generate unique registration numbers for both student and parent
    const studentData = {
      registrationNumber: studentUid,
      name,
      email: studentemail,
      password: studentEncriptPassword,
      gender,
      feeStructure,
      totalFee,
      class: classId,
      phoneNo: studentPhone,
      batch,
      dob,
      address: studentAddress,
    };

    const parentData = {
      fatherName,
      motherName,
      email: parentEmail,
      phoneNo: parentPhone,
      address: parentAddress,
      registrationNumber: parentUid,
      password: parentEncriptPassword,
    };

    console.log("Creating student document...");
    const student = new Student(studentData);
    await student.save();
    console.log("Student saved successfully:", student);

    const parent = new Parents({
      ...parentData,
      student: student._id, // Temporary, will update after student creation
    });
    await parent.save();
    console.log("Parent saved successfully:", parent);

    classData.students.push(student._id);
    await classData.save();
    console.log("Class updated with new student.");

    console.log("Creating connections for parent and student...");
    await Connections.create({
      name: parentData.fatherName,
      email: parentData.email,
      profession: "parents",
      phoneNo: parentData.phoneNo,
    });
    await Connections.create({
      name: studentData.name,
      email: studentData.email,
      profession: "student",
      phoneNo: studentData.phoneNo,
    });

    console.log("Sending registration email to student...");
    const sendRegistrationMailStudent = await sendEmail(
      studentData.email,
      "Email for Login Id and password",
      registrationEmail(studentData.name, studentData.registrationNumber)
    );
    if (!sendRegistrationMailStudent) {
      console.log(
        "Warning: Student admission successful, but Email not sent to student."
      );
      return res.status(400).json({
        error:
          "Student admission successful, but Email not sent to student and parent",
      });
    }

    console.log("Sending registration email to parent...");
    const sendRegistrationMailParent = await sendEmail(
      parentData.email,
      "Email for Login Id and password",
      registrationEmail(parentData.fatherName, parentData.registrationNumber)
    );
    if (!sendRegistrationMailParent) {
      console.log(
        "Warning: Student admission successful, but Email not sent to parent."
      );
      return res.status(400).json({
        error:
          "Student admission successful, but Email not sent to student and parent",
      });
    }

    console.log("Student admission successful:", student, parent);
    return res.status(201).json({
      message: "Student admission successful.",
      student,
      parent,
    });
  } catch (error) {
    console.error("Error in student admission:", error);
    return res.status(500).json({
      error: "An error occurred during admission.",
    });
  }
};

exports.updateParentAndStudent = async (req, res) => {
  console.log("req.body", req.body);
  const { id } = req.params; // This will be the student ID
  const {
    fatherName,
    motherName,
    parentEmail,
    parentPhone,
    parentAddress,
    name,
    studentemail,
    studentPhone,
    studentAddress,
    dob,
    gender,
    batch,
    classId,
    admissionFee,
    tuitionFee,
    computerFee,
    examFee,
    fine,
    miscellaneous,
  } = req.body;

  console.log("Data", classId)

  try {
    // Update Student details
    const existStudent = await Student.findById(id);
    if (!existStudent || !existStudent.isActive) return res.status(404).json({ error: "Student not found" });
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        name,
        email: studentemail,
        phoneNo: studentPhone,
        address: studentAddress,
        dob,
        gender,
        batch,
        class: classId,
        feeStructure: {
          addmissionFee: admissionFee,
          tuitionFee,
          computerFee,
          examFee,
          fine,
          miscellaneous,
        },
        feesPaid: existStudent.feesPaid,
        totalFee:
          parseFloat(admissionFee) +
          parseFloat(tuitionFee) +
          parseFloat(computerFee) +
          parseFloat(examFee) +
          parseFloat(fine) +
          parseFloat(miscellaneous),
      },
      { new: true, runValidators: true }
    );


    // Update Parent details
    const updatedParent = await Parents.findOneAndUpdate(
      { student: id },
      {
        fatherName,
        motherName,
        email: parentEmail,
        phoneNo: parentPhone,
        address: parentAddress,
      },
      { new: true, runValidators: true }
    );

    if (!updatedParent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    return res.status(200).json({
      message: "Parent and Student updated successfully",
      studentData: updatedStudent,
      parentData: updatedParent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
