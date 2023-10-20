import { createModule, useEnv } from "@skyslit/ark-core";
import { Data, Backend, defineService, Communication } from "@skyslit/ark-backend";

import AccountSchema from "../auth/schema/account.schema";
import GroupSchema from "../auth/schema/group.schema";
import MemberAssignmentSchema from "../auth/schema/member-assignment.schema";
import AppSchema from "../auth/schema/app.schema";
import BlackListedTokenSchema from "../auth/schema/blacklisted-token.schema";

import AdminValidation from "../auth/services/admin-validation.service";
import UserLogin from "../auth/services/user-login.service";
import {
  addAdminAccountService,
  adminLauncherService,
} from "../auth/services/add-admin-account.service";
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
import CrossCheckEmailService from "../auth/services/cross-check-email.service";
import AvailabilityCheckOfTenantId from "../auth/services/availability-check-of-tenantId.service";
import ListAllTenants from "../auth/services/list-all-tenants-table.service";
import ListUsersOfTenant from "../auth/services/list-users-of-tenant-table.service";
import AddUserOfTenant from "../auth/services/add-user-of-tenant.service";
import RemoveUserOfTenant from "../auth/services/remove-user-of-tenant.service";
import GetAllAccountsWithTenantId from "../auth/services/get-all-accounts-with-tenantId.service";
import AddNewTenant from "../auth/services/add-new-tenant.service";
import CreateNewUser from "../auth/services/create-new-user.service";
import ListTenants from "../auth/services/list-tenants.service";
//login v2
import CheckForExistingEmail from "../auth/services/check-email.service";
import LoginV2Service from "../auth/services/login-v2.service";
import SignupV2Service from "../auth/services/user-signup.service";
import UpdateDashboardAccess from "../auth/services/update-dashboard-access.service";
//Demo services
import GetAllDemoData from "../auth/services/demo-services/get-all-demo-data.service";
import { deployDemoArchiveService, skipDemoArchiveService } from "../auth/services/demo-services/demo-deploy.service";


import createS3Volume from "./toolkit/providers/s3-volume";
import createWebspaceVolume from "./toolkit/providers/webspace-blob";
import { createWSEmailProvider } from "./toolkit/providers/ws-email";
import { loadEmailTemplate } from "./toolkit/helpers/loadEmailTemplate";

import { EnquiryMetaSyncAutomator } from "./custom-types/enquiry/automation/metasync-automation";


export default createModule(({ use, run }) => {
  const { useModel, useVolume, useFolderOperations } = use(Data);
  const { enableDynamicsV2Services, useService } = use(Backend);
  const { enableCommunication, useProvider } = use(Communication);

  enableCommunication();
  useProvider(createWSEmailProvider());

  useModel("account", AccountSchema);
  useModel("group", GroupSchema);
  useModel("member-assignment", MemberAssignmentSchema);
  useModel("app", AppSchema);
  useModel("blacklisted_token", BlackListedTokenSchema);

  useService(AdminValidation);
  useService(UserLogin);
  useService(addAdminAccountService);
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
  useService(CrossCheckEmailService);
  useService(AvailabilityCheckOfTenantId);
  useService(ListAllTenants);
  useService(ListUsersOfTenant);
  useService(AddUserOfTenant);
  useService(RemoveUserOfTenant);
  useService(GetAllAccountsWithTenantId);
  useService(AddNewTenant);
  useService(CreateNewUser);
  useService(ListTenants);
  useService(CheckForExistingEmail);
  useService(LoginV2Service);
  useService(SignupV2Service);
  useService(UpdateDashboardAccess);
  useService(deployDemoArchiveService);
  useService(skipDemoArchiveService);
  useService(GetAllDemoData);


  useService(adminLauncherService, {
    method: "get",
    path: "/api/admin-launcher",
  });

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
    const { ensurePaths, defineAutomation } = useFolderOperations();

    defineAutomation('default', 'enquiry', EnquiryMetaSyncAutomator)
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
        name: "uploads",
        type: "folder",
        meta: {},
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
      {
        parentPath: "/",
        name: "Enquiries",
        type: "folder",
        meta: {},
        security: {
          // @ts-ignore
          permissions: [
            {
              type: "public",
              policy: "",
              userEmail: "",
              access: "write",
            },
          ],
        },
      },
      {
        parentPath: "/",
        name: "Tenants",
        type: "folder",
        meta: {},
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
      {
        parentPath: "/",
        name: "dashboards",
        type: "folder",
        meta: {},
        security: {
          // @ts-ignore
          permissions: [
            // {
            //   type: "user",
            //   policy: "",
            //   userEmail: "",
            //   access: "read",
            // },
          ],
        },
      },
      {
        parentPath: "/dashboards",
        name: "default",
        type: "dashboard",
        meta: {},
        security: {
          // @ts-ignore
          permissions: [
            // {
            //   type: "user",
            //   policy: "",
            //   userEmail: "",
            //   access: "read",
            // },
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
