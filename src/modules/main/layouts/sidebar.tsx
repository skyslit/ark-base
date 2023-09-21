import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import {
  Catalogue,
  useCataloguePath,
} from "@skyslit/ark-frontend/build/dynamics-v2";
import { Layout, Divider, Button, message, Modal, Drawer, Dropdown, Input, Form, Radio, Typography, Popover, Menu, Popconfirm } from "antd";
import { CloseOutlined, DeleteOutlined, DownOutlined, EditOutlined, EnterOutlined, LogoutOutlined, PlusOutlined, QuestionCircleOutlined, UsergroupAddOutlined, UserOutlined } from "@ant-design/icons";
import "../layouts/sidebar.scss";
import { Link, useLocation, useHistory } from "react-router-dom";
import {
  SiderFolderIcon,
  SiderAnalyticsChartIcon,
  SiderLeftChevronIcon,
  SiderSettingsIcon,
  SiderShortcutFolderIcon,
  HamburgerMenuIcon,
  SiderUsersIcon,
  AddBtnIcon,
  CheckCircleIcon,
  CloseRoundedIcon
} from "../../auth/icons/global-icons";
import { Content } from "antd/lib/layout/layout";
import NoSSR from "../../auth/reusables/NoSSR";
const { Header, Sider } = Layout;

let orgDetails: string = null;

const SiderLayout = createComponent((props) => {
  const { useService, useContext, useFolder } = props.use(Frontend);

  const location = useLocation();
  const context = useContext();
  const history = useHistory()
  const { usePath, readFile, createItem, deleteMany, rename } = useFolder();

  const [organisationDetails, setOrganisationDetails] = React.useState(orgDetails);
  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = React.useState(false);
  const [tenantId, setTenantId] = React.useState("");
  const [modalCurrentState, setModalCurrentState] = React.useState("new-tenant")
  const [isNewUser, setisNewUser] = React.useState(true)
  const [email, setEmail] = React.useState("")
  const [isUserAvailable, setIsUserAvailable] = React.useState(true)
  const [allTenants, setAllTenants] = React.useState([])
  const [isEmailAlreadyExists, setIsEmailAlreadyExists] = React.useState(false)
  const [isAddDashboardModalOpen, setIsAddDashboardModalOpen] = React.useState(false)
  const [newDashboardName, setNewDashboardName] = React.useState('')
  const [renameDashboard, setRenameDashboard] = React.useState('')
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  const showAddUserModal = () => {
    setIsUserModalOpen(true);
  };

  const userCancel = () => {
    setIsUserModalOpen(false);
  };

  const handleTenantModal = () => {
    setIsTenantModalOpen(!isTenantModalOpen)
    setModalCurrentState("new-tenant")
    setTenantId("")
    if(modalCurrentState === "confirm-add-user"){
      localStorage.setItem('selectedTenant', tenantId);
      window.location.href = `/app/viewport/tenants/${tenantId.toLowerCase()}/global/dashboards/default`
    }
  }

  const handleAddDashboardModal = () => {
    setIsAddDashboardModalOpen(!isAddDashboardModalOpen)
  }

  const [tenantForm] = Form.useForm();

  const selectedTenant = React.useMemo(() => {
    if (localStorage.getItem('selectedTenant')) {
      return localStorage.getItem('selectedTenant')?.toUpperCase();
    } else {
      return null
    }
  }, [])

  const emailAddress = context?.response?.meta?.currentUser?.emailAddress;
  const emailSlug = React.useMemo(() => {
    return encodeURIComponent(
      String(emailAddress)
        .replace(/\W+(?!$)/g, "-")
        .toLowerCase()
        .replace(/\W$/, "")
    );
  }, [emailAddress]);

  const userDashboardItems = usePath(
    "user-dashboard-items-ref",
    `/users/${emailSlug}/dashboards`,
    {
      useRedux: true,
    }
  );

  const dashBoardPath = React.useMemo(() => {
    if (selectedTenant) {
      return `/tenants/${selectedTenant?.toLowerCase()}/global/dashboards`
    } else {
      return `/dashboards`
    }
  }, [selectedTenant])

  const tenantDashboardItems = usePath(
    "tenant-dashboard-items-ref",
    dashBoardPath,
    {
      useRedux: true,
    }
  );

  const systemDashboardItems = usePath(
    "system-dashboard-items-ref",
    "/dashboards",
    {
      useRedux: true,
    }
  );

  const userQuicklinkItems = usePath(
    "user-quick-link-items-ref",
    `/users/${emailSlug}/quick-links`,
    {
      useRedux: true,
    }
  );

  const systemQuicklinkItems = usePath(
    "system-quick-link-items-ref",
    "/quick-links",
    {
      useRedux: true,
    }
  );

  const isUserSuperAdmin = React.useMemo(() => {
    if (context?.response?.meta?.currentUser) {
      try {
        return (
          context.response.meta.currentUser.policies.indexOf("SUPER_ADMIN") > -1
        );
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  }, [context?.response?.meta?.currentUser]);

  const logoutService = useService({ serviceId: "user-logout" });
  const getAllAccountsWithTenantId = useService({ serviceId: "get-all-accounts-with-tenantId" });
  const addNewTenantService = useService({ serviceId: "add-new-tenant" });
  const availabilityCheckService = useService({ serviceId: "availability-check-of-tenantId" });
  const listAllGroupsService = useService({ serviceId: "assign-group" });
  const listAllTenantsService = useService({ serviceId: "list-tenants" });
  const addNewUserService = useService({ serviceId: "create-user" });

  const logoutUser = () => {
    logoutService
      .invoke()
      .then((res) => { })
      .catch((e) => {
        message.error("Try again!");
      })
      .finally(() => context.invoke(null, { force: true }));
  };
  const getTenants = () => {
    getAllAccountsWithTenantId
      .invoke()
      .then((res) => { })
      .catch((e) => {
      })
  };

  const addNewTenant = () => {
    addNewTenantService.invoke({
      tenantId: tenantId,
    }, { force: true })
      .then((res) => {
        setModalCurrentState("confirm-add-user")
      })
      .catch((e) => {
      })
  }

  const listAllTenants = React.useCallback(() => {
    listAllTenantsService
      .invoke()
      .then((res) => {
        if (res.data) {
          setAllTenants(res.data);
        } else {
          setAllTenants([]);
        }
      })
      .catch((e) => {
      });
  }, []);

  React.useEffect(() => {
    listAllTenants()
  }, [])

  const addNewUserToTenant = (data) => {
    addNewUserService.invoke({
      name: data.name,
      email: isNewUser ? data.email : email,
      password: data.password,
      tenantId: tenantId,
      isNewUser
    }, { force: true })
      .then((res) => {
        localStorage.setItem('selectedTenant', tenantId);
        window.location.href = `/app/viewport/tenants/${tenantId.toLowerCase()}/global/dashboards/default`
      })
      .catch((e) => {
        if (e.message === "Cannot find user with the provided email") {
          setIsUserAvailable(false)
        } else {
          message.error({
            content: 'Email already in use!',
            zIndex: 10002,
          });
          setIsEmailAlreadyExists(true)
        }
      })
  }

  // React.useEffect(() => {
  //   if (tenantId) {
  //     availabilityCheckService.invoke({
  //       tenantId: tenantId
  //     }, { force: true })
  //       .then((res) => {

  //       })
  //       .catch(() => {

  //       })
  //   }
  // }, [tenantId])

  const { response, loaded, refresh, loading } = usePath('list-tenants', `/tenants`, {
    depth: 0,
    autoFetch: true,
    ns: 'default',
    useRedux: false
  });

  // React.useEffect(() => {
  //   if (tenantId) {
  //     refresh()
  //   }
  // }, [tenantId])

  const availablityOfTenant = React.useMemo(() => {
    if (tenantId && loaded) {
      const allTenants = response?.items?.map((item) => item.slug)
      if (allTenants?.includes(tenantId.toLowerCase())) {
        return false
      } else {
        return true
      }
    }
  }, [tenantId, loaded])

  const [collapsed, setCollapsed] = React.useState(
    window.localStorage.getItem("collapsed")
  );
  const [visible, setVisible] = React.useState(false);

  const openSider = () => {
    setCollapsed("open");
    window.localStorage.setItem("collapsed", "open");
  };

  const closeSider = () => {
    setCollapsed("close");
    window.localStorage.setItem("collapsed", "close");
  };

  const toggleHamburgerDrawer = () => {
    setVisible(!visible);
  };

  React.useEffect(() => {
    if (!orgDetails) {
      readFile("/info").then((res) => {
        orgDetails = res?.meta?.content;
        setOrganisationDetails(res?.meta?.content);
      });
    }
  }, []);

  React.useEffect(() => {
    getTenants()
  }, [])

  const [searchInput, setSearchInput] = React.useState('');

  const filterNames = React.useMemo(() => {
    if (searchInput) {
      return (
        allTenants.filter((item) =>
          item.name.toLowerCase().includes(searchInput.toLowerCase())
        )
      )
    } else {
      return allTenants
    }
  }, [searchInput, allTenants])

  const navigateTenant = React.useCallback((tenantId, path) => {
    localStorage.setItem('selectedTenant', tenantId);
    window.location.href = `/app/viewport${path}/global/dashboards/default`
  }, [])

  const exitTenant = React.useCallback(() => {
    localStorage.removeItem('selectedTenant');
    window.location.href = '/app/viewport/dashboards/default'
  }, [])

  React.useEffect(() => {
    if (!isUserSuperAdmin && !selectedTenant && allTenants.length > 0) {
      localStorage.setItem('selectedTenant', allTenants[0]?.slug);
      window.location.href = `/app/viewport/tenants/${allTenants[0]?.slug}/global/dashboards/default`
    }
    if (!isUserSuperAdmin && selectedTenant && location.pathname === "/app/viewport/dashboards/default") {
      window.location.href = `/app/viewport/tenants/${selectedTenant.toLowerCase()}/global/dashboards/default`
    }
  }, [selectedTenant, isUserSuperAdmin, allTenants, window.location])


  const navigateFileManager = React.useMemo(() => {
    if (isUserSuperAdmin) {
      return `/app/files`;
    } else if (selectedTenant)
      return `/app/files/tenants/${selectedTenant.toLowerCase()}`;
  }, [selectedTenant, isUserSuperAdmin]);

  const navigateSettings = React.useMemo(() => {
    if (isUserSuperAdmin) {
      return `/app/files/info`;
    } else if (selectedTenant)
      return `/app/files/tenants/${selectedTenant.toLowerCase()}/info`;
  }, [selectedTenant, isUserSuperAdmin]);

  const addNewDashboard = React.useCallback(() => {
    createItem(dashBoardPath, `${newDashboardName}`, 'dashboard', {}).then(() => {
      handleAddDashboardModal()
      setNewDashboardName('')
      window.location.reload()
    })
  }, [selectedTenant, newDashboardName, dashBoardPath])

  const isUserHaveDashboardAccess = React.useMemo(() => {
    if (context?.response?.meta?.currentUser) {
      try {
        return (
          Boolean(context.response.meta.currentUser.haveDashboardAccess)
        );
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  }, [context?.response?.meta?.currentUser]);

  React.useEffect(() => {
    if (!isUserSuperAdmin && !isUserHaveDashboardAccess) {
      history.push("/")
    }
  }, [isUserSuperAdmin, isUserHaveDashboardAccess])


  const menu = (
    <div>
      {filterNames.length === 0 && !searchInput ? (
        <div style={{ height: 320 }} className="empty-tenant-wrapper">
          <div>Add tenants to view their dashboard</div>
          <div><Button onClick={handleTenantModal}>Add Tenant</Button></div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", padding: "25px 16px", paddingBottom: "unset", width: "100%", alignItems: "center" }}>
            <Input
              placeholder="Search tenants"
              onChange={(e) => { setSearchInput(e.target.value) }}
            />
            {isUserSuperAdmin ? (
              <AddBtnIcon style={{ fontSize: 35, marginLeft: 13, cursor: "pointer" }} onClick={handleTenantModal} />
            ) : null}
          </div>
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            {filterNames.length === 0 && searchInput ? (
              <div style={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 13, color: "#5A5A5A" }}>No tenants found for this keyword</div>
            ) : (
              filterNames.map((item, index) => (
                <div key={index} className="each-name-wrapper" onClick={() => { navigateTenant(item.slug, item.path) }}>{item.name}</div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );

  // const dasboardMenu=(path,name) => (
  //   <Menu>
  //     <Menu.Item key="rename">
  //         <div style={{display:"flex"}}>
  //           <Input
  //             autoFocus
  //             type="text"
  //             style={{marginRight:10}}
  //           />
  //           <Button type="primary" >
  //             Rename
  //           </Button>
  //         </div>
  //     </Menu.Item>
  //     <Menu.Item key="delete">
  //       <Button danger>Delete</Button>
  //     </Menu.Item>
  //   </Menu>
  // );


  const NewTenant = (
    <>
      <div className="add-tenant-header-wrapper">
        <div><h4>Add Tenant</h4></div>
        <div style={{ textAlign: "center" }}><p>Provide this app to other tenants (sellers, educators, etc.) who can list their products/services using your app and sell it to their customers.</p></div>
      </div>
      <div className="main-content-wrapper">
        <div>
          <h4>Enter new username for this tenant:</h4>
          <div className="input-wrapper">
            <span>{window.location.host}/</span>
            <div style={{ display: "flex", flexDirection: "column" }}><Input placeholder="Tenant Username" autoFocus value={tenantId} onChange={(e) => { setTenantId(e.target.value.replace(/[^a-zA-Z0-9]/g, '')) }} />
              {availablityOfTenant && tenantId ? (
                <label style={{ width: 120 }}>
                  <Typography.Text style={{ fontWeight: 800 }}><CheckCircleIcon style={{ marginRight: 6 }} ellipsis={true} />{tenantId}</Typography.Text> is available
                </label>
              ) : (
                tenantId ? (
                  <label style={{ width: 252 }}>
                    <CloseRoundedIcon style={{ marginRight: 6 }} />
                    Username already taken. Try adding a few numbers along with it.
                  </label>
                ) : null
              )}
            </div>
          </div>
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", padding: "0 34px" }}>
          <Button type="text" className="discard-btn" onClick={handleTenantModal}>Discard</Button>
          <Button type="text" className="continue-btn" onClick={addNewTenant} disabled={!tenantId || !availablityOfTenant || addNewTenantService.isLoading}>{
            addNewTenantService.isLoading ? (
              "Adding..."
            ) : (
              "Continue"
            )
          }</Button>
        </div>
      </div>
      {/* <div style={{ padding: 30 }}>
      <label style={{ fontSize: 12 }}>Tenant ID</label>
      <Input
        className="title-input"
        style={{ marginTop: 7 }}
        placeholder="Enter tenant name"
        onChange={(e) => { setTenantId(e.target.value) }}
      />
      {!availablityOfTenant && tenantId ? (
        <div style={{ color: "#960018", marginBottom: 15, transition: "color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)" }}>
          Tenant ID already taken
        </div>
      ) : null}
      <div style={{ display: "flex", marginTop: 30, justifyContent: "end" }}>
        <Button key="cancel" onClick={handleTenantModal} style={{ marginRight: 10 }}>
          Cancel
        </Button>
        <Button key="ok" type="primary" onClick={addNewTenant} disabled={!tenantId || !availablityOfTenant}>
          {addNewTenantService.isLoading ? (
            "Adding..."
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </div> */}
    </>
  )
  const AddNewUser = (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Radio.Group defaultValue={true} onChange={(e) => { setisNewUser(e.target.value) }}>
          <Radio.Button value={true}>New User</Radio.Button>
          <Radio.Button value={false}>Existing User</Radio.Button>
        </Radio.Group>
      </div>
      {isNewUser ? (
        <div>
          <Form layout="vertical" name="user" form={tenantForm} onFinish={addNewUserToTenant}>
            <div style={{ padding: "10px 28px 0 28px" }}>
              <Form.Item
                label="Name of the user"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Please input name of user!',
                  },
                ]}
              >
                <Input className="title-input" placeholder="John Doe" />
              </Form.Item>
              <Form.Item className="email-form-item"
                label="Email Address"
                name="email"
                rules={[
                  {
                    type: 'email',
                    message: 'The input is not valid E-mail!',
                  },
                  {
                    required: true,
                    message: 'Please input user E-mail!',
                  },
                ]}
              >
                <Input className="title-input" placeholder="johndoe@example.com" onChange={() => { setIsEmailAlreadyExists(false) }} />
              </Form.Item>
              {isEmailAlreadyExists ? (
                <div style={{ color: "#fb4040", fontSize: 12, marginTop: 8 }}>Email already exists!</div>
              ) : null}
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter a password for the user" },
                  {
                    pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,100}$/,
                    min: 8,
                    message: "The password you entered dosen't meet the criteria",
                  }
                ]}
              >
                <Input.Password className="title-input" placeholder="Enter a password" />
              </Form.Item>
            </div>
            <Divider />
            <div style={{
              display: "flex",
              justifyContent: "end",
              padding: "0 28px",
              marginTop: 40,
              paddingBottom: 10
            }}>
              <Form.Item
              >
                <Button className="create-btn" htmlType="submit" disabled={addNewUserService.isLoading}>
                  {addNewUserService.isLoading ? "Creating" : "Create"}
                </Button>
              </Form.Item></div>
          </Form>
        </div>
      ) : (
        <>
          <div style={{ padding: 60 }}>
            <Input placeholder="johndoe@notavailable.com" onChange={(e) => { setEmail(e.target.value), setIsUserAvailable(true) }}></Input>
            <div style={{ height: 200, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <h4 style={{ color: "red" }}>{!isUserAvailable ? addNewUserService.err.message : ""}</h4>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button type="default">Discard</Button>
              <Button disabled={!email || !isUserAvailable || addNewUserService.isLoading} type="primary" onClick={addNewUserToTenant}>
                {addNewUserService.isLoading ? "Adding..." : "Add as tenant"}
              </Button></div>
          </div>
        </>
      )}
    </div>
  )

  const ConfirmAddUserState = (
    <div style={{padding:30,display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
        <CheckCircleIcon style={{fontSize:50,color:"green"}} />
        <h3>Tenant Added!</h3>
        <p>Do you want to add user to this tenant?</p>
        <div style={{display:"flex",gap:5}}><Button type="ghost" onClick={handleTenantModal}>Skip</Button> <Button onClick={()=>{setModalCurrentState("add-new-user")}}>Yes</Button></div>
    </div>
  )

  const AddDashboardContents = (
    <div style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
      <Input placeholder="Enter name" onChange={(e) => { setNewDashboardName(e.target.value) }} />
      <Button type="primary" style={{ marginTop: 10 }} onClick={() => { addNewDashboard() }} disabled={!newDashboardName}>Add</Button>
    </div>
  )



  let currentState
  switch (modalCurrentState) {
    case "confirm-add-user":
      currentState = ConfirmAddUserState
      break;
    case "new-tenant":
      currentState = NewTenant
      break;
    case "add-new-user":
      currentState = AddNewUser
    default:
      break;
  }

  return (
    <>
      <Layout className="homepage-wrapper">
        <Header className="main-header">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              onClick={() => toggleHamburgerDrawer()}
              type="text"
              className="hamburger-menu-btn"
            >
              <HamburgerMenuIcon className="hamburger-icon" />
            </Button>
            <div style={{ minWidth: 150, maxWidth: 200 }}>
              <Typography.Text ellipsis={true} style={{ color: "black", fontFamily: "Almarose-Bold" }}>
                {organisationDetails?.orgName}
              </Typography.Text>
            </div>
          </div>
          {!isUserSuperAdmin && filterNames.length === 0 && !searchInput && !selectedTenant ? (
            null
          ) : (
            <div className="dropdown-section">
              <h4 style={{ display: selectedTenant ? "none" : "inline" }}>Viewing:</h4>
              <Dropdown overlay={menu} trigger={['click']} overlayClassName="list-tenant-dropdown" placement="bottomCenter">
                {selectedTenant ? (
                  <Button type="text" className="sltd-tenant-btn">
                    <span>Viewing:</span> <div style={{ maxWidth: 160 }}><Typography.Text className="selected-tenant-txt" ellipsis={true} style={{ marginLeft: 8 }}>{selectedTenant}</Typography.Text></div><DownOutlined />
                  </Button>
                ) : (
                  <Button style={{ marginLeft: 8 }} type="text">
                    Your Dashboard <DownOutlined />
                  </Button>
                )}
              </Dropdown>
              {selectedTenant ? (
                isUserSuperAdmin ? (
                  <Button type="text" style={{ marginLeft: 7 }} onClick={exitTenant}>
                    <Typography.Text style={{ marginLeft: 9 }}>Exit</Typography.Text><CloseOutlined />
                  </Button>
                ) : (null)
              ) : null}

            </div>
          )}

          <div className="username-signout-btn-wrapper">
            <div className="username-role-wrapper">
              <span className="username-text">
                {context?.response?.meta?.currentUser?.name}
              </span>
              <span className="role-text">
                {context?.response?.meta?.currentUser?.emailAddress}
              </span>
            </div>
            <Divider className="header-custom-divider" type="vertical" />
            <div className="signout-btn-wrapper">
              <Button
                type="link"
                className="signout-btn"
                onClick={() => {
                  Modal.confirm({
                    maskClosable: true,
                    title: "Logout Confirmation",
                    content: " Are you sure you want to logout?",
                    okText: "Logout",
                    onOk: () => {
                      localStorage.removeItem('selectedTenant');
                      logoutUser();
                    },
                  });
                }}
              >
                <LogoutOutlined className="logout-antd-icon" />
                Sign Out
              </Button>
            </div>
          </div>
        </Header>
        <Layout>
          <Sider
            className={
              collapsed === "close"
                ? "sider-wrapper-collapsed"
                : "sider-wrapper"
            }
          >
            <div className="sider-content-wrapper">
              <div className="hamburger-button-wrapper">
                {collapsed === "close" ? (
                  <button
                    onClick={() => openSider()}
                    className="hamburger-button"
                  >
                    <SiderLeftChevronIcon
                      style={{
                        fontSize: 12,
                        display: "flex",
                        rotate: "180deg",
                      }}
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => closeSider()}
                    className="hamburger-button"
                  >
                    <SiderLeftChevronIcon
                      style={{ fontSize: 12, display: "flex" }}
                    />
                  </button>
                )}
              </div>
              {/* <span className="version-text">v1.0.1</span> */}
              <div className="top-content-section">
                {Array.isArray(tenantDashboardItems?.response?.items) ? (
                  tenantDashboardItems?.response?.items.map((item, index) => {
                    return (
                      <div className="button-wrapper" key={index} style={{ display: "flex", alignItems: "center" }}
                        onMouseEnter={() => { setHoveredIndex(index) }}
                        onMouseLeave={() => { setHoveredIndex(null) }}>
                        <Link
                          type="text"
                          to={`/app/viewport${item.path}`}
                          className={`${location.pathname === `/app/viewport${item.path}`
                            ? "selected-btn"
                            : "unselected-btn"
                            }`}
                        >
                          <SiderAnalyticsChartIcon style={{ fontSize: 18 }} />
                          <span className="btn-text">{item.name === "default" ? "Dashboard" : item.name}</span>
                          {item.name !== "default" && collapsed !== "close" && hoveredIndex === index ? (
                            <Popconfirm
                              title="Delete the dashboard"
                              onCancel={() => { console.log("Cancelled") }}
                              onConfirm={() => {
                                deleteMany([item.path]).then(() => {
                                  window.location.href = ("/app/viewport" + dashBoardPath + "/default")
                                })
                              }}
                              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                              okText="Delete"
                              cancelText="Cancel"
                            >
                              <Button type="text" style={{ position: "absolute", right: 0 }} onClick={(e) => { e.preventDefault() }}><DeleteOutlined /></Button>
                            </Popconfirm>
                          ) : null}

                          {item.name !== "default" && collapsed !== "close" && hoveredIndex === index ? (
                            <Popconfirm
                              title={
                                <>
                                  <div>Rename the dashboard</div>
                                  <div style={{ marginTop: 10 }}><Input value={renameDashboard} onChange={(e) => { setRenameDashboard(e.target.value) }} /></div>
                                </>
                              }
                              onCancel={() => { console.log("Cancelled") }}
                              onConfirm={() => {
                                rename(`${item.path}`, item.parentPath, renameDashboard).then(() => {
                                  window.location.href = ("/app/viewport" + dashBoardPath + "/default")
                                })
                              }}
                              okButtonProps={{ disabled: !renameDashboard || renameDashboard === item.name }}
                              icon={<EditOutlined style={{ color: "grey" }} />}
                              okText="Rename"
                              cancelText="Cancel"
                            >
                              <Button type="text" style={{ position: "absolute", right: 0, marginRight: 30 }} onClick={(e) => { e.preventDefault(), setRenameDashboard(item.name) }}><EditOutlined /></Button>
                            </Popconfirm>
                          ) : null}
                        </Link>
                      </div>
                    );
                  })
                ) : null}

                <Popover
                  content={AddDashboardContents}
                  title="Add Dashboard"
                  trigger="click"
                  open={isAddDashboardModalOpen}
                  onOpenChange={handleAddDashboardModal}
                >
                  <div className="button-wrapper">
                    <div
                      className="unselected-btn"
                    >
                      <PlusOutlined style={{ fontSize: 18, color: "black" }} />
                      <span className="btn-text">Add Dashboard</span>
                    </div>
                  </div>
                </Popover>
                {selectedTenant ? (
                  <>
                    <div className="button-wrapper">
                      <Link to={`/app/files/tenants/${selectedTenant.toLowerCase()}/info`}
                        className={location.pathname === `/app/files/tenants/${selectedTenant.toLowerCase()}/info` ? "selected-btn" : "unselected-btn"}
                      >
                        <UsergroupAddOutlined style={{ fontSize: 18, color: "black" }} />
                        <span className="btn-text">Manage Users</span>
                      </Link>
                    </div>
                    <Divider />
                  </>
                ) : <Divider />}

                {/* {Array.isArray(userDashboardItems?.response?.items)
                  ? userDashboardItems?.response?.items.map((item) => {
                    return (
                      <div key={item.slug} className="button-wrapper">
                        <Link
                          type="text"
                          to={`/app/viewport${item.destinationPath || item.path
                            }`}
                          className={`${location.pathname ===
                            `/app/viewport${item.destinationPath || item.path
                            }`
                            ? "selected-btn"
                            : "unselected-btn"
                            }`}
                        >
                          <SiderAnalyticsChartIcon style={{ fontSize: 18 }} />
                          <span className="btn-text">{item.name}</span>
                        </Link>
                      </div>
                    );
                  })
                  : null} */}
                {/* {Array.isArray(systemDashboardItems?.response?.items)
                  ? systemDashboardItems?.response?.items.map((item) => {
                    return (
                      <div key={item.slug} className="button-wrapper">
                        <Link
                          type="text"
                          to={`/app/viewport${item.destinationPath || item.path
                            }`}
                          className={`${location.pathname ===
                            `/app/viewport${item.destinationPath || item.path
                            }`
                            ? "selected-btn"
                            : "unselected-btn"
                            }`}
                        >
                          <SiderAnalyticsChartIcon style={{ fontSize: 18 }} />
                          <span className="btn-text">{item.name}</span>
                        </Link>
                      </div>
                    );
                  })
                  : null}
                {userDashboardItems?.response?.items.length > 0 ||
                  systemDashboardItems?.response?.items.length > 0 ? (
                  <Divider />
                ) : null} */}
                {/*    {Array.isArray(userQuicklinkItems?.response?.items)
                  ? userQuicklinkItems?.response?.items.map((item) => {
                    return (
                      <div key={item.slug} className="button-wrapper">
                        <Link
                          type="text"
                          to={`/app/files${item.destinationPath || item.path
                            }`}
                          className={`${location.pathname ===
                            `/app/files${item.destinationPath || item.path}`
                            ? "selected-btn"
                            : "unselected-btn"
                            }`}
                        >
                          <SiderShortcutFolderIcon style={{ fontSize: 19 }} />
                          <span className="btn-text">{item.name}</span>
                        </Link>
                      </div>
                    );
                  })
                  : null} */}
                {Array.isArray(systemQuicklinkItems?.response?.items)
                  ? systemQuicklinkItems?.response?.items.map((item) => {
                    return (
                      <div key={item.slug} className="button-wrapper">
                        <Link
                          type="text"
                          to={`/app/files${item.destinationPath || item.path
                            }`}
                          className={`${location.pathname ===
                            `/app/files${item.destinationPath || item.path}`
                            ? "selected-btn"
                            : "unselected-btn"
                            }`}
                        >
                          <SiderShortcutFolderIcon style={{ fontSize: 19 }} />
                          <span className="btn-text">{item.name}</span>
                        </Link>
                      </div>
                    );
                  })
                  : null}
                {/* {userQuicklinkItems?.response?.items?.length > 0 ||
                  systemQuicklinkItems?.response?.items?.length > 0 ? (
                  <Divider />
                ) : null} */}
                <div className="button-wrapper">
                  <Link
                    type="text"
                    to="/app/users"
                    className={`${location.pathname === "/app/users" ||
                      location.pathname.includes("/app/users") ||
                      location.pathname.includes("/app/groups")
                      ? "selected-btn"
                      : "unselected-btn"
                      }`}
                  >
                    <SiderUsersIcon style={{ fontSize: 18 }} />
                    <span className="btn-text">{isUserSuperAdmin ? "Global Access" : "Account"}</span>
                  </Link>
                </div>
                  <>
                    <div className="button-wrapper">
                      <Link
                        type="text"
                        to={navigateSettings}
                        className={`${location.pathname === navigateSettings
                          ? "selected-btn"
                          : "unselected-btn"
                          }`}
                      >
                        <SiderSettingsIcon style={{ fontSize: 18 }} />
                        <span className="btn-text">{isUserSuperAdmin ? "Global Settings" : "Settings"}</span>
                      </Link>
                    </div>
                  </>
                {/* {isUserSuperAdmin === true ? ( */}
                <>
                  <div className="button-wrapper">
                    <Link
                      type="text"
                      to={navigateFileManager}
                      className={`${location.pathname === navigateFileManager
                        ? "selected-btn"
                        : "unselected-btn"
                        }`}
                    >
                      <SiderFolderIcon style={{ fontSize: 18 }} />
                      <span className="btn-text">File Manager</span>
                    </Link>
                  </div>
                </>
                {/* ) : null} */}
              </div>
            </div>
          </Sider>
          <Content
            style={{ marginTop: 56 }}
            className={
              collapsed === "close"
                ? "sidebar-content-wrapper-collapsed"
                : "sidebar-content-wrapper"
            }
          >
            {props.children}
          </Content>
        </Layout>
      </Layout>

      <Drawer
        className="hamburger-drawer-whole-wrapper"
        placement="left"
        onClose={toggleHamburgerDrawer}
        closable={false}
        visible={visible}
        width={"100%"}
        bodyStyle={{
          background: "#F8F8F8",
          padding: "unset",
          justifyContent: "space-between",
          display: "flex",
          flexDirection: "column",
          paddingBottom: 26,
        }}
      >
        <div className="hamburger-drawer-content-wrapper">
          <div className="sider-content-wrapper">
            <div className="top-content-section">
              {/* {Array.isArray(userDashboardItems?.response?.items)
                ? userDashboardItems?.response?.items.map((item) => {
                  return (
                    <div key={item.slug} className="button-wrapper">
                      <Link
                        type="text"
                        to={`/app/viewport${item.destinationPath || item.path
                          }`}
                        className={`${location.pathname ===
                          `/app/viewport${item.destinationPath || item.path}`
                          ? "selected-btn"
                          : "unselected-btn"
                          }`}
                      >
                        <SiderShortcutFolderIcon style={{ fontSize: 19 }} />
                        <span className="btn-text">{item.name}</span>
                      </Link>
                    </div>
                  );
                })
                : null}
              <div className="button-wrapper">
                <Link
                  type="text"
                  to="/app/users"
                  className={`${location.pathname === "/app/users" ||
                    location.pathname.includes("/app/users") ||
                    location.pathname.includes("/app/groups")
                    ? "selected-btn"
                    : "unselected-btn"
                    }`}
                >
                  <SiderSettingsIcon style={{ fontSize: 18 }} />
                  <span className="btn-text">Users & Groups</span>
                </Link>
              </div>
              {isUserSuperAdmin === true ? (
                <>
                  <Divider style={{ margin: "10px 0" }} />
                  <div className="button-wrapper">
                    <Link
                      type="text"
                      to="/app/files"
                      className={`${location.pathname === "/app/files"
                        ? "selected-btn"
                        : "unselected-btn"
                        }`}
                    >
                      <SiderFolderIcon style={{ fontSize: 18 }} />
                      <span className="btn-text">File Manager</span>
                    </Link>
                  </div>
                </>
              ) : null} */}

              {Array.isArray(tenantDashboardItems?.response?.items) ? (
                tenantDashboardItems?.response?.items.map((item, index) => {
                  return (
                    <div className="button-wrapper" key={index} style={{ display: "flex", alignItems: "center" }}>
                      <Link
                        type="text"
                        to={`/app/viewport${item.path}`}
                        className={`${location.pathname === `/app/viewport${item.path}`
                          ? "selected-btn"
                          : "unselected-btn"
                          }`}
                      >
                        <SiderAnalyticsChartIcon style={{ fontSize: 18 }} />
                        <span className="btn-text">{item.name === "default" ? "Dashboard" : item.name}</span>
                        {item.name !== "default" && location.pathname === `/app/viewport${item.path}` && collapsed !== "close" ? (
                          <Popconfirm
                            title="Delete the dashboard"
                            onCancel={() => { console.log("Cancelled") }}
                            onConfirm={() => {
                              deleteMany([item.path]).then(() => {
                                window.location.href = ("/app/viewport" + dashBoardPath + "/default")
                              })
                            }}
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            okText="Delete"
                            cancelText="Cancel"
                          >
                            <Button type="text" style={{ position: "absolute", right: 0 }} onClick={(e) => { e.preventDefault() }}><DeleteOutlined /></Button>
                          </Popconfirm>
                        ) : null}

                        {item.name !== "default" && location.pathname === `/app/viewport${item.path}` && collapsed !== "close" ? (
                          <Popconfirm
                            title={
                              <>
                                <div>Rename the dashboard</div>
                                <div style={{ marginTop: 10 }}><Input value={renameDashboard} onChange={(e) => { setRenameDashboard(e.target.value) }} /></div>
                              </>
                            }
                            onCancel={() => { console.log("Cancelled") }}
                            onConfirm={() => {
                              rename(`${item.path}`, item.parentPath, renameDashboard).then(() => {
                                window.location.href = ("/app/viewport" + dashBoardPath + "/default")
                              })
                            }}
                            okButtonProps={{ disabled: !renameDashboard || renameDashboard === item.name }}
                            icon={<EditOutlined style={{ color: "grey" }} />}
                            okText="Rename"
                            cancelText="Cancel"
                          >
                            <Button type="text" style={{ position: "absolute", right: 0, marginRight: 30 }} onClick={(e) => { e.preventDefault(), setRenameDashboard(item.name) }}><EditOutlined /></Button>
                          </Popconfirm>
                        ) : null}
                      </Link>
                    </div>
                  );
                })
              ) : null}
              <Popover
                content={AddDashboardContents}
                title="Add Dashboard"
                trigger="click"
                open={isAddDashboardModalOpen}
                onOpenChange={handleAddDashboardModal}
              >
                <div className="button-wrapper">
                  <div
                    className="unselected-btn"
                  >
                    <PlusOutlined style={{ fontSize: 18, color: "black" }} />
                    <span className="btn-text">Add Dashboard</span>
                  </div>
                </div>
              </Popover>
              {selectedTenant ? (
                <>
                  <Divider />
                  <div className="button-wrapper">
                    <Link to={`/app/files/tenants/${selectedTenant.toLowerCase()}/info`}
                      className={location.pathname === `/app/files/tenants/${selectedTenant.toLowerCase()}/info` ? "selected-btn" : "unselected-btn"}
                    >
                      <UsergroupAddOutlined style={{ fontSize: 18, color: "black" }} />
                      <span className="btn-text">Manage Users</span>
                    </Link>
                  </div>
                </>
              ) : null}
              <Divider />
              {/*  {Array.isArray(userQuicklinkItems?.response?.items)
                ? userQuicklinkItems?.response?.items.map((item) => {
                  return (
                    <div key={item.slug} className="button-wrapper">
                      <Link
                        type="text"
                        to={`/app/files${item.destinationPath || item.path
                          }`}
                        className={`${location.pathname ===
                          `/app/files${item.destinationPath || item.path}`
                          ? "selected-btn"
                          : "unselected-btn"
                          }`}
                      >
                        <SiderShortcutFolderIcon style={{ fontSize: 19 }} />
                        <span className="btn-text">{item.name}</span>
                      </Link>
                    </div>
                  );
                })
                : null} */}
              {Array.isArray(systemQuicklinkItems?.response?.items)
                ? systemQuicklinkItems?.response?.items.map((item) => {
                  return (
                    <div key={item.slug} className="button-wrapper">
                      <Link
                        type="text"
                        to={`/app/files${item.destinationPath || item.path
                          }`}
                        className={`${location.pathname ===
                          `/app/files${item.destinationPath || item.path}`
                          ? "selected-btn"
                          : "unselected-btn"
                          }`}
                      >
                        <SiderShortcutFolderIcon style={{ fontSize: 19 }} />
                        <span className="btn-text">{item.name}</span>
                      </Link>
                    </div>
                  );
                })
                : null}
              {userQuicklinkItems?.response?.items?.length > 0 ||
                systemQuicklinkItems?.response?.items?.length > 0 ? (
                <Divider />
              ) : null}
              <div className="button-wrapper">
                <Link
                  type="text"
                  to="/app/users"
                  className={`${location.pathname === "/app/users" ||
                    location.pathname.includes("/app/users") ||
                    location.pathname.includes("/app/groups")
                    ? "selected-btn"
                    : "unselected-btn"
                    }`}
                >
                  <SiderUsersIcon style={{ fontSize: 18 }} />
                  <span className="btn-text">{isUserSuperAdmin ? "Global Access" : "Account"}</span>
                </Link>
              </div>
              {isUserSuperAdmin === true ? (
                <>
                  <div className="button-wrapper">
                    <Link
                      type="text"
                      to={navigateSettings}
                      className={`${location.pathname === navigateSettings
                        ? "selected-btn"
                        : "unselected-btn"
                        }`}
                    >
                      <SiderSettingsIcon style={{ fontSize: 18 }} />
                      <span className="btn-text">{isUserSuperAdmin ? "Global Settings" : "Settings"}</span>
                    </Link>
                  </div>
                </>
              ) : null}
              {/* {isUserSuperAdmin === true ? ( */}
              <>
                <div className="button-wrapper">
                  <Link
                    type="text"
                    to={navigateFileManager}
                    className={`${location.pathname === navigateFileManager
                      ? "selected-btn"
                      : "unselected-btn"
                      }`}
                  >
                    <SiderFolderIcon style={{ fontSize: 18 }} />
                    <span className="btn-text">File Manager</span>
                  </Link>
                </div>
              </>
              {/* ) : null} */}
            </div>
          </div>
        </div>
        <div>
          <div className="username-signout-btn-wrapper-sm">
            <div className="username-role-wrapper">
              <span className="username-text">
                {context?.response?.meta?.currentUser?.name}
              </span>
              <span className="role-text">
                {context?.response?.meta?.currentUser?.emailAddress}
              </span>
            </div>
            <div className="signout-btn-wrapper">
              <Button
                type="link"
                className="signout-btn"
                onClick={() => {
                  Modal.confirm({
                    maskClosable: true,
                    title: "Logout Confirmation",
                    content: " Are you sure you want to logout?",
                    okText: "Logout",
                    onOk: () => {
                      localStorage.removeItem('selectedTenant');
                      logoutUser();
                    },
                  });
                }}
              >
                <LogoutOutlined className="logout-antd-icon" />
                Sign Out
              </Button>
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              color: "#9F9F9F",
              fontFamily: "Almarose-Medium",
              paddingLeft: 24,
            }}
          >
            v1.0.1
          </span>
        </div>
      </Drawer>
      <Modal title="New Tenant"
        width={570}
        open={isTenantModalOpen}
        onCancel={handleTenantModal}
        onOk={addNewTenant}
        centered
        footer={null}
        zIndex={10001}
        className="new-tenant-modal">
        {currentState}
      </Modal>
    </>
  );
});

export default createComponent((props) => {
  return (
    <NoSSR>
      <SiderLayout {...props} />
    </NoSSR>
  );
});
