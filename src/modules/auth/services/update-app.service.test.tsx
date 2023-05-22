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

describe("update-app", () => {
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
            const modelName = getModelName("main", "apps");

            const insertOperation = await db.collection(modelName).insert({
                name: "about",
                callbackUrls: "/about",
            });

            const appId = insertOperation.insertedIds["0"];

            const serviceId = "main/update-app";
            const requestBody = {
                appId: {
                    name: "home",
                    callbackUrls: "/home",
                },
                appId,
            };
            const serviceResponse = await testContext.invokeService(
                serviceId,
                requestBody
            );

            expect(serviceResponse.statusCode).toStrictEqual(200);
            expect(serviceResponse.body.data).toHaveLength(1);
            expect(serviceResponse.body.meta.message).toStrictEqual(
                "App updated successfully"
            );

            console.log("Test running good");
            console.log(serviceResponse.body);
        },
        120 * 1000
    );
});
