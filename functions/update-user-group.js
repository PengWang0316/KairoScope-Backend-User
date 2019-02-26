'use strict';

const log = require('@kevinwang0316/log');
const { verifyJWT } = require('@kevinwang0316/lambda-middlewares');

const updateUser = require('./libs/update-user');
const wapper = require('../middlewares/wrapper');

const handler = async (event, context) => {
  const {
    newGroupName, oldGroupName, userList, isUpdate,
  } = JSON.parse(event.body);
  const user = { [`settings.userGroups.${newGroupName}`]: userList };
  let removeFields = null;
  if (isUpdate && newGroupName !== oldGroupName) removeFields = { [`settings.userGroups.${oldGroupName}`]: '' };

  try {
    const { value } = await updateUser(context.user._id, user, removeFields);
    value.isAuth = true;
    return { statusCode: 200, body: JSON.stringify(value) };
  } catch (error) {
    log.error(`${context.functionName} function has error message: ${error}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wapper(handler).use(verifyJWT);
