import mongodbHelper from '@kevinwang0316/mongodb-helper';
import cloudwatch from '@kevinwang0316/cloudwatch';
import log from '@kevinwang0316/log';
import { handler } from '../../functions/fetch-all-user-list';

require('../helpers/initailEnvsForUnitTest');

const findReturnValue = { _id: 'testId' };
const mockLimit = jest.fn().mockReturnValue(findReturnValue);
const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
const mockFind = jest.fn().mockReturnValue({ skip: mockSkip });
const mockCollection = jest.fn().mockReturnValue({ find: mockFind });

jest.mock('../../middlewares/wrapper', () => functionHandler => functionHandler);
jest.mock('@kevinwang0316/mongodb-helper', () => ({
  promiseFindResult: jest.fn().mockImplementation(cb => cb({ collection: mockCollection })),
}));
jest.mock('@kevinwang0316/log', () => ({ error: jest.fn() }));
jest.mock('@kevinwang0316/cloudwatch', () => ({ trackExecTime: jest.fn().mockImplementation((name, func) => func()) }));

describe('fetch-hexagrams', () => {
  beforeEach(() => {
    mockCollection.mockClear();
    mockFind.mockClear();
    mockSkip.mockClear();
    mockLimit.mockClear();
    log.error.mockClear();
    cloudwatch.trackExecTime.mockClear();
    mongodbHelper.promiseFindResult.mockClear();
  });

  test('Call without error', async () => {
    const event = { queryStringParameters: { pageNumber: '1', numberPerpage: '10' } };
    const context = {};

    const result = await handler(event, context);

    expect(cloudwatch.trackExecTime).toHaveBeenCalledTimes(1);
    expect(mongodbHelper.promiseFindResult).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenLastCalledWith(process.env.userCollectionName);
    expect(mockFind).toHaveBeenCalledTimes(1);
    expect(mockFind).toHaveBeenLastCalledWith({}, {
      displayName: 1, photo: 1, role: 1, 'settings.customName': 1,
    });
    expect(mockSkip).toHaveBeenCalledTimes(1);
    expect(mockSkip).toHaveBeenLastCalledWith(event.queryStringParameters.pageNumber * event.queryStringParameters.numberPerpage);
    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(mockLimit).toHaveBeenLastCalledWith(event.queryStringParameters.numberPerpage * 1);
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify(findReturnValue) });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('Call with database error', async () => {
    const event = { queryStringParameters: { pageNumber: '1', numberPerpage: '10' } };
    const context = { functionName: 'functionName' };

    cloudwatch.trackExecTime.mockRejectedValueOnce('Error Message');
    const result = await handler(event, context);

    expect(cloudwatch.trackExecTime).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ statusCode: 500 });
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenLastCalledWith(`${context.functionName} function has error message: Error Message`);
  });
});
