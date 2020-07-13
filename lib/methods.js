'use strict';

const Question = require('../models/index').question;

async function setAnswerRight(questionId, answerId, user) {
  let result;
  try {
    result = await Question.setAnswerRight(questionId, answerId, user);
  } catch (error) {
    console.error(error);
    return false;
  }
  return result;
}

async function getLast(amount) {
  let data;
  try {
    data = await Question.getLast(10);
  } catch (error) {
    console.error(error);
  }
  console.log('Se ejecuto el metodo');
  return data;
}

module.exports = {
  setAnswerRight,
  getLast,
};
