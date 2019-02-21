import mongodbHelper from '@kevinwang0316/mongodb-helper';
import cloudwatch from '@kevinwang0316/cloudwatch';
import log from '@kevinwang0316/log';

import { handler } from '../../functions/fetch-users-amount';

require('../helpers/initailEnvsForUnitTest');

const returnValue = 10;
const mockCount = jest.fn().mockReturnValue(returnValue);
const mockCollection = jest.fn().mockReturnValue({ count: mockCount });

jest.mock('../../middlewares/wrapper', () => functionHandler => functionHandler);
jest.mock('@kevinwang0316/mongodb-helper', () => ({
  promiseReturnResult: jest.fn().mockImplementation(cb => cb({ collection: mockCollection })),
}));
jest.mock('@kevinwang0316/log', () => ({ error: jest.fn() }));
jest.mock('@kevinwang0316/cloudwatch', () => ({ trackExecTime: jest.fn().mockImplementation((name, func) => func()) }));

describe('fetch-users-amount', () => {
  beforeEach(() => {
    mockCollection.mockClear();
    mockCount.mockClear();
    log.error.mockClear();
    cloudwatch.trackExecTime.mockClear();
    mongodbHelper.promiseReturnResult.mockClear();
  });

  test('calling fetchUsersAmount without error', async () => {
    const event = {};
    const context = {};

    const result = await handler(event, context);

    expect(cloudwatch.trackExecTime).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenLastCalledWith(process.env.userCollectionName);
    expect(mockCount).toHaveBeenCalledTimes(1);
    expect(mockCount).toHaveBeenLastCalledWith({});
    expect(result).toEqual({ statusCode: 200, body: returnValue.toString() });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('calling fetchUsersAmount with database error', async () => {
    const event = {};
    const context = { functionName: 'functionName' };
    cloudwatch.trackExecTime.mockRejectedValueOnce('Error Message');

    await handler(event, context);

    expect(cloudwatch.trackExecTime).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenLastCalledWith(`${context.functionName} function has error message: Error Message`);
  });
});
