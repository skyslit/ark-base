import { createTestDb, runAppForTesting, TestContextType } from '@skyslit/ark-backend/build/test-utils';
import App from '../../../server/main.app';
import mongodb from 'mongodb';
import { getModelName } from '@skyslit/ark-backend';

const dbServer = createTestDb();

afterEach(() => dbServer.stop());

describe('registration-service', () => {
    let testContext: TestContextType = null;

    beforeEach(async () => {
        // Creating a test database connection url
        const dbConnectionString = await dbServer.getDbConnectionString();

        // Running app in test mode with test database
        testContext = await runAppForTesting(App, {
            'MONGO_CONNECTION_STRING': dbConnectionString
        });
    });

    afterEach(async () => {
        // Destroy test db and application context after testing
        await testContext.instance.deactivate();
    })

    test('general usage', async () => {
        const serviceId = "main/registration-service";

        const emailId = {
            email: "jhdfgbhsdv",
        };

        const serviceResponse = await testContext.invokeService(
            serviceId,
            emailId,
        );

        // Assert status code
        expect(serviceResponse.statusCode).toStrictEqual(200);
        expect(serviceResponse.body.meta.message).toStrictEqual("OTP sent successfully");
        console.log('Test running good');
        console.log(serviceResponse.body);
    }, 120 * 1000);
})