import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-all-users", (props) => {
  const { useModel } = props.use(Data);
  const UserModel = useModel("account");

  props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    
  props.defineLogic(async (props) => {
    return props.table(UserModel.find({}))
  });
});