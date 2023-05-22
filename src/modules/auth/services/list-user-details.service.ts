import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("list-user-details", (props) => {
  const { useModel } = props.use(Data);
  const MemberModel = useModel("member-assignment");

  props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });
    
  props.defineLogic(async (props) => {
    let member: any = null;
    const { userId } = props.args.input;

    await new Promise(async (operationComplete, error) => {
      member = await MemberModel.find({ userId: userId }).exec();
      operationComplete();
    });
    return props.success({ message: "Details listed" }, [member]);
  });
});

