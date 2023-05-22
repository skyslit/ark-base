import { defineService,Data } from '@skyslit/ark-backend';

export default defineService('register-user-service', (props) => {
const { useModel } = props.use(Data);
     const UserModel = useModel("account");

    props.defineLogic(async (props) => {
        let newUser: any = null;
        const {email, password, name } = props.args.input;
         await new Promise(async (operationComplete, error) => {
          const existingAccount = await UserModel.findOne({
        email,
      }).exec();

      if (!existingAccount) {
        newUser = new UserModel({
          name, name,
          email:email,
          password: password,
        });
        await newUser.save();
        operationComplete(true);
      } else {
        error({ message: "Something went wrong" });
      }
    });
        return props.success({ message: 'User registered successfully' },[newUser]);
    });
});