import { defineService,Data } from '@skyslit/ark-backend';
import bcrypt from "bcryptjs";

export default defineService('email-otp-verification', (props) => {
    const { useModel } = props.use(Data);
     const AccountModel = useModel("account");
    props.defineLogic(async (props) => {
       let user: any = null;
        await new Promise(async (operationComplete, error) => {
            const { otp, hash, userId, email } = props.args.input;
            user = await AccountModel.findOne({ _id: userId}).exec();
            bcrypt
                .compare(otp, hash)
                .then(async(res) => {
                    if (res === true) {
                        if (user) {
                        user.email = email ? email : user.email;
                        await user.save();
                        operationComplete(true);
                    } else {
                        error({ message: "User with this id not found" });
                    }
                    } else {
                        error({ message: "OTP is incorrect" });
                    }
                })
                .catch((e) => { });
        });
        return props.success({ message: "OTP Verified success" },[user]);
    });
});