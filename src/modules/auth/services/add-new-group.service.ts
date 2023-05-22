import { defineService,Data } from '@skyslit/ark-backend';

export default defineService('add-new-group', (props) => {
const { useModel } = props.use(Data);
  const GroupModel = useModel("group");

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    
    props.defineLogic(async (props) => {
        let newGroup: any = null;
        const { groupTitle, description } = props.args.input;
         await new Promise(async (operationComplete, error) => {
      const existingGroup = await GroupModel.findOne({
        groupTitle,
      }).exec();
      if (!existingGroup) {
        newGroup = new GroupModel({
          groupTitle: groupTitle.toUpperCase(),
          description: description,
          count:0
        });
        await newGroup.save();
        operationComplete(true);
      } else {
        error({ message: "Title already in use" });
      }
    });
        return props.success({ message: 'Group added' },[newGroup]);
    });
});