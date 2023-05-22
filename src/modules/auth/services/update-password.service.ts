import { defineService, Data } from '@skyslit/ark-backend';
import bcrypt from "bcryptjs";

export default defineService('update-password', (props) => {
    const { useModel } = props.use(Data);
    const userData = useModel("account");
    props.defineLogic(async (props) => {
        let data: any = null;
        await new Promise(async (operationComplete, error) => {
            const { email, otp, hash, password } = props.args.input;
            data = await userData.findOne({ email: email }).exec();
            if (data) {
                bcrypt
                    .compare(otp, hash)
                    .then(async (res) => {
                        if (res === true) {
                            data.password = password;
                            await data.save();
                            operationComplete(true)
                        } else {
                            error({ message: "password reset failed" });
                        }
                    })
                    .catch((e) => { });
            }
        });
        return props.success({
            message: "password reset successfull",
        },
            [data]);
    });
});
