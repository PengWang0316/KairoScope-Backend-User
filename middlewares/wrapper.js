'use strict';

/*
 * A middleware to wrap some comman middlwares. So all function will have these middlewares automatically.
 */
const middy = require('middy');
const {
  cors, functionShield, ssm, doNotWaitForEmptyEventLoop,
} = require('middy/middlewares');
const {
  verifyJWT, initializeMongoDB, mongoSanitize, sampleLogging,
} = require('@kevinwang0316/lambda-middlewares');

const { STAGE } = process.env;


module.exports = func => middy(func)
  .use(cors({
    origin: 'https://kairoscope.resonancepath.com',
    credentials: true,
  }))
  .use(ssm({
    cache: true,
    cacheExpiryInMillis: 3 * 60 * 1000,
    setToContext: true, // Save the parameters to context instead of env. The parameters will just live in memory for the security concern.
    names: {
      dbUrl: `/kairoscope/${STAGE}/db-host`,
      dbName: `/kairoscope/${STAGE}/db-name`,
      jwtSecret: `/kairoscope/${STAGE}/jwt-secret`,
      FUNCTION_SHIELD_TOKEN: `/kairoscope/${STAGE}/function_shield_token`,
    },
  }))
  .use(sampleLogging())
  .use(functionShield({
    policy: {
      outbound_connectivity: 'alert',
      read_write_tmp: 'block',
      create_child_process: 'block',
      read_handler: 'block',
    },
  }))
  .use(mongoSanitize)
  .use(doNotWaitForEmptyEventLoop())
  .use(initializeMongoDB)
  .use(verifyJWT);
