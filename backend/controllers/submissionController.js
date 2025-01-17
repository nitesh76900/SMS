const Submission = require("../models/SubmissionModel");
const Test = require("../models/TestModel");
const Question = require("../models/QuestionModel");

// Start test attempt
exports.startTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Check if student is allowed to take test
    // if (req.user.role !== "student") {
    //   return res.status(401).json({ error: "Only students can attempt tests" });
    // }

    // Check test timing
    const now = new Date();
    if (now < test.startTime) {
      return res.status(400).json({ error: "Test has not started yet" });
    }
    if (now > test.endTime) {
      return res.status(400).json({ error: "Test has ended" });
    }

    // Check for existing attempt
    const existingSubmission = await Submission.findOne({
      testId: testId,
      studentId: req.user._id,
      status: { $in: ["IN_PROGRESS", "SUBMITTED", "EVALUATED"] },
    });

    if (existingSubmission) {
      return res
        .status(400)
        .json({ error: "You have already attempted this test" });
    }

    // Create new submission
    const submission = await Submission.create({
      testId: testId,
      studentId: req.user._id,
      startTime: now,
      status: "IN_PROGRESS",
    });

    return res.status(201).json({
      message: "Test started successfully",
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Submit test
exports.submitTest = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Verify submission ownership
    if (submission.studentId.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "Not authorized to submit this test" });
    }

    if (submission.status !== "IN_PROGRESS") {
      return res
        .status(400)
        .json({ error: "This submission has already been completed" });
    }

    // Check time limit
    const test = await Test.findById(submission.testId);
    const now = new Date();
    const timeTaken = (now - submission.startTime) / (1000 * 60); // Convert to minutes

    if (timeTaken > test.duration) {
      submission.status = "TIMED_OUT";
      await submission.save();
      return res.status(400).json({ error: "Test time limit exceeded" });
    }

    // Process answers and calculate score
    let totalMarks = 0;
    const processedAnswers = [];

    for (const answer of req.body.answers) {
      const question = await Question.findById(answer.questionId);
      if (!question) continue;

      const answerScore = calculateQuestionScore(
        question,
        answer.selectedOptions
      );
      totalMarks += answerScore;

      processedAnswers.push({
        questionId: answer.questionId,
        selectedOptions: answer.selectedOptions,
        marks: answerScore,
      });
    }

    // Update submission
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        answers: processedAnswers,
        totalMarks: totalMarks,
        submissionTime: now,
        status: "EVALUATED",
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Test submitted successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get submission by ID
exports.getSubmissionById = async (req, res) => {
  try {
    console.log("req.params", req.params);
    const { id } = req.params;
    const submission = await Submission.findById(id)
      .populate("testId")
      .populate("answers.questionId");

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Check access permission
    if (
      req.user._id.toString() !== submission.studentId._id.toString() &&
      !["teacher", "admin", "superAdmin"].includes(req.user.role)
    ) {
      return res.status(401).json({ error: "Access denied" });
    }

    return res.status(200).json({
      message: "Get submission details",
      data: submission,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get student submissions
exports.getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check access permission
    // if (
    //     studentId !== req.user._id.toString() &&
    //     !["teacher", "admin", "superAdmin"].includes(req.user.role)
    // ) {
    //     return res.status(401).json({ error: "Access denied" });
    // }

    const submissions = await Submission.find({ studentId })
      .populate("testId")
      .populate("studentId", "name email");

    return res.status(200).json({
      message: "Get student submissions",
      data: submissions,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// Get all submissions for a test
exports.getTestSubmissions = async (req, res) => {
  try {
    console.log("req.params", req.params);
    const { testId } = req.params;

    // Verify test exists
    const test = await Test.findById(testId);
    console.log("test", test);
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Retrieve submissions for the test
    const submissions = await Submission.find({
      testId,
      status: { $ne: "IN_PROGRESS" },
    })
      .populate("studentId") // Populate student details (name, email)
      .populate({
        path: "answers.questionId", // Populate question details in answers
        select: "text options questionType", // Select specific fields to include
      });

    // if (submissions.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ error: "No submissions found for this test" });
    // }

    return res.status(200).json({
      message: "All submissions for the test retrieved successfully",
      data: submissions,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: error.message });
  }
};

// Helper function for score calculation
function calculateQuestionScore(question, selectedOptions) {
  const correctOptions = question.options
    .filter((opt) => opt.isCorrect)
    .map((opt) => opt._id.toString());

  const selected = selectedOptions.map((opt) => opt.toString());

  if (
    question.questionType === "SINGLE_CHOICE" ||
    question.questionType === "TRUE_FALSE"
  ) {
    return selected.length === 1 && correctOptions.includes(selected[0])
      ? question.marks
      : 0;
  }

  if (question.questionType === "MULTIPLE_CHOICE") {
    const correctCount = selected.filter((opt) =>
      correctOptions.includes(opt)
    ).length;
    const incorrectCount = selected.length - correctCount;
    return correctCount === correctOptions.length && incorrectCount === 0
      ? question.marks
      : 0;
  }

  return 0;
}
