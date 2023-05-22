import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("assign-group", (props) => {
    const { useModel } = props.use(Data);
    const GroupModel = useModel("group");


    props.defineLogic(async (props) => {
        let group: any = null;
        await new Promise(async (operationComplete, error) => {
            group = await GroupModel.find({}).exec();
            operationComplete();
        });
        return props.success(
            { message: "Groups listed" },
            group
        );
    });
});