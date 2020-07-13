'use strict';

const Joi = require('@hapi/joi');
const Question = require('../models/index').question;
const User = require('../models/index').user;
const Boom = require('@hapi/boom');
const basic = require('@hapi/basic');

module.exports = {
  name: 'api-rest',
  version: '1.0.0',
  async register(server, options) {
    const prefix = options.prefix || 'api';

    await server.register(basic);

    server.auth.strategy('simple', 'basic', {
      validate: validateAuth,
    });

    server.route({
      method: 'GET',
      path: `/${prefix}/question/{key}`,
      options: {
        auth: 'simple',
        validate: {
          params: Joi.object({
            key: Joi.string().required(),
          }),
          failAction: failValidation,
        },
      },
      handler: async (req, h) => {
        let result;
        try {
          result = await Question.getOne(req.params.key);
          if (!result) {
            return Boom.notFound(
              `No se pudo encontrar la pregunta: ${req.params.key}`
            );
          }
        } catch (error) {
          return Boom.badImplementation(
            `Hubo un error implementando: ${req.params.key}`
          );
        }
        return result;
      },
    });

    server.route({
      method: 'GET',
      path: `/${prefix}/questions/{amount}`,
      options: {
        auth: 'simple',
        validate: {
          params: Joi.object({
            amount: Joi.number().integer().min(1).max(20).required(),
          }),
          failAction: failValidation,
        },
      },
      handler: async (req, h) => {
        let result;
        try {
          result = await Question.getLast(req.params.amount);
          if (!result) {
            return Boom.notFound(`No se pudo recuperar las preguntas`);
          }
        } catch (error) {
          return Boom.badImplementation(`Hubo un error buscando las preguntas`);
        }
        return result;
      },
    });

    function failValidation(req, h, err) {
      return Boom.badRequest(`Por favor use los parametros correctos`);
    }

    async function validateAuth(req, userName, passd, h) {
      let user
      try {
        user = await User.validateUser({
          email: userName,
          password: passd
        })
      } catch (error) {
        server.log('error', error)
      }
      return {
        credentials: user || {},
        isValid: (user !== false)
      }
    }
  },
};
