import { invokeIsUserNameAvailable } from '../helpers/InvokeHelper';
import initEvns from '../helpers/InitialEnvs';

let context;

describe('is-user-name-available: invoke the Get / endpoint', () => {
  beforeAll(async () => {
    jest.setTimeout(10000); // Setup a longer timeout to allow fetching the credantial keys from SSM.
    await initEvns();
    context = {
      dbUrl: process.env['db-host'],
      dbName: process.env['db-name'],
      jwtSecret: process.env['jwt-secret'],
    };
  });

  test('invoke fetch-hexagrams function with a name found', async () => {
    const event = { queryStringParameters: { userName: 'testname' } };
    const res = await invokeIsUserNameAvailable(event, context);
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toBeUndefined();
    expect(res.body).not.toBeNull();
    expect(res.body).toBe(false);
  });

  test('invoke fetch-hexagrams function with a name not existed', async () => {
    const event = { queryStringParameters: { userName: '123NotExistedName000_3ASX' } };
    const res = await invokeIsUserNameAvailable(event, context);
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toBeUndefined();
    expect(res.body).not.toBeNull();
    expect(res.body).toBe(true);
  });
});
