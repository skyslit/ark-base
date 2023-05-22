
import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-group-details", (props) => {
    const { useModel } = props.use(Data);
    const MemberModel = useModel("member-assignment");
    props.defineLogic(async (props) => {
        const {groupId } = props.args.input;
        return props.table(MemberModel.find({groupId:groupId}));
    });
});

