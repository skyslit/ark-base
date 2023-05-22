import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-apps", (props) => {
  const { useModel } = props.use(Data);
  const AppModel = useModel("app");
  props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
  props.defineLogic(async (props) => {
    return props.table(AppModel.find({}).sort({createdAt: -1}))
  });
});