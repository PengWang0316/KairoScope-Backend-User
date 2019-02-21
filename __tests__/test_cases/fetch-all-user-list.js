import { invokeFetchAllUserList } from '../helpers/InvokeHelper';
import initEvns from '../helpers/InitialEnvs';

let context;

describe('fetch-all-user-list: invoke the Get / endpoint', () => {
  beforeAll(async () => {
    jest.setTimeout(10000); // Setup a longer timeout to allow fetching the credantial keys from SSM.
    await initEvns();
    context = {
      dbUrl: process.env['db-host'],
      dbName: process.env['db-name'],
      jwtSecret: process.env['jwt-secret'],
    };
  });

  test('invoke fetch-all-user-list function', async () => {
    const event = { queryStringParameters: { pageNumber: '1', numberPerpage: '10' } };
    const res = await invokeFetchAllUserList(event, context);
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toBeUndefined();
    expect(res.body).not.toBeNull();
    expect(Object.keys(res.body).length).toBe(10);
    expect(Object.keys(res.body[0]).length).toBe(4);
  });
});
