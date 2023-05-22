import { defineService, Data } from "@skyslit/ark-backend";

export default defineService("update-app", (props) => {
    const { useModel } = props.use(Data);
    const AppModel = useModel("app");
    const GroupModel = useModel("group");
    const MemberModel = useModel("member-assignment");

    props.defineRule((props) => {
        props.allowPolicy('SUPER_ADMIN')
    });

    props.defineLogic(async (props) => {
        let hasAppUpdated: boolean = false;
        let app: any = null;
        let checkGroup: any = null;
        let member: any = null;

        const { appId, name, callbackUrls, userId } = props.args.input;

        await new Promise(async (operationComplete, error) => {
            checkGroup = await GroupModel.findOne({ groupTitle: "SUPER_ADMIN" }).exec();

            if (checkGroup) {
                member = await MemberModel.find({ groupId: checkGroup._id, userId: userId }).exec();
                if (member.length !== 0) {
                    app = await AppModel.findOne({ _id: appId }).exec();
                    if (app) {
                        app.name = name;
                        app.callbackUrls = callbackUrls;
                    }
                    await app.save();
                    hasAppUpdated = true;
                }
                else {
                    error({ message: "Users are not allowed to update app!" });
                }
                operationComplete();
            }
            else {
                error({ message: "App with this id not found" });
            }

        });
        return props.success(
            {
                message: "App updated successfully",
                appUpdated: hasAppUpdated,
            },
            [app]
        );
    });
});
