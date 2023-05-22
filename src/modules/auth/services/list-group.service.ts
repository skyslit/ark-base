import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-group-service", (props) => {
    const { useModel } = props.use(Data);
    const GroupModel = useModel("group");

    

    props.defineLogic(async (props) => {
        let group: any = null;
        await new Promise(async (operationComplete, error) => {
            group = await GroupModel.find({}).exec();
            operationComplete();
        });
        return props.success({ message: "Group Listed" }, group);
    });
});