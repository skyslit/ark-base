import { useEnv } from '@skyslit/ark-core';
import { defineService, Data } from "@skyslit/ark-backend";
import moment from 'moment';
import axios from 'axios';
import { ObjectId } from 'mongodb';

export async function addSuperAdmin(UserModel, GroupModel, MemberModel, emailAddress, password) {
  let user: any = await UserModel.findOne({ email: emailAddress });
  if (!user) {
    user = new UserModel({
      _id: new ObjectId("65201ccac5b07671040d14c4"),
      name: 'Super Admin',
      email: emailAddress,
      password: password,
      haveDashboardAccess: true
    });

    await user.save();
  }

  let group: any = await GroupModel.findOne({ groupTitle: "SUPER_ADMIN" });
  if (!group) {
    group = new GroupModel({
      groupTitle: "SUPER_ADMIN",
      count: 1
    });

    await group.save();
  }

  if (!Array.isArray(user.groupId)) {
    user.groupId = [];
  }

  if (user.groupId.indexOf(String(group._id)) < 0) {
    user.groupId.push(String(group._id));
    await user.save();
  }

  await MemberModel.updateOne({
    userId: user._id,
    groupId: group._id
  }, {
    $set: {
      userId: user._id,
      groupId: group._id
    }
  }, { upsert: true });

  return {
    user,
    group
  }
}

const COMPASS_SRV_URL = "https://compass-services.skyslit.com";

export const SUPER_ADMIN_EMAIL = 'super.admin@autologin.com';

export const adminLauncherService = defineService("admin-launcher-service", (props) => {
    const { useModel } = props.use(Data);
    const AccountModel = useModel("account");
    const GroupModel = useModel("group");
    const MemberModel = useModel("member-assignment");
    
    const TENANT_ID = useEnv("WS_CRED_SERVICE_TENANT_ID");
    const CLIENT_ID = useEnv("WS_CRED_SERVICE_CLIENT_ID");
    const CLIENT_SECRET = useEnv("WS_CRED_SERVICE_CLIENT_SECRET");
    const APP_ID = useEnv("COMPASS_APP_ID");

    const IS_WS_SRV_AVAILABLE = Boolean(TENANT_ID) && Boolean(CLIENT_ID) && Boolean(CLIENT_SECRET);

    props.defineLogic(async (props) => {
        const { token } = props.args.input;

        let tokenVerificationSuccess = false;

        try {
          if (IS_WS_SRV_AVAILABLE === true) {
            const res = await axios({
                method: "POST",
                baseURL: COMPASS_SRV_URL,
                url: "/api/v1/verify-auth-token",
                data: {
                    tenantId: TENANT_ID,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    token,
                    appId: APP_ID,
                },
            });

            console.log('res.data.message', res.data.message);
            if (res.data.message === 'Login succeeded') {
                tokenVerificationSuccess = true
            }
          }
        } catch (e) {
            console.error(e?.response?.data ? e?.response?.data : e.message);
        }

        if (tokenVerificationSuccess === true) {
            const now = moment.utc();
            const result = await addSuperAdmin(AccountModel, GroupModel, MemberModel, SUPER_ADMIN_EMAIL, now.valueOf())
            
            props.login(
                props.security.jwt.sign({
                    _id: result.user._id,
                    name: result.user.name,
                    password: undefined,
                })
            );

            props.args.res.redirect('/admin');
        }

        return props.error({ message: 'Unauthorized' }, 401);
    });
});

export const addAdminAccountService = defineService("add-admin-account", (props) => {
  const { useModel } = props.use(Data);
  const AccountModel = useModel("account");
  const GroupModel = useModel("group");
  const MemberModel = useModel("member-assignment");
  props.defineLogic(async (props) => {
    let newAdminAccount: any = null;
    let newGroup: any = null;
    let newMember: any = null;

    const { email, password } = props.args.input;
    await new Promise(async (operationComplete, error) => {
      const existingAccount = await AccountModel.findOne({
        email,
      }).exec();
      if (!existingAccount) {
        const result = await addSuperAdmin(AccountModel, GroupModel, MemberModel, email, password);

        newMember = result.user;
        newGroup = result.group;

        operationComplete(true);
      } else {
        error({ message: "Email already in use" });
      }
    });

    delete newAdminAccount?.password;

    return props.success({ message: "Account Added Successfully" }, [
      newAdminAccount, newGroup
    ]);
  });
});
