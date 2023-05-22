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

describe("assign-group", () => {
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

      const insertOperation = await db.collection(modelName).insert({
        groupTitle: "Group1",
      });
      const categoryId = insertOperation.insertedIds["0"];

      const serviceId = "main/assign-group";
      const requestBody = {
        categoryId,
      };
      const serviceResponse = await testContext.invokeService(
        serviceId,
        requestBody
      );

      expect(serviceResponse.statusCode).toStrictEqual(200);
      expect(serviceResponse.body.meta.message).toStrictEqual(
        "Groups listed"
      );

      console.log("Test running good");
      console.log(serviceResponse.body);
    },
    120 * 1000
  );
});