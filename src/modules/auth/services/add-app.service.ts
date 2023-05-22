import { defineService, Data } from '@skyslit/ark-backend';

export default defineService("add-app", (props) => {
  const { useModel } = props.use(Data);
  const AddApp = useModel("app");
  const GroupModel = useModel("group");
  const MemberModel = useModel("member-assignment");

  props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });

  props.defineLogic(async (props) => {
    let addApp: any = null;
    let checkGroup: any = null;
    let member: any = null;

    const randomString = (length, chars) => {
      let mask = "";
      if (chars.indexOf("A") > -1) mask += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (chars.indexOf("a") > -1) mask += "abcdefghijklmnopqrstuvwxyz";
      if (chars.indexOf("0") > -1) mask += "0123456789";
      if (chars.indexOf("#") > -1) mask += "/?+-";
      let result = "";
      for (let i = length; i > 0; --i)
        result += mask[Math.floor(Math.random() * mask.length)];
      return result;
    };

    const { callbackUrls, name, userId } = props.args.input;

    await new Promise(async (operationComplete, error) => {
      checkGroup = await GroupModel.findOne({ groupTitle: "SUPER_ADMIN" }).exec();

      if (checkGroup) {
        member = await MemberModel.find({ groupId: checkGroup._id, userId: userId }).exec();

        if (member.length !== 0) {
          addApp = new AddApp({
            callbackUrls: callbackUrls,
            name: name,
            accessKeyId: randomString(16, "A0"),
            accessSecret: randomString(30, "aA#0"),
          });
          await addApp.save();
        }
        else {
          error({ message: "Only super admins can add application!" });
        }
      }
      operationComplete();
    });
    return props.success({ message: "App Added" }, addApp);
  });
});
