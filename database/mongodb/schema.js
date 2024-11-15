// schema.js
const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

// Define the quiz schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  totalQuestions: {
    type: Number,
    required: true,
  },
});

// Define the quiz progress schema
const quizProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  incorrectAnswers: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});


module.exports = {
  userSchema,
  quizSchema,
  quizProgressSchema,
};
