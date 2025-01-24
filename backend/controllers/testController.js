const Test = require("../models/TestModel");
const Question = require("../models/QuestionModel");

exports.createTest = async (req, res) => {
  try {
    console.log("Starting createTest function...");

    const { questions, ...testData } = req.body;
    console.log("Received test data:", testData);
    console.log("Received questions:", questions);

    // Validate test timing
    const startTime = new Date(testData.startTime);
    const endTime = new Date(testData.endTime);
    console.log("Parsed startTime:", startTime);
    console.log("Parsed endTime:", endTime);

    if (startTime <= new Date()) {
      console.error("Validation error: Start time must be in the future");
      return res.status(400).json({ error: "Start time must be in the future" });
    }

    if (endTime <= startTime) {
      console.error("Validation error: End time must be after start time");
      return res.status(400).json({ error: "End time must be after start time" });
    }

    // Create test with associated data
    console.log("Creating test...");
    const test = await Test.create({
      ...testData,
      createdBy: req.user._id,
    });
    console.log("Test created successfully:", test);

    // If questions are provided, create them and associate with the test
    if (questions && questions.length > 0) {
      console.log("Creating questions for the test...");
      const createdQuestions = await Question.create(
        questions.map(q => ({
          ...q,
          testId: test._id,
          createdBy: req.user._id,
        }))
      );
      console.log("Questions created successfully:", createdQuestions);

      // Optionally update test with question references
      test.questions = createdQuestions.map(q => q._id);
      await test.save();
      console.log("Test updated with question references.");
    }

    return res.status(201).json({
      message: "Test created successfully",
      data: test,
    });
  } catch (error) {
    console.error("Error in createTest function:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.addQuestionsToTest = async (req, res) => {
  try {
    console.log("Starting addQuestionsToTest function...");

    const { id } = req.params;
    const { questions } = req.body;
    console.log("Test ID:", id);
    console.log("Questions to add:", questions);

    // Validate test exists
    console.log("Fetching test by ID...");
    const test = await Test.findById(id);
    if (!test) {
      console.error("Test not found");
      return res.status(404).json({ error: "Test not found" });
    }
    console.log("Test found:", test);

    // Prepare questions with test ID
    const preparedQuestions = questions.map((q, index) => ({
      ...q,
      testId: id,
      orderIndex: test.questions.length + index,
    }));
    console.log("Prepared questions:", preparedQuestions);

    // Create questions
    console.log("Creating questions...");
    const createdQuestions = await Question.create(preparedQuestions);
    console.log("Questions created successfully:", createdQuestions);

    // Update test with new question references
    test.questions.push(...createdQuestions.map(q => q._id));
    test.totalQuestions += createdQuestions.length;
    test.totalMarks += createdQuestions.reduce((sum, q) => sum + q.marks, 0);

    console.log("Saving updated test...");
    await test.save();

    console.log("Questions added successfully to the test.");
    return res.status(201).json({
      message: "Questions added successfully",
      data: createdQuestions,
    });
  } catch (error) {
    console.error("Error in addQuestionsToTest function:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    console.log("Starting getAllTests function...");

    console.log("Fetching all tests...");
    const tests = await Test.find()
      .populate("questions").populate("class");
    console.log("Tests fetched successfully:", tests);

    return res.status(200).json({
      message: "Get all tests",
      data: tests,
    });
  } catch (error) {
    console.error("Error in getAllTests function:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.getTestById = async (req, res) => {
  try {
    console.log("Starting getTestById function...");

    const { id } = req.params;
    console.log("Test ID:", id);

    console.log("Fetching test by ID...");
    const test = await Test.findById(id)
      // .populate("createdBy", "name email")
      .populate("questions");
    if (!test) {
      console.error("Test not found");
      return res.status(404).json({ error: "Test not found" });
    }
    console.log("Test fetched successfully:", test);

    return res.status(200).json({
      message: `Get test ${test.title}`,
      data: test,
    });
  } catch (error) {
    console.error("Error in getTestById function:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
