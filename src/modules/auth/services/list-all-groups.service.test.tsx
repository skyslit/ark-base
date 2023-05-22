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
          groupTitle: "asi",
          description: "eertertert",
          groupId: "two",

        },
      );

      const dummyAccountId = insertOperation.insertedIds["0"];

      const serviceId = "main/list-all-groups";
      const requestBody = {};
      const serviceResponse = await testContext.invokeService(
        serviceId,
        requestBody
      );

      expect(serviceResponse.statusCode).toStrictEqual(200);

      console.log("Test running good");
      console.log(serviceResponse.body);
    },
    120 * 1000
  );
});