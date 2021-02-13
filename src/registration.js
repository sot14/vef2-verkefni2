import express from 'express';
import validator from 'express-validator';

import xss from 'xss';
import { db } from './db.js';

export const router = express.Router();
const { validationResult, body} = validator;


// TODO skráningar virkni

function catchErrors(fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
  }

async function showSignatures(req, res) {
    const signatureList = await select();
    const data = {
        title: 'Undirskriftarlisti',
        name: '',
        nationalId: '',
        comment: '',
        anonymous: 'false',
        errors: [],
        signatureList,
      };
    return res.render('registration', {data});
}

async function select() {
    const result = await db.query('SELECT * FROM signatures ORDER BY id DESC;');
    return result.rows;
}
router.use(express.urlencoded({ extended: true }));
/**
 * Hjálparfall sem XSS hreinsar reit í formi eftir heiti.
 *
 * @param {string} fieldName Heiti á reit
 * @returns {function} Middleware sem hreinsar reit ef hann finnst
 */
function sanitizeXss(fieldName) {
    return (req, res, next) => {
      if (!req.body) {
        next();
      }
  
      const field = req.body[fieldName];
  
      if (field) {
        req.body[fieldName] = xss(field);
      }
  
      next();
    };
 }


const validations = [
    body('name').isLength({min: 1}).withMessage('Nafn má ekki vera tómt'),
    body('nationalId').isLength({min: 1}).withMessage('Kennitala verður að vera 10 stafir'),
    body('nationalId').matches(/^[0-9]{6}-?[0-9]{4}$/).withMessage('Kennitala verður að vera á gildu formi'),
];

const sanitazions = [
    body('name').trim().escape(),
    sanitizeXss('name'),

    body('nationalId').blacklist('-'),

    body('comment').trim().escape(),
];


/**
 * Ósamstilltur route handler sem vistar gögn í gagnagrunn og sendir
 * á þakkarsíðu
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function formPost(req, res) {

    const {
      body: {
        name = '',
        nationalId = '',
        comment = '',
        anonymous = 'false',
      } = {},
    } = req;

    const data = {
      name,
      nationalId,
      comment,
      anonymous,
    };
  
    await db.insert(data);
    return res.redirect('/');
  }

/**
 * Route handler sem athugar stöðu á undirskrift og birtir villur ef einhverjar,
 * sendir annars áfram í næsta middleware.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 * @returns Næsta middleware ef í lagi, annars síðu með villum
 */
async function showErrors(req, res, next) {
  
    const {
      body: {
        name = '',
        nationalId = req.body.nationalId,
        comment = '',
        anonymous = '',
      } = {},
    } = req;
  
    const data = {
      name,
      nationalId,
      comment,
      anonymous,
    };
  
    const validation = validationResult(req);
  
    if (!validation.isEmpty()) {
      const errors = validation.array();
      data.errors = errors;
      data.errorsTitle = 'Villur við undirskrift';
      const signatureList = await select();
      data.signatureList = signatureList;
  
      return res.render('registration', {data});
    }
  
    return next();
  }

  router.get('/', catchErrors(showSignatures));
  router.post('/', validations, showErrors, sanitazions, catchErrors(formPost));


