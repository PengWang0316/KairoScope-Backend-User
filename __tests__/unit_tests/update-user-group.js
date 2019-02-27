import log from '@kevinwang0316/log';

import { handler } from '../../functions/update-user-group';
import updateUser from '../../functions/libs/update-user';

require('../helpers/initailEnvsForUnitTest');

jest.mock('../../middlewares/wrapper', () => functionHandler => ({ use: jest.fn().mockReturnValue(functionHandler) }));
jest.mock('@kevinwang0316/log', () => ({ error: jest.fn() }));
jest.mock('../../functions/libs/update-user', () => jest.fn().mockReturnValue({ value: { id: 'id' } }));

describe('update-user-group', () => {
  beforeEach(() => {
    updateUser.mockClear();
    log.error.mockClear();
  });

  test('calling updateUser without error isUpdate false', async () => {
    const event = {
      body: JSON.stringify({
        newGroupName: 'newGroupName',
        oldGroupName: 'oldGroupName',
        userList: [],
        isUpdate: false,
      }),
    };
    const context = { functionName: 'functionName', user: { _id: 'userId' } };

    const result = await handler(event, context);

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenLastCalledWith(context.user._id, { 'settings.userGroups.newGroupName': [] }, null);
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify({ id: 'id', isAuth: true }) });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('calling updateUser without error isUpdate true same group names', async () => {
    const event = {
      body: JSON.stringify({
        newGroupName: 'oldGroupName',
        oldGroupName: 'oldGroupName',
        userList: [],
        isUpdate: true,
      }),
    };
    const context = { functionName: 'functionName', user: { _id: 'userId' } };

    const result = await handler(event, context);

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenLastCalledWith(context.user._id, { 'settings.userGroups.oldGroupName': [] }, null);
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify({ id: 'id', isAuth: true }) });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('calling updateUser without error isUpdate true different group names', async () => {
    const event = {
      body: JSON.stringify({
        newGroupName: 'newGroupName',
        oldGroupName: 'oldGroupName',
        userList: [],
        isUpdate: true,
      }),
    };
    const context = { functionName: 'functionName', user: { _id: 'userId' } };

    const result = await handler(event, context);

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenLastCalledWith(context.user._id, { 'settings.userGroups.newGroupName': [] }, { 'settings.userGroups.oldGroupName': '' });
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify({ id: 'id', isAuth: true }) });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('calling updateUser with updateUser function error', async () => {
    const event = {
      body: JSON.stringify({
        newGroupName: 'newGroupName',
        oldGroupName: 'oldGroupName',
        userList: [],
        isUpdate: true,
      }),
    };
    const context = { functionName: 'functionName', user: { _id: 'userId' } };

    updateUser.mockReturnValueOnce(Promise.reject(('Error Message')));

    const result = await handler(event, context);
    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenLastCalledWith(context.user._id, { 'settings.userGroups.newGroupName': [] }, { 'settings.userGroups.oldGroupName': '' });
    expect(result).toEqual({ statusCode: 500 });
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenLastCalledWith(`${context.functionName} function has error message: Error Message`);
  });
});
