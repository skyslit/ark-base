import { defineService } from '@skyslit/ark-backend';
import bcrypt from "bcryptjs";

export default defineService('otp-verification', (props) => {
    props.defineLogic(async (props) => {
        await new Promise(async (operationComplete, error) => {
            const { otp, hash } = props.args.input;
            bcrypt
                .compare(otp, hash)
                .then((res) => {
                    if (res === true) {
                        operationComplete(true)
                    } else {
                        error({ message: "OTP is incorrect" });
                    }
                })
                .catch((e) => { });
        });
        return props.success({ message: "OTP Verified success" });
    });
});