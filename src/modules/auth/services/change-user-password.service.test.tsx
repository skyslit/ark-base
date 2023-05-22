import { createTestDb, runAppForTesting, TestContextType } from '@skyslit/ark-backend/build/test-utils';
import App from '../../../server/main.app';
import mongodb from "mongodb";
import { getModelName } from "@skyslit/ark-backend";

const dbServer = createTestDb();

afterEach(() => dbServer.stop());

describe('update-account', () => {
  let testContext: TestContextType = null;

  beforeEach(async () => {
    const dbConnectionString = await dbServer.getDbConnectionString();

    testContext = await runAppForTesting(App, {
      'MONGO_CONNECTION_STRING': dbConnectionString
    });
  });

  afterEach(async () => {
    await testContext.instance.deactivate();
  })

  test('general usage', async () => {
    const dbConnection = await mongodb.connect(
      await dbServer.getDbConnectionString()
    );
    const db = dbConnection.db(await dbServer.mongod.getDbName());
    const modelName = getModelName("main", "accounts");
    const insertOperation = await db.collection(modelName).insert({
      password: "123456"
    });
    const dummyCartItemId = insertOperation.insertedIds["0"];
    const serviceId = "main/change-user-password";
    const requestBody = {
      accountId: dummyCartItemId,
      password: "123456789"
    };

    const serviceResponse = await testContext.invokeService(
      serviceId,
      requestBody
    );
    expect(serviceResponse.statusCode).toStrictEqual(200);
    expect(serviceResponse.body.meta.message).toStrictEqual(
      "Password updated successfully"
    );
    expect(serviceResponse.body.data).toHaveLength(1);
    console.log("Test running good");
    console.log(serviceResponse.body);
    await dbConnection.close();

  }, 120 * 1000);
})