'use strict';

const log = require('@kevinwang0316/log');
const cloudwatch = require('@kevinwang0316/cloudwatch');
const { promiseFindResult } = require('@kevinwang0316/mongodb-helper');

const wapper = require('../middlewares/wrapper');

const handler = async (event, context) => {
  const { pageNumber, numberPerpage } = event.queryStringParameters;
  try {
    const result = await cloudwatch.trackExecTime('MongoDBFindLatancy', () => promiseFindResult(db => db
      .collection(process.env.userCollectionName).find({}, {
        displayName: 1, photo: 1, role: 1, 'settings.customName': 1,
      }).skip(pageNumber * numberPerpage).limit(numberPerpage * 1)));

    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    log.error(`${context.functionName} function has error message: ${error}`);
    return { statusCode: 500 };
  }
};

module.exports.handler = wapper(handler);
