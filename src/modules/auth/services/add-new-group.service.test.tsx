import { createTestDb, runAppForTesting, TestContextType } from '@skyslit/ark-backend/build/test-utils';
import App from '../../../server/main.app';

const dbServer = createTestDb();

afterEach(() => dbServer.stop());

describe('add-new-group', () => {
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
       const serviceId = "main/add-new-group";
      const addGroup = {
        groupTitle: "Group 1",
        description: "634763476dedfgdfg",
        userId:"sdgashdbb"
      };
      const serviceResponse = await testContext.invokeService(
        serviceId,
        addGroup
      );
    
        expect(serviceResponse.statusCode).toStrictEqual(200);
           expect(serviceResponse.body.meta.message).toStrictEqual(
        "Group added"
      );
        console.log('Test running good');
        console.log(serviceResponse.body);
    
    }, 120 * 1000);
})