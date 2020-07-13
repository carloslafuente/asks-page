'use strict';

const hapi = require('@hapi/hapi');
const handlebars = require('./lib/helpers');
const vision = require('@hapi/vision');
const inert = require('@hapi/inert');
const path = require('path');
const routes = require('./routes');
const site = require('./controllers/site');
const methods = require('./lib/methods');
const good = require('@hapi/good');
const goodConsole = require('@hapi/good-console');
const crumb = require('@hapi/crumb');
const scooter = require('@hapi/scooter');
const blankie = require('blankie');

const server = hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  routes: {
    files: {
      relativeTo: path.join(__dirname, 'public'),
    },
  },
});

const declarePlugins = async () => {
  await server.register(inert);
  await server.register(vision);
  await server.register({
    plugin: good,
    options: {
      reporters: {
        console: [
          {
            module: goodConsole,
          },
          'stdout',
        ],
      },
    },
  });
  await server.register({
    plugin: require('./lib/api'),
    options: {
      prefix: 'api',
    },
  });
  await server.register({
    plugin: crumb,
    options: {
      cookieOptions: {
        isSecure: process.env.NODE_ENV === 'production',
      },
    },
  });
  await server.register([
    scooter,
    {
      plugin: blankie,
      options: {
        defaultSrc: `'self' 'unsafe-inline'`,
        styleSrc: `'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com/`,
        fontSrc: `'self' 'unsafe-inline' data:`,
        scriptSrc: `'self' 'unsafe-inline' https://cdnjs.cloudflare.com/ https://maxcdn.bootstrapcdn.com/ https://code.jquery.com/`,
        generateNonces: false,
      },
    },
  ]);
};

const initViews = async () => {
  await server.views({
    engines: {
      hbs: handlebars,
    },
    relativeTo: __dirname,
    path: 'views',
    layout: true,
    layoutPath: 'views',
  });
};

const init = async () => {
  try {
    await declarePlugins();

    // server.method('setAnswerRight', methods.setAnswerRight);
    // server.method('getLast', methods.getLast, {
    //   cache: {
    //     expiresIn: 1000 * 60,
    //     generateTimeout: 2000,
    //   },
    // });

    // Definiendo las opciones de estado de las cokies en una variable user
    // server.state('user', {
    //   ttl: 1000 * 60 * 60 * 24 * 7,
    //   isSecure: process.env.NODE_ENV === 'production',
    //   encoding: 'base64json',
    // });

    server.route(routes);
    await initViews();
    server.ext('onPreResponse', site.fileNotFound);
    await server.start();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  server.log('info', `Servidor corriendo en: ${server.info.uri}`);
};

process.on('unhandledRejection', (error) => {
  server.log('unhandledRejection', error);
});

process.on('unhandledException', (error) => {
  server.log('unhandledException', error);
});

console.log(process.env.NODE_ENV, process.env.HOST, process.env.PORT);
console.log(server.info);

init();
