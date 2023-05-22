import { createTestDb, runAppForTesting, TestContextType } from '@skyslit/ark-backend/build/test-utils';
import App from '../../../server/main.app';


const dbServer = createTestDb();

afterEach(() => dbServer.stop());

describe('add-user', () => {
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

      const serviceId = "main/add-user";

      const addUser = {
      name:"kjsdfbkjs",
      email:"jhdfgbhsdv",
      password:"hbfhhbef",
      groupId:["ksjdhjnfds"],
      };
      
    {/*   const addMember = {
        groupId:"sdsdgdg",
        userId:"styrty",
        count:1
      } */}
      const serviceResponse = await testContext.invokeService(
        serviceId,
        addUser,
      );
    
        // Assert status code
        expect(serviceResponse.statusCode).toStrictEqual(200);
           expect(serviceResponse.body.meta.message).toStrictEqual(
        "Account Added Successfully"
      );
        console.log('Test running good');
        console.log(serviceResponse.body);
    
    }, 120 * 1000);
})