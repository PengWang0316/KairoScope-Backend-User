'use strict';

const log = require('@kevinwang0316/log');
const cloudwatch = require('@kevinwang0316/cloudwatch');
const { promiseNextResult } = require('@kevinwang0316/mongodb-helper');

const wapper = require('../middlewares/wrapper');

const handler = async (event, context) => {
  const { userName } = event.queryStringParameters;
  try {
    const result = await cloudwatch.trackExecTime('MongoDBFindLatancy', () => promiseNextResult(db => db
      .collection(process.env.userCollectionName).find({ username: userName })));

    return { statusCode: 200, body: JSON.stringify(!result) };
  } catch (error) {
    log.error(`${context.functionName} function has error message: ${error}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wapper(handler);
