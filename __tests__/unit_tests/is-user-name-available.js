import mongodbHelper from '@kevinwang0316/mongodb-helper';
import cloudwatch from '@kevinwang0316/cloudwatch';
import log from '@kevinwang0316/log';

import { handler } from '../../functions/is-user-name-available';

require('../helpers/initailEnvsForUnitTest');

const returnName = 'name';
const mockFind = jest.fn().mockReturnValue(returnName);
const mockCollection = jest.fn().mockReturnValue({ find: mockFind });

jest.mock('../../middlewares/wrapper', () => functionHandler => functionHandler);
jest.mock('@kevinwang0316/mongodb-helper', () => ({
  promiseNextResult: jest.fn().mockImplementation(cb => cb({ collection: mockCollection })),
}));
jest.mock('@kevinwang0316/log', () => ({ error: jest.fn() }));
jest.mock('@kevinwang0316/cloudwatch', () => ({ trackExecTime: jest.fn().mockImplementation((name, func) => func()) }));

describe('is-user-name-available', () => {
  beforeEach(() => {
    mockCollection.mockClear();
    mockFind.mockClear();
    log.error.mockClear();
    cloudwatch.trackExecTime.mockClear();
    mongodbHelper.promiseNextResult.mockClear();
  });

  test('calling find the name without error', async () => {
    const event = { queryStringParameters: { userName: 'name' } };
    const context = {};

    const result = await handler(event, context);

    expect(cloudwatch.trackExecTime).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenLastCalledWith(process.env.userCollectionName);
    expect(mockFind).toHaveBeenCalledTimes(1);
    expect(mockFind).toHaveBeenLastCalledWith({ username: event.queryStringParameters.userName });
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify(!returnName) });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('calling does not find the name without error', async () => {
    const event = { queryStringParameters: { userName: 'name' } };
    const context = {};

    mockFind.mockReturnValueOnce(null);

    const result = await handler(event, context);

    expect(cloudwatch.trackExecTime).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenLastCalledWith(process.env.userCollectionName);
    expect(mockFind).toHaveBeenCalledTimes(1);
    expect(mockFind).toHaveBeenLastCalledWith({ username: event.queryStringParameters.userName });
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify(!null) });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('calling database error with error', async () => {
    const event = { queryStringParameters: { userName: 'name' } };
    const context = { functionName: 'function name' };

    cloudwatch.trackExecTime.mockRejectedValueOnce('Error Message');

    const result = await handler(event, context);

    expect(cloudwatch.trackExecTime).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ statusCode: 500 });
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenLastCalledWith(`${context.functionName} function has error message: Error Message`);
  });
});
