import { ObjectId } from 'mongodb';
import { promiseNextResult, initialConnects, getDB } from '@kevinwang0316/mongodb-helper';

import { invokeUpdateUserCustomName } from '../helpers/InvokeHelper';
import initEvns from '../helpers/InitialEnvs';

const FAKE_USER_ID = '59de9e50235ccf8a2bbfc0aa';
// Generate this jwt based on the fake id for the test purpose
const FAKE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWRlOWU1MDIzNWNjZjhhMmJiZmMwYWEiLCJpYXQiOjE1MTYyMzkwMjJ9._zS5ARU1LbFS9dX-qWBcIAmGsq9J0bDEtLNj4t5K1T0';

let context;

describe('update-user-custom-name: invoke the Get / endpoint', () => {
  beforeAll(async () => {
    jest.setTimeout(10000); // Setup a longer timeout to allow fetching the credantial keys from SSM.
    await initEvns();
    context = {
      dbUrl: process.env['db-host'],
      dbName: process.env['db-name'],
      jwtSecret: process.env['jwt-secret'],
    };
    await initialConnects(context.dbUrl, context.dbName);
  });

  test('invoke update-user-custom-name function', async () => {
    // This part of data will be retrieved from database
    let user = await getDB().collection(process.env.userCollectionName)
      .insertOne({ _id: new ObjectId(FAKE_USER_ID), settings: { customName: 'customName' } });

    const event = { body: JSON.stringify({ customName: 'customTestName', jwtMessage: FAKE_JWT }) };
    const res = await invokeUpdateUserCustomName(event, context);
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toBeUndefined();
    expect(res.body).not.toBeNull();
    expect(res.body).toEqual({ _id: FAKE_USER_ID, settings: { customName: 'customTestName' } });

    user = await promiseNextResult(db => db.collection(process.env.userCollectionName).find({ _id: new ObjectId(FAKE_USER_ID) }));
    const newCustomName = user.settings.customName;
    expect(newCustomName).toBe('customTestName');

    // Remove the temp user
    await getDB().collection(process.env.userCollectionName)
      .deleteOne({ _id: new ObjectId(FAKE_USER_ID) });
  });
});
