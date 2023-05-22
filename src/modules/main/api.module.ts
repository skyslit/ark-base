import { createModule } from "@skyslit/ark-core";
import { Data } from "@skyslit/ark-backend";
import { Backend, Security } from "@skyslit/ark-backend";

import AccountSchema from "../auth/schema/account.schema";
import GroupSchema from "../auth/schema/group.schema";
import MemberAssignmentSchema from "../auth/schema/member-assignment.schema";
import AppSchema from "../auth/schema/app.schema";
import BlackListedTokenSchema from "../auth/schema/blacklisted-token.schema";

import AdminValidation from "../auth/services/admin-validation.service";
import UserLogin from "../auth/services/user-login.service";
import AddAdminModel from "../auth/services/add-admin-account.service";
import RegistrationService from "../auth/services/registration.service";
import RegisterUserService from "../auth/services/register-user.service";
import UserLogout from "../auth/services/logout-user.service";
import SendCode from "../auth/services/send-code.service";
import OtpVerification from "../auth/services/otp-verification.service";
import UpdatePassword from "../auth/services/update-password.service";


export default createModule(({ use }) => {
  const { useModel } = use(Data);
  const { enableDynamicsV2Services, useService } = use(Backend);
  console.log("api.module.ts loaded");

  useModel("account", AccountSchema);
  useModel('group', GroupSchema);
  useModel('member-assignment', MemberAssignmentSchema);
  useModel('app', AppSchema);
  useModel('blacklisted_token', BlackListedTokenSchema);

  useService(AdminValidation);
  useService(UserLogin);
  useService(AddAdminModel);
  useService(RegistrationService);
  useService(RegisterUserService);
  useService(UserLogout);
  useService(SendCode);
  useService(OtpVerification);
  useService(UpdatePassword);


  enableDynamicsV2Services();
});
