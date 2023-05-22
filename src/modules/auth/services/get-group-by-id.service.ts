import { defineService, Data } from "@skyslit/ark-backend";

// Replace 'hello-service' with a unique service id (unique within the module)
export default defineService("get-group-by-id", (props) => {
  const { useModel } = props.use(Data);
  const GroupModel = useModel("group");
  props.defineLogic(async (props) => {
    let group: any = null;
    await new Promise(async (operationComplete, error) => {
      const { groupId } = props.args.input;
      group = await GroupModel.find({ _id: groupId }).exec();
      operationComplete();
    });
    return props.success({ message: "groups listed" }, [group]);
  });
});