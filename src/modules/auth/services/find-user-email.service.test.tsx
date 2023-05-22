import { createTestDb, runAppForTesting, TestContextType } from '@skyslit/ark-backend/build/test-utils';
import App from '../../../server/main.app';
import mongodb from 'mongodb';
import { getModelName } from '@skyslit/ark-backend';

const dbServer = createTestDb();

afterEach(() => dbServer.stop());

describe('verify-email-service', () => {
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
        const dbConnection = await mongodb.connect(await dbServer.getDbConnectionString());
        const db = dbConnection.db(await dbServer.mongod.getDbName());
        const modelName = getModelName('main', 'accounts');
        const insertOperation = await db.collection(modelName).insert({
            email: "lithinasok@gmail.com",
        });

        const serviceId = 'main/find-user-email';
        const requestBody = {
            email: "lithinasok@gmail.com",
            serviceId
        }

        const serviceResponse = await testContext.invokeService(serviceId, requestBody);

        expect(serviceResponse.statusCode).toStrictEqual(200);
        expect(serviceResponse.body.data).toHaveLength(1);
        expect(serviceResponse.body.meta.message).toStrictEqual("User with email is fetched sucessfully");
        console.log('Test running good');
        console.log(serviceResponse.body);
        await dbConnection.close();
    }, 120 * 1000);
})
