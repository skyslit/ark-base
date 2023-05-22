import {
  createTestDb,
  runAppForTesting,
  TestContextType,
} from "@skyslit/ark-backend/build/test-utils";
import App from "../../../server/main.app";
import mongodb from "mongodb";
import { getModelName } from "@skyslit/ark-backend";

const dbServer = createTestDb();

afterEach(() => dbServer.stop());

describe("list-all-groups", () => {
  // Replace <service-name> with the actual value
  let testContext: TestContextType = null;

  beforeEach(async () => {
    // Creating a test database connection url
    const dbConnectionString = await dbServer.getDbConnectionString();

    // Running app in test mode with test database
    testContext = await runAppForTesting(App, {
      MONGO_CONNECTION_STRING: dbConnectionString,
    });
  });

  afterEach(async () => {
    // Destroy test db and application context after testing
    await testContext.instance.deactivate();
  });

  test(
    "general usage",
    async () => {
      const dbConnection = await mongodb.connect(
        await dbServer.getDbConnectionString()
      );
      const db = dbConnection.db(await dbServer.mongod.getDbName());
      const modelName = getModelName("main", "accounts");

      const insertOperation = await db.collection(modelName).insert(
        {
          name: "asi",
          email: "eertertert",
        },
      );
      const dummyAccountId = insertOperation.insertedIds["0"];

      const serviceId = "main/list-all-users";
      const requestBody = {};
      const serviceResponse = await testContext.invokeService(
        serviceId,
        requestBody
      );

      // Assert status code
      expect(serviceResponse.statusCode).toStrictEqual(200);

      console.log("Test running good");
      console.log(serviceResponse.body);
    },
    120 * 1000
  );
});