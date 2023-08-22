import { defineService, Data } from "@skyslit/ark-backend";
import { UserDocument } from "../types/user-type.ts";

export default defineService("user-login-service", (props) => {
  const { useModel, useFolderOperations } = props.use(Data);
  const UserModel = useModel<UserDocument>("account");
  props.defineLogic(async (props) => {
    let data: UserDocument = {};
    let redirectUri: any = null;

    await new Promise(async (operationComplete, error) => {
      const { email, password, search } = props.args.input;

      const searchParam = new URLSearchParams(search);
      let external_auth = false;
      if (
        searchParam.has("external_auth") &&
        searchParam.get("external_auth") === "true"
      ) {
        external_auth = true;
      }

      data = await UserModel.findOne({ email }).exec();
      try {
        if (data) {
          data.verifyPassword(password, (err: any, isMatch: any) => {
            if (err) {
              error({ message: "User does not exist" });
            } else {
              if (isMatch === true) {
                props.login(
                  props.security.jwt.sign({
                    groupId: data.groupId,
                    _id: data._id,
                    name: data.name,
                    password: undefined,
                  })
                );

                const folderApi = useFolderOperations();
                folderApi
                  .addItem(
                    "default",
                    "/users",
                    email,
                    "folder",
                    {},
                    {
                      permissions: [
                        {
                          type: "user",
                          policy: "",
                          userEmail: email,
                          access: "owner",
                        },
                      ],
                    },
                    false,
                    undefined,
                    "supress",
                    true
                  )
                  .then((userRoot) => {
                    return folderApi.addItem(
                      "default",
                      userRoot.path,
                      'dashboards',
                      "folder",
                      {},
                      {
                        permissions: [],
                      },
                      false,
                      undefined,
                      "supress",
                      true
                    ).then(() => userRoot)
                  })
                  .then((userRoot) => folderApi.addItem(
                    "default",
                    userRoot.path,
                    'quick links',
                    "folder",
                    {},
                    {
                      permissions: [],
                    },
                    false,
                    undefined,
                    "supress",
                    true
                  ))
                  .then(async (userRoot) => {
                    if (data.tenantId) {
                      const { currentDir, items } = await folderApi.fetchContent('default', userRoot.path, false);
                      const containsTenantId = items.some(item => item.name === data.tenantId);
                      if (!containsTenantId) {
                        return folderApi.createShortcut('default', `/${data.tenantId.toLowerCase()}`, userRoot.path, data.tenantId);
                      }
                    }
                  })
                  .then(() => {
                    if (external_auth === true) {
                      redirectUri = (
                        `/___external/auth/server/login/handlers/callback` +
                        search
                      ).replace("??", "?");
                    }

                    operationComplete(true);
                  })
                  .catch(error);
              } else {
                error({ message: "Email/Password does not match" });
              }
            }
          });
        } else {
          error({ message: "Email/Password does not match" });
        }
      } catch (error) { }
    });
    return props.success({ message: "Login Success", redirectUri }, []);
  });
});
