const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { userSchema, quizSchema, quizProgressSchema } = require("./schema");

const Users = mongoose.model("User", userSchema);
const Quiz = mongoose.model("Quiz", quizSchema);
const QuizProgress = mongoose.model("QuizProgress", quizProgressSchema);

// Existing functions for user management

async function getUsers() {
  return Users.find();
}

async function createUser(user) {
  user.password = await bcrypt.hash(user.password, 10);
  return Users.create(user);
}

async function updateUser(id, user) {
  return Users.findByIdAndUpdate(id, user, { new: true });
}

async function deleteUser(id) {
  return Users.findByIdAndDelete(id);
}

async function findByName(name) {
  return Users.find({ name });
}

async function findOneByEmail(email) {
  return Users.findOne({ email });
}

async function updateUserPassword(email, hashedPassword) {
  return Users.updateOne({ email }, { $set: { password: hashedPassword } });
}

async function findUserById(userId) {
  return await Users.findById(userId);
}

async function createQuiz(quiz) {
  return Quiz.create(quiz);
}

async function getQuizById(quizId) {
  return Quiz.findById(quizId);
}

async function saveQuizProgress({
  userId,
  quizId,
  correctAnswers,
  totalQuestions,
  score,
}) {
  const progress = new QuizProgress({
    userId,
    quizId,
    correctAnswers,
    totalQuestions,
    score,
  });
  return await progress.save();
}

async function getCompletedQuizzes(userId) {
  return QuizProgress.find({ userId }).populate(
    "quizId",
    "title description totalQuestions"
  );
}

async function submitQuizResult({
  userId,
  quizId,
  correctAnswers,
  totalQuestions,
}) {
  const incorrectAnswers = totalQuestions - correctAnswers;
  const score = (correctAnswers / totalQuestions) * 100;

  const progress = new QuizProgress({
    userId,
    quizId,
    correctAnswers,
    totalQuestions,
    incorrectAnswers,
    score,
  });

  return await progress.save();
}

async function getCompletedQuizzes(userId) {
  return QuizProgress.find({ userId })
    .populate("quizId", "title description")
    .select("correctAnswers incorrectAnswers totalQuestions score date");
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  findByName,
  findOneByEmail,
  updateUserPassword,
  findUserById,
  createQuiz,
  getQuizById,
  saveQuizProgress,
  getCompletedQuizzes,
  submitQuizResult,
  getCompletedQuizzes,
  getCompletedQuizzes,
};
