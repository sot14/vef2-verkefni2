import express from 'express';
import dotenv from 'dotenv';
import { router as registrationRouter } from './registration.js';
import { utils } from './utils.js';

dotenv.config();

const {
  PORT: port = process.env.port || 3000
} = process.env;

const app = express();

app.use(express.static('./public'));

app.set('views', './views');
app.set('view engine', 'ejs');
app.use('/', registrationRouter);

/**
 * Checks if signature is anonymous and if so, anonimizes the signature
 * @param {*} signature 
 */
app.locals.anonymousSignature = function(signature) {
  return utils.formatSignature(signature);
}
app.locals.dateFormatter = function(date) {
  return utils.formatDate(date);
}

app.use(express.urlencoded( {extended: true} ));


/**
 * Middleware sem sér um 404 villur.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
function notFoundHandler(req, res, next) { // eslint-disable-line
  const title = 'Fannst ekki';
  const message = 'Ó nei, efnið finnst ekki!';
  res.status(404).render('error', { title, message });
}

/**
 * Middleware sem sér um villumeðhöndlun.
 *
 * @param {object} err Villa sem kom upp
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  const title = 'Villa kom upp';
  const message = '';
  res.status(500).render('error', { title, message });
}

app.use(errorHandler);
app.use(notFoundHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
