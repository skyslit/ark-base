 import { defineService, Data } from '@skyslit/ark-backend';
import bcrypt from "bcryptjs";
const SALT_WORK_FACTOR = 10;

export default defineService('registration-service', (props) => {
    const { useModel } = props.use(Data);
    const AccountModel = useModel("account");
    props.defineLogic(async (props) => {
        let users: any = null;
        let hashedOTP: any = null;

        await new Promise(async (operationComplete, error) => {
            const { email } = props.args.input;
            users = await AccountModel.find({ email }).exec();
            const randomString = (length, chars) => {
                let mask = "";
                if (chars.indexOf("#") > -1) mask += "01234567";
                let result = "";
                for (let i = length; i > 0; --i)
                    result += mask[Math.floor(Math.random() * mask.length)];
                return result;
            };
            if (users.length === 0) {
                {/* const otp = randomString(6, "#")  */ }
                const otp = "123456"
                bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
                    bcrypt.hash(otp, salt, function (err, hash) {
                        // send otp
                        hashedOTP = hash;
                        operationComplete(true)
                    });
                });
            } else {
                error({ message: "Email already in use" });
            }
        });

        return props.success({
            message: "OTP sent successfully",
        },
            hashedOTP);
    });
});