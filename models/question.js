'use strict';

class Question {
  constructor(db) {
    this.db = db;
    this.ref = this.db.ref('/');
    this.collection = this.ref.child('questions');
  }

  async createQuestion(data, user, filename) {
    let question = { ...data };
    question.owner = user;
    if (filename) {
      question.filename = filename;
    }
    const newQuestion = this.collection.push();
    newQuestion.set(question);

    return newQuestion.key;
  }

  async getLast(amount) {
    const query = await this.collection.limitToLast(amount).once('value');
    const data = query.val();
    return data;
  }

  async getOne(id) {
    const query = await this.collection.child(id).once('value');
    const data = query.val();
    return data;
  }

  async answerAQuestion(data, user) {
    let answer = { ...data };
    const newAnswer = await this.collection
      .child(answer.id)
      .child('answers')
      .push();
    newAnswer.set({ text: answer.answer, user: user });
    return newAnswer;
  }

  async setAnswerRight(questionId, answerId, user) {
    const getAQuestion = await this.collection.child(questionId).once('value');
    const question = getAQuestion.val();
    const answers = question.answers;
    // const array = Object.keys(answers);
    if (!user.email === question.owner.email) {
      return false;
    }
    for (let key in answers) {
      answers[key].correct = key === answerId;
    }
    const update = await this.collection
      .child(questionId)
      .child('answers')
      .update(answers);
    return update;
  }
}

module.exports = Question;
