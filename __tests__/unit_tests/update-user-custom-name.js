import log from '@kevinwang0316/log';

import { handler } from '../../functions/update-user-custom-name';
import updateUser from '../../functions/libs/update-user';

require('../helpers/initailEnvsForUnitTest');

jest.mock('../../middlewares/wrapper', () => functionHandler => ({ use: jest.fn().mockReturnValue(functionHandler) }));
jest.mock('@kevinwang0316/log', () => ({ error: jest.fn() }));
jest.mock('../../functions/libs/update-user', () => jest.fn().mockReturnValue({ value: 'value' }));

describe('update-user-custom-name', () => {
  beforeEach(() => {
    updateUser.mockClear();
    log.error.mockClear();
  });

  test('calling updateUser without error name less than 20', async () => {
    const event = { body: JSON.stringify({ customName: 'customName' }) };
    const context = { functionName: 'functionName', user: { _id: 'userId' } };

    const result = await handler(event, context);

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenLastCalledWith(context.user._id, { 'settings.customName': 'customName' });
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify('value') });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('calling updateUser without error name greater than 20', async () => {
    const customName = 'customNameooooooooooooooooooooooooo';
    const event = { body: JSON.stringify({ customName }) };
    const context = { functionName: 'functionName', user: { _id: 'userId' } };

    const result = await handler(event, context);

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenLastCalledWith(context.user._id, { 'settings.customName': customName.slice(0, 20) });
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify('value') });
    expect(log.error).not.toHaveBeenCalled();
  });

  test('calling updateUser with updateUser function error', async () => {
    const event = { body: JSON.stringify({ customName: 'customName' }) };
    const context = { functionName: 'functionName', user: { _id: 'userId' } };

    updateUser.mockReturnValueOnce(Promise.reject(('Error Message')));

    const result = await handler(event, context);

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenLastCalledWith(context.user._id, { 'settings.customName': 'customName' });
    expect(result).toEqual({ statusCode: 500 });
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenLastCalledWith(`${context.functionName} function has error message: Error Message`);
  });
});
