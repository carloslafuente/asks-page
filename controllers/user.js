'use strict';

const User = require('../models/index').user;
const boom = require('@hapi/boom');

async function createUser(req, h) {
  let result;
  try {
    result = await User.createUser(req.payload);
  } catch (error) {
    console.error(error);
    return h.view('register', {
      titulo: 'Registro',
      error: 'Error al crear el usuario',
    });
  }
  return h.view('register', {
    titulo: 'Home',
    success: 'Usuario creado exitosamente',
  });
}

async function validateUser(req, h) {
  let result;
  try {
    result = await User.validateUser(req.payload);
    if (!result) {
      //   return h.response('Email o contraseña incorrecta').code(401);
      return h.view('login', {
        titulo: 'Login',
        error: 'Email o contraseña incorrecta',
      });
    }
  } catch (error) {
    console.error(error);
    // return h.response('Problemas al loguear el usuario').code(500);
    return h.view('login', {
      titulo: 'Login',
      error: 'Problemas al loguear el usuario',
    });
  }
  // Seteando las credenciales en la cokie del usuario
  return h.redirect('/').state('user', {
    name: result.name,
    email: result.email,
  });
}

function logoutUser(req, h) {
  return h.redirect('/login').unstate('user');
}

function failValidation(req, h, error) {
  const templates = {
    '/create-user': 'register',
    '/login-user': 'login',
    '/create-question': 'ask',
  };
  // retorno la vista con base a la ruta donde se originó el error de validación
  // es importante detener la propagación del error en este punto y responder (takeover)
  // takeover finaliza el livecycle inmediatamente para responder el error
  return h
    .view(templates[req.path], {
      titulo: 'Error de validacion',
      error: 'Por favor complete los campos requeridos',
    })
    .code(404)
    .takeover();
}

module.exports = {
  createUser,
  validateUser,
  logoutUser,
  failValidation,
};
