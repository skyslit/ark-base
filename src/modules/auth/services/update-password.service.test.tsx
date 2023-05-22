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

describe("update-password-service", () => {
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
            const modelName = getModelName("main", "accounts");
            const insertOperation = await db.collection(modelName).insert({
                password: "hello",
                email: "abc@skyslit.com"
            });

            {/*  const dummyCartItemId = insertOperation.insertedIds["0"]; */ }
            const serviceId = "main/update-password";
            const requestBody = {
                // commentId: dummyCartItemId, // Id of the cart item created in the above step
                password: "hello123",
                email: "abc@skyslit.com",
                otp: "123456",
                hash: "$2a$10$fGy8cp62KeoAWZ5cfDiYleXLaU//TJ/C7hOuISvp6qblqWOpsQubG"
            };

            const serviceResponse = await testContext.invokeService(
                serviceId,
                requestBody
            );
            expect(serviceResponse.statusCode).toStrictEqual(200);
            expect(serviceResponse.body.meta.message).toStrictEqual(
                "password reset successfull"
            );
            console.log("Test running good");
            console.log(serviceResponse.body);
            await dbConnection.close();
        },
        120 * 1000
    );
});
