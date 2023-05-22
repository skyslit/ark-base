import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("group-details", (props) => {
  const { useModel } = props.use(Data);
  const GroupDetails = useModel("group");
  props.defineLogic(async (props) => {
    let group: any = null;
    const { groupId } = props.args.input;

    await new Promise(async (operationComplete, error) => {
      group = await GroupDetails.findOne({_id: groupId }).exec();
      operationComplete();
    });
    return props.success({ message: "Details listed" }, [group]);
  });
});

