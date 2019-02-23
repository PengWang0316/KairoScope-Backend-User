'use strict';

const log = require('@kevinwang0316/log');
const { verifyJWT } = require('@kevinwang0316/lambda-middlewares');

const updateUser = require('./libs/update-user');
const wapper = require('../middlewares/wrapper');

const handler = async (event, context) => {
  const { user } = JSON.parse(event.body);
  try {
    const result = await updateUser(context.user._id, user);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    log.error(`${context.functionName} function has error message: ${error}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wapper(handler).use(verifyJWT);
