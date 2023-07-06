import { createModule, useEnv } from "@skyslit/ark-core";
import { Data, FileVolume } from "@skyslit/ark-backend";
import { Backend } from "@skyslit/ark-backend";

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
import AddNewGroup from "../auth/services/add-new-group.service";
import ListUser from "../auth/services/list-user.service";
import AssignGroup from "../auth/services/assign-group.service";
import AddNewUser from "../auth/services/add-new-user.service";
import ListAllGroups from "../auth/services/list-all-groups.service";
import ListAllUsers from "../auth/services/list-all-users.service";
import UpdateName from "../auth/services/update-name.service";
import GetUserById from "../auth/services/get-user-by-id.service";
import ChangePassword from "../auth/services/change-password.service";
import VerifyEmail from "../auth/services/verify-email.service";
import EmailOtpVerification from "../auth/services/email-otp-verification.service";
import ListGroupService from "../auth/services/list-group.service";
import GetGroupById from "../auth/services/get-group-by-id.service";
import DeleteUser from "../auth/services/delete-user.service";
import AssignGroupToMember from "../auth/services/assign-group-to-user.service";
import ChangeUserPassword from "../auth/services/change-user-password.service";
import DeleteGroup from "../auth/services/delete-group.service";
import ListGroupDetailsService from "../auth/services/list-group-details.service";
import RemoveMember from "../auth/services/remove-member.service";
import GroupDetails from "../auth/services/group-details.service";
import UpdateGroup from "../auth/services/update-group.service";
import createS3Volume from "./toolkit/providers/s3-volume";
import createWebspaceVolume from "./toolkit/providers/webspace-blob";
import path from "path";

export default createModule(({ use, run }) => {
  const { useModel, useVolume, useFolderOperations } = use(Data);
  const { enableDynamicsV2Services, useService } = use(Backend);
  console.log("api.module.ts loaded");

  useModel("account", AccountSchema);
  useModel("group", GroupSchema);
  useModel("member-assignment", MemberAssignmentSchema);
  useModel("app", AppSchema);
  useModel("blacklisted_token", BlackListedTokenSchema);

  useService(AdminValidation);
  useService(UserLogin);
  useService(AddAdminModel);
  useService(RegistrationService);
  useService(RegisterUserService);
  useService(UserLogout);
  useService(SendCode);
  useService(OtpVerification);
  useService(UpdatePassword);
  useService(AddNewGroup);
  useService(ListUser);
  useService(AssignGroup);
  useService(AddNewUser);
  useService(ListAllGroups);
  useService(ListAllUsers);
  useService(UpdateName);
  useService(GetUserById);
  useService(ChangePassword);
  useService(VerifyEmail);
  useService(EmailOtpVerification);
  useService(ListGroupService);
  useService(GetGroupById);
  useService(DeleteUser);
  useService(AssignGroupToMember);
  useService(ChangeUserPassword);
  useService(DeleteGroup);
  useService(ListGroupDetailsService);
  useService(RemoveMember);
  useService(GroupDetails);
  useService(UpdateGroup);

  if (useEnv("AWS_ACCESS_KEY_ID")) {
    useVolume(
      "",
      createS3Volume({
        ACL: "private",
        Bucket: useEnv("ASSET_UPLOADS"),
      })
    );
  } else if (useEnv("WS_BLOB_BUCKET_ID")) {
    useVolume(
      "",
      createWebspaceVolume({
        bucketId: useEnv("WS_BLOB_BUCKET_ID"),
        tenantId: useEnv("WS_CRED_SERVICE_TENANT_ID"),
        clientId: useEnv("WS_CRED_SERVICE_CLIENT_ID"),
        clientSecret: useEnv("WS_CRED_SERVICE_CLIENT_SECRET"),
      })
    );
  }

  enableDynamicsV2Services();

  run(async () => {
    const { ensurePaths } = useFolderOperations();
    await ensurePaths("default", [
      {
        parentPath: "/",
        name: "quick links",
        type: "folder",
        meta: {},
        security: {
          // @ts-ignore
          permissions: [
            {
              type: "user",
              policy: "",
              userEmail: "",
              access: "read",
            },
          ],
        },
      },
      {
        parentPath: "/",
        name: "dashboards",
        type: "folder",
        meta: {},
        security: {
          // @ts-ignore
          permissions: [
            {
              type: "user",
              policy: "",
              userEmail: "",
              access: "read",
            },
          ],
        },
      },
      {
        parentPath: "/",
        name: "info",
        type: "property",
        meta: { fileCollectionName: "property" },
        security: {
          // @ts-ignore
          permissions: [
            {
              type: "public",
              policy: "",
              userEmail: "",
              access: "read",
            },
          ],
        },
      },
    ]);
  });
});
