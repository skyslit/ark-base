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

describe("group-details", () => {
  let testContext: TestContextType = null;

  beforeEach(async () => {
    const dbConnectionString = await dbServer.getDbConnectionString();

    testContext = await runAppForTesting(App, {
      MONGO_CONNECTION_STRING: dbConnectionString,
    });
  });

  afterEach(async () => {
    await testContext.instance.deactivate();
  });

  test(
    "general usage",
    async () => {
      const dbConnection = await mongodb.connect(
        await dbServer.getDbConnectionString()
      );
      const db = dbConnection.db(await dbServer.mongod.getDbName());
      const modelName = getModelName("main", "groups");

      const insertOperation = await db.collection(modelName).insert(
        {
          groupId: "eertertert",
          
        },
      );
      const dummyAccountId = insertOperation.insertedIds["0"];

      const serviceId = "main/group-details";
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