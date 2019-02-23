import log from '@kevinwang0316/log';

import { handler } from '../../functions/update-user-custom-name';
import updateUser from '../../functions/libs/update-user';

require('../helpers/initailEnvsForUnitTest');

jest.mock('../../middlewares/wrapper', () => functionHandler => ({ use: jest.fn().mockReturnValue(functionHandler) }));
jest.mock('@kevinwang0316/log', () => ({ error: jest.fn() }));
jest.mock('../../functions/libs/update-user', () => jest.fn().mockReturnValue(true));

describe('update-user-custom-name', () => {
  beforeEach(() => {
    updateUser.mockClear();
    log.error.mockClear();
  });

  test('calling updateUser without error', async () => {
    const event = { body: JSON.stringify({ user: { username: 'username' } }) };
    const context = { functionName: 'functionName', user: { _id: 'userId' } };

    const result = await handler(event, context);

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenLastCalledWith(context.user._id, JSON.parse(event.body).user);
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify(true) });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('calling updateUser with updateUser function error', async () => {
    const event = { body: JSON.stringify({ user: { username: 'username' } }) };
    const context = { functionName: 'functionName', user: { _id: 'userId' } };

    updateUser.mockReturnValueOnce(Promise.reject(('Error Message')));

    const result = await handler(event, context);

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenLastCalledWith(context.user._id, JSON.parse(event.body).user);
    expect(result).toEqual({ statusCode: 500 });
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenLastCalledWith(`${context.functionName} function has error message: Error Message`);
  });
});
