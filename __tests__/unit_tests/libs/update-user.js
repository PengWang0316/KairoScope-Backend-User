import { ObjectId } from 'mongodb';
import mongodbHelper from '@kevinwang0316/mongodb-helper';
import cloudwatch from '@kevinwang0316/cloudwatch';

import updateUser from '../../../functions/libs/update-user';

const returnValue = { _id: 'id', newContent: 'newContent' };
const mockfindOneAndUpdate = jest.fn().mockReturnValue(returnValue);
const mockCollection = jest.fn().mockReturnValue({ findOneAndUpdate: mockfindOneAndUpdate });

jest.mock('@kevinwang0316/mongodb-helper', () => ({
  promiseReturnResult: jest.fn().mockImplementation(cb => cb({ collection: mockCollection })),
}));
jest.mock('@kevinwang0316/log', () => ({ error: jest.fn() }));
jest.mock('@kevinwang0316/cloudwatch', () => ({ trackExecTime: jest.fn().mockImplementation((name, func) => func()) }));

describe('update-user', () => {
  beforeEach(() => {
    mockCollection.mockClear();
    mockfindOneAndUpdate.mockClear();
    cloudwatch.trackExecTime.mockClear();
    mongodbHelper.promiseReturnResult.mockClear();
  });

  test('calling updateUser with remove fields', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const user = { _id: 'userId' };
    const removeFields = { removeFields: {} };

    const result = await updateUser(userId, user, removeFields);

    expect(cloudwatch.trackExecTime).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenLastCalledWith(process.env.userCollectionName);
    expect(mockfindOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(mockfindOneAndUpdate).toHaveBeenLastCalledWith(
      { _id: new ObjectId(userId) },
      { $set: user, $unset: removeFields },
      { returnOriginal: false, projection: { pushSubscription: 0 } },
    );
    expect(result).toBe(returnValue);
  });

  test('calling updateUser without remove fields', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const user = { _id: 'userId' };
    const removeFields = undefined;

    const result = await updateUser(userId, user, removeFields);

    expect(cloudwatch.trackExecTime).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenLastCalledWith(process.env.userCollectionName);
    expect(mockfindOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(mockfindOneAndUpdate).toHaveBeenLastCalledWith(
      { _id: new ObjectId(userId) },
      { $set: user },
      { returnOriginal: false, projection: { pushSubscription: 0 } },
    );
    expect(result).toBe(returnValue);
  });
});
