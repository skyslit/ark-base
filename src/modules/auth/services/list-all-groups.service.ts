import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-all-groups", (props) => {
  const { useModel } = props.use(Data);
  const GroupModel = useModel("group");

 
    
  props.defineLogic(async (props) => {
    return props.table(GroupModel.find({}))
  });
});