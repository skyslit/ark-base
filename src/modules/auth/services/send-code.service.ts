import { defineService, Data } from '@skyslit/ark-backend';
import bcrypt from "bcryptjs";
const SALT_WORK_FACTOR = 10;

export default defineService('send-code', (props) => {
    const { useModel } = props.use(Data);
    const AccountModel = useModel("account");
    props.defineLogic(async (props) => {
        let user: any = null;
        let hashedOTP: any = null;

        await new Promise(async (operationComplete, error) => {
            const { email } = props.args.input;
            user = await AccountModel.findOne({ email }).exec();
            const randomString = (length, chars) => {
                let mask = "";
                if (chars.indexOf("#") > -1) mask += "01234567";
                let result = "";
                for (let i = length; i > 0; --i)
                    result += mask[Math.floor(Math.random() * mask.length)];
                return result;
            };
            if (user) {
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
                error({ message: "Email ID not found" });
            }
        });

        return props.success({
            message: "OTP sent successfully",
        },
            hashedOTP);
    });
});