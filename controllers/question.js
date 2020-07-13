'use strict';

const Question = require('../models/index').question;
// Para la subida de archivos destructuramos del modulo fs de node
const fs = require('fs');
const { promisify } = require('util');
const { join } = require('path');
const { v1: uuid } = require('uuid');

async function createQuestion(req, h) {
  if (!req.state.user) {
    return h.redirect('/login');
  }
  let result, filename;
  try {
    if (req.payload.image != null) {
      filename = `${uuid()}.png`;
      fs.readFile(req.payload.image.path, (err, data) => {
        fs.writeFile(
          join(__dirname, '..', 'public', 'uploads', filename),
          data,
          (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log(data);
            }
          }
        );
      });
    }
    result = await Question.createQuestion(
      req.payload,
      req.state.user,
      filename
    );
    req.log('info', `Pregunta creada con el ID: ${result}`);
  } catch (error) {
    req.log('error', `Ocurrio un error: ${error}`);

    return h
      .view('ask', {
        title: 'Crear Pregunta',
        error: 'Error al crear la pregunta',
      })
      .code(500)
      .takeover();
  }
  return h.redirect(`/question/${result}`);
}

async function answerQuestion(req, h) {
  if (!req.state.user) {
    return h.redirect('/login');
  }
  let result;
  try {
    result = await Question.answerAQuestion(req.payload, req.state.user);
    console.log(`Respuesta creada: ${result}`);
  } catch (error) {
    console.error(error);
  }
  return h.redirect(`/question/${req.payload.id}`);
}

async function setAnswerRight(req, h) {
  if (!req.state.user) {
    return h.redirect('/login');
  }
  let result;
  try {
    result = await req.server.methods.setAnswerRight(
      req.params.questionId,
      req.params.answerId,
      req.state.user
    );
  } catch (error) {
    console.error(error);
  }
  return h.redirect(`/question/${req.params.questionId}`);
}

module.exports = {
  createQuestion,
  answerQuestion,
  setAnswerRight,
};
