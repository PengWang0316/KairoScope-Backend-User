'use strict';

const log = require('@kevinwang0316/log');
const cloudwatch = require('@kevinwang0316/cloudwatch');
const { promiseReturnResult } = require('@kevinwang0316/mongodb-helper');

const wapper = require('../middlewares/wrapper');

const handler = async (event, context) => {
  try {
    const result = await cloudwatch.trackExecTime('MongoDBFindLatancy', () => promiseReturnResult(db => db
      .collection(process.env.userCollectionName).count({})));

    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    log.error(`${context.functionName} function has error message: ${error}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wapper(handler);
