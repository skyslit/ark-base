import {
  createTestDb,
  runAppForTesting,
  TestContextType,
} from "@skyslit/ark-backend/build/test-utils";
import App from "../../../server/main.app";

const dbServer = createTestDb();

afterEach(() => dbServer.stop());

describe("add-admin-account", () => {
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
      const serviceId = "main/add-admin-account";
      const addAccount = {
        email: "lithin@gmail.com",
        password: "634763476dedfgdfg",
      };
      const serviceResponse = await testContext.invokeService(
        serviceId,
        addAccount
      );

      expect(serviceResponse.statusCode).toStrictEqual(200);
      expect(serviceResponse.body.data).toHaveLength(2);
      expect(serviceResponse.body.meta.message).toStrictEqual(
        "Account Added Successfully"
      );

      console.log("Test running good");
      console.log(serviceResponse.body);
    },
    120 * 1000
  );
});
