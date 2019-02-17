'use strict';

const log = require('@kevinwang0316/log');
const cloudwatch = require('@kevinwang0316/cloudwatch');

const wapper = require('../middlewares/wrapper');

const handler = (event, context) => {

};

module.exports.handler = wapper(handler);
