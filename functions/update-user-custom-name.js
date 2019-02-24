'use strict';

const log = require('@kevinwang0316/log');
const { verifyJWT } = require('@kevinwang0316/lambda-middlewares');

const updateUser = require('./libs/update-user');
const wapper = require('../middlewares/wrapper');

const handler = async (event, context) => {
  let { customName } = JSON.parse(event.body);
  customName = customName.length > 20
    ? customName.slice(0, 20)
    : customName;
  try {
    const result = await updateUser(context.user._id, { 'settings.customName': customName });
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    log.error(`${context.functionName} function has error message: ${error}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wapper(handler).use(verifyJWT);
