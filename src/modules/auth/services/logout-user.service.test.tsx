import {
  createTestDb,
  runAppForTesting,
  TestContextType,
} from "@skyslit/ark-backend/build/test-utils";
import App from "../../../server/main.app";

const dbServer = createTestDb();

afterEach(() => dbServer.stop());

describe("user-logout", () => {
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
      // Try invoking the service
      // Replace <service-id> with the actual value
      const serviceResponse = await testContext.invokeService(
        "main/user-logout"
      );

      // Assert status code
      expect(serviceResponse.statusCode).toStrictEqual(200);
      expect(serviceResponse.body.meta.message).toStrictEqual(
        "Successfully Logged out!"
      );
      console.log("Test running good");
      console.log(serviceResponse.body);
    },
    120 * 1000
  );
});