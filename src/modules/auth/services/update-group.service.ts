import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("update-group-service", (props) => {
  const { useModel } = props.use(Data);
  const GroupModel = useModel("group");

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    
  props.defineLogic(async (props) => {
    let group: any = null;
    await new Promise(async (operationComplete, error) => {
      const { groupId, groupTitle,description } = props.args.input;
      group = await GroupModel.findOne({_id:groupId}).exec();
      if (group) {
        group.groupTitle = groupTitle ? groupTitle : group.groupTitle;
        group.description = description ? description : group.description;

        await group.save();
        operationComplete(true)
      } else {
        error({ message: "Group with this id not found" });
      }
    });
    return props.success(
      {
        message: "Updated successfully",
      },[group],
    );
  });
});