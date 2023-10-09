import { IEmailProvider } from "@skyslit/ark-backend";
import { useEnv } from "@skyslit/ark-core";
import axios from 'axios';
import { loadEmailTemplate } from "../helpers/loadEmailTemplate";
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';

export function createWSEmailProvider(): IEmailProvider {
    const COMPASS_SRV_URL = "https://compass-services.skyslit.com";

    const TENANT_ID = useEnv("WS_CRED_SERVICE_TENANT_ID");
    const CLIENT_ID = useEnv("WS_CRED_SERVICE_CLIENT_ID");
    const CLIENT_SECRET = useEnv("WS_CRED_SERVICE_CLIENT_SECRET");
    const PACK_ID = useEnv("WS_COM_PACK_ID");

    return {
        async render(template, data) {
            return ejs.render(template, data);
        },
        async sendEmail(envelop) {
            const IS_DEV_MODE = !(Boolean(CLIENT_ID) && Boolean(CLIENT_SECRET) && Boolean(PACK_ID));

            if (IS_DEV_MODE === true) {
                const testEmailDevPath = path.join(__dirname, "../../.test-emails");

                fs.mkdirSync(testEmailDevPath, { recursive: true });
                fs.writeFileSync(path.join(testEmailDevPath, `${String((new Date()).valueOf())}.json`), JSON.stringify(envelop, undefined, ' '), 'utf-8');

                return {
                    envelop,
                    vendorAck: {
                        resolvedAsDevMode: true
                    }
                }
            }

            const res = await axios({
                method: "POST",
                baseURL: COMPASS_SRV_URL,
                url: `/communication/api/v1/pack/${PACK_ID}/send-email`,
                data: {
                    from: {
                        name: useEnv("BUSINESS_NAME") || "Skyslit App",
                        emailAddress: "no-reply-app-services@skyslit.com"
                    },
                    to: envelop.toAddresses.map((to) => ({
                        name: to.name,
                        emailAddress: to.email,
                        type: "to"
                    })),
                    subject: envelop.subject,
                    html: envelop.htmlContent,
                    text: envelop.textContent
                },
                headers: {
                    tenantId: TENANT_ID,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET
                },
            });

            return {
                envelop,
                vendorAck: res.data
            }
        },
    }
}
