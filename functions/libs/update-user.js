'use strict';

const { ObjectId } = require('mongodb');
const cloudwatch = require('@kevinwang0316/cloudwatch');
const { promiseReturnResult } = require('@kevinwang0316/mongodb-helper');

module.exports = async (userId, user, removeFields) => cloudwatch.trackExecTime(
  'MongoDBFindAndUpdateLatancy',
  () => promiseReturnResult(db => db
    .collection(process.env.userCollectionName).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      removeFields ? { $set: user, $unset: removeFields } : { $set: user },
      { returnOriginal: false, projection: { pushSubscription: 0 } },
    )),
);
