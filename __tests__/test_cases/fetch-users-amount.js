import { invokeFetchUsersAmount } from '../helpers/InvokeHelper';
import initEvns from '../helpers/InitialEnvs';

let context;

describe('fetch-users-amount: invoke the Get / endpoint', () => {
  beforeAll(async () => {
    jest.setTimeout(10000); // Setup a longer timeout to allow fetching the credantial keys from SSM.
    await initEvns();
    context = {
      dbUrl: process.env['db-host'],
      dbName: process.env['db-name'],
      jwtSecret: process.env['jwt-secret'],
    };
  });

  test('invoke fetch-hexagrams function', async () => {
    const event = {};
    const res = await invokeFetchUsersAmount(event, context);
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toBeUndefined();
    expect(res.body).not.toBeNull();
    expect(res.body).toBeGreaterThan(28);
  });
});
