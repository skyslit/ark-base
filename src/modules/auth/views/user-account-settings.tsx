import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/account-settings-page.scss';
import { Col, Row, Typography, Button, Collapse, Table, Modal, Form, Input, message, Divider, Select, Spin, Checkbox } from "antd";
import SuperAdminIcon from "../images/super-admin-icon.png";
import ApplicationIcon from "../images/application.png";
import MaleLogo from "../images/male-logo.png";
import NameLogo from "../images/name-icon.png"
import EditIcon from "../images/edit-icon.png"
import MailIcon from "../images/mail-icon.png"
import PasswordIcon from "../images/password-icon.png"
import UserIcon from "../images/user-male-icon .png"
import { PlusOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { GroupInfo } from "../../auth/components/group-info";
import { Link } from "react-router-dom";
import Fade from "react-reveal/Fade";
import { Helmet } from "react-helmet-async";

export default createComponent((props) => {
    const { useService, useContext, useTableService } = props.use(Frontend);
    const { Panel } = Collapse;
    const { TextArea } = Input;
    const { Option } = Select;

    const columns = [
        {
            title: 'Name/Email',
            key: 'email',
            render: (user, row: any) =>
                <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img className="user-icon" src={UserIcon} />
                        <Link className="usertable-name" to={`/app/users/${(row as any)._id}`} style={{ color: "black" }}>{user.name || user.email}</Link>
                    </div>
                </>
        },
        {
            title: 'In Group(s)',
            dataIndex: 'groupId',
            key: 'groupId',
            render: (groupId: any) => {
                return <GroupInfo groupId={groupId} />;
            },
        },
    ];

    const columns1 = [

        {
            title: 'Group Title',
            dataIndex: 'groupTitle',
            key: 'groupTitle',
            render: (user, row: any) =>
                <>
                    <Link className="grouptable-name" to={`/app/groups/${(row as any)._id}`} style={{ color: "black" }}>{user}</Link>
                </>
        },
        {
            title: 'No. of members',
            dataIndex: 'count',
            key: 'count',
            render: (count, row: any) =>
                <>
                    <span>{count > 0 ? count : 0}</span>
                </>
        },
    ];

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
    const [showEditEmail, setShowEditEmail] = React.useState(false);
    const [showOtp, setShowOtp] = React.useState(false);
    const [updatePassword, setUpdatePassword] = React.useState(false);
    const [editName, setEditName] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [forUserCount, setforUserCount] = React.useState([]);
    const [userDetails, setUserDetails] = React.useState([]);
    const [nameDisabled, setNameDisabled] = React.useState(true);
    const [emailDisabled, setEmailDisabled] = React.useState(true);
    const [passwordDisabled, setPasswordDisabled] = React.useState(true);
    const [groupTitleDisabled, setGroupTitleDisabled] = React.useState(true);
    const [groups, setGroups] = React.useState(null);
    const [isTenantIdAvailable, setIsTenantIdAvailable] = React.useState(false);
    const [tenantId, setTenantId] = React.useState("");
    const [show, setShow] = React.useState(false);


    const context = useContext();
    const formRef = React.useRef();
    const userRef = React.useRef();
    const groupRef = React.useRef();
    const [nameForm] = Form.useForm();
    const userId = context.response.meta.currentUser._id;


    const addGroupService = useService({ serviceId: "add-new-group" });
    const showAllUsersService = useService({ serviceId: "list-user-service" });
    const showAllGroupsService = useService({ serviceId: "assign-group" });
    const addNewUserService = useService({ serviceId: "add-user" });
    const updateEmailService = useService({ serviceId: "email-otp-verification" });
    const updateNameService = useService({ serviceId: "update-name-service" });
    const listUserDetailsService = useService({ serviceId: "get-user-by-id" });
    const allGroupsService = useService({ serviceId: "list-group-service" });
    const changePasswordService = useService({ serviceId: "change-password" });
    const availabilityCheckService = useService({ serviceId: "availability-check-of-tenantId" });

    const logoutService = useService({ serviceId: "user-logout" });


    const logoutUser = () => {
        logoutService
            .invoke()
            .then((res) => { })
            .catch((e) => {
                message.error("Try again!");
            })
            .finally(() => context.invoke(null, { force: true }));
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const showUserModal = () => {
        setIsUserModalOpen(true);
    };

    const userCancel = () => {
        setIsUserModalOpen(false);
    };

    const genExtra = () => (
        isSuperAdmin === true ? (
            <button className="new-user-btn"
                onClick={event => {
                    event.stopPropagation();
                }}>
                <div onClick={showUserModal}>
                    <PlusOutlined style={{ marginRight: 12 }} className="plus-icon" /><span className="add-user">Add user</span>
                </div>
            </button>
        ) : <div className="new-user-btn-hide"></div>
    );

    const genExtra1 = () => (
        isSuperAdmin === true ? (
            <button
                className="new-group-btn"
                onClick={event => {
                    event.stopPropagation();
                }}>
                <div onClick={showModal}>
                    <PlusOutlined style={{ marginRight: 12 }} className="plus-icon" />
                    <span className="add-group">Add new group</span>
                </div>
            </button>
        ) : <div className="new-user-btn-hide"></div>
    );



    const getGroupIds = React.useMemo(() => {
        if (groups) {
            return groups.find((g) =>
                g.groupTitle === "SUPER_ADMIN"
            );
        }

    }, [groups]);


    const isSuperAdmin = React.useMemo(() => {
        if (getGroupIds && groups) {
            return context.response.meta.currentUser.groupId.includes(getGroupIds?._id)
        }
    }, [getGroupIds])


    const addGroup = (data: any) => {
        addGroupService.invoke({
            groupTitle: data.groupTitle,
            description: data.description
        }, { force: true })
            .then((res) => {
                (groupRef.current as any).resetFields();
                setIsModalOpen(false)
                listAllGroups.onChange()
                showAllGroups()
            })
            .catch((e) => {
                message.error(e.message)
            })
    }

    const triggerEditEmail = () => {
        setShowEditEmail(!showEditEmail)
    }

    const triggerEditName = () => {
        setEditName(!editName)
    }

    const showAllGroups = () => {
        showAllGroupsService.invoke({}, { force: true })
            .then((res) => {
                setItems(res.data);
            })
            .catch(() => {
            })

    }


    const showAllUsers = () => {
        if (isSuperAdmin) {
            showAllUsersService.invoke({}, { force: true })
                .then((res) => {
                    setforUserCount(res.data);
                })
                .catch(() => {
                })
        }
        else {
            return null
        }
    }

    const triggerUpdatePassword = () => {
        setUpdatePassword(!updatePassword)
    }

    const availabilityCheck = () => {
        availabilityCheckService.invoke({
            tenantId: tenantId
        }, { force: true })
            .then((res) => {

            })
            .catch(() => {

            })
    }

    React.useEffect(() => {
        if (tenantId) {
            availabilityCheck();
        }
    }, [tenantId])

    const addNewUser = (data) => {
        addNewUserService.invoke({
            name: data.name,
            email: data.email,
            password: data.password,
            tenantId: tenantId,
            groupId: data.groupId
        }, { force: true })
            .then((res) => {
                setIsUserModalOpen(false);
                (userRef.current as any).resetFields();
                listAllUsers.onChange();
                showAllUsers();
                listAllGroups.onChange();
                setIsTenantIdAvailable(false)
            })
            .catch((e) => {
            })
    }

    const listAllGroups = useTableService
        ({
            serviceId: "list-all-groups",
            columns1,
            defaultPageSize: 10,
            disableSelect: true,
        })

    const listAllUsers = useTableService({
        serviceId: "list-all-users",
        columns,
        defaultPageSize: 10,
        disableSelect: true,
    });


    const updateName = (data) => {
        updateNameService.invoke({
            userId,
            name: data.name
        }, { force: true })
            .then((res) => {
                listUserDetails()
                setEditName(false)
                listAllUsers.onChange()
            })
            .catch(() => {
            })
    }

    const listUserDetails = () => {
        listUserDetailsService.invoke({
            userId
        }, { force: true })
            .then((res) => {
                setUserDetails(res.data[0])
            })
            .catch(() => {

            })
    }

    const changePassword = (data) => {
        changePasswordService.invoke({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword
        }, { force: true })
            .then((res) => {
                (formRef.current as any).resetFields();
                setUpdatePassword(false)
                message.success("Password changed successfully")
            })
            .catch(() => {
                message.error("Failed to change password")
            })
    }

    const updateEmail = (data) => {
        updateEmailService.invoke({
            email: data.newEmail,
            userId
        }, { force: true })
            .then((res) => {
                setShowEditEmail(false)
                setShowOtp(false)
                listUserDetails()
            })
            .catch((e) => {
                message.error(e.message)
            })
    }

    const allGroups = () => {
        allGroupsService
            .invoke()
            .then((res) => {
                setGroups(res.data)
            })
    };

    React.useEffect(() => {
        nameForm.setFieldsValue({
            name: userDetails ? userDetails.name : "",
        });
    }, [userDetails]);

    React.useEffect(() => {
        showAllUsers();
    }, [isSuperAdmin]);

    React.useEffect(() => {
        allGroups()
    }, []);

    React.useEffect(() => {
        showAllGroups();
    }, []);

    React.useEffect(() => {
        listUserDetails();
    }, []);

    const antIcon = (
        <LoadingOutlined style={{ fontSize: 30, color: "#4c91c9" }} spin />
    );

    React.useEffect(() => {
        setShow(true);
        const handleBeforeUnload = () => {
            setShow(false);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    if (showAllGroupsService && listUserDetailsService.isLoading) {
        return (
            <div
                className={`${show ? 'fade-enter-active' : 'fade-exit-active'}`}
                style={{
                    backgroundColor: "#F8F8F8",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Spin indicator={antIcon} />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title> Settings | Account </title>
            </Helmet>
            <Fade>
                <div className={`account-settings-layout ${show ? 'fade-enter-active' : 'fade-exit-active'}`} style={{ height: "100%" }}>
                    <div className="content-wrapper" style={{ paddingBottom: "unset" }}>
                        <Row justify="center" >
                            <Col span={22} className="main-col" >
                                <div className="profile-wrapper">
                                    <div className="profile-img-section">
                                        <div className="profile-div">
                                            <img className="profile-img" src={MaleLogo}></img>
                                        </div>
                                        <div>
                                            <span className="name-span">{userDetails ? userDetails.name : ""}</span>
                                            <div className="user-email-grp-section">
                                                <span className="gmail-span">  {userDetails ? userDetails.email : ""}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="information-box">
                                    <div><Typography.Text style={{ fontWeight: "500" }}>
                                        Basic Information
                                    </Typography.Text></div>
                                    {/* <div className="basic-info-name-section">
                                    <div className="basic-sub">
                                        <div style={{ display: "flex" }}>
                                            <img className="name-img" src={NameLogo} style={{ width: 40, height: 40 }}></img>
                                            <Typography.Text ellipsis={true} className="name-text">Name</Typography.Text>
                                        </div>
                                        <div className={
                                            editName === true ? "edit-name-section-sm" : "edit-name-section-hide-sm"
                                        }>
                                            <Form name="name" onFinish={updateName} form={nameForm}
                                                onValuesChange={(changedFields, allFields) => {
                                                    if (
                                                        allFields.name !== "" &&
                                                        allFields.name !== undefined
                                                    ) {
                                                        setNameDisabled(false);
                                                    } else {
                                                        setNameDisabled(true);
                                                    }
                                                }}
                                            >
                                                <Form.Item name="name" >
                                                    <Input className="input-section-sm" />
                                                </Form.Item>
                                            </Form>
                                            <div style={{ display: "flex", justifyContent: "end", marginTop: 18 }}>
                                                <button className="save-btn-sm" form="name" htmlType="submit" disabled={updateNameService.isLoading || nameDisabled}>
                                                    {updateNameService.isLoading === true ? (
                                                        <>
                                                            <LoadingOutlined style={{ marginRight: 5 }} />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        "Save"
                                                    )}</button></div>
                                            <button className="close-btn-sm" onClick={triggerEditName}> <CloseOutlined className="close-icon" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={
                                        editName === false ? "basic-sub2" : "basic-sub2-hide"
                                    }>
                                        <Typography.Text ellipsis={true} className="user-name">
                                            {userDetails ? userDetails.name ? userDetails.name : <span style={{ fontStyle: "Italic", fontWeight: "400" }}>Enter your name</span> : <span style={{ fontStyle: "Italic", fontWeight: "400" }}>Enter your name</span>}
                                        </Typography.Text>
                                        <button className="edit-btn" onClick={triggerEditName}><img className="edit-img" src={EditIcon}></img></button>
                                    </div>
                                    <div className={
                                        editName === true ? "edit-name-section" : "edit-name-section-hide"
                                    }>
                                        <Form name="name" onFinish={updateName} form={nameForm}
                                            onValuesChange={(changedFields, allFields) => {
                                                if (
                                                    allFields.name !== "" &&
                                                    allFields.name !== undefined
                                                ) {
                                                    setNameDisabled(false);
                                                } else {
                                                    setNameDisabled(true);
                                                }
                                            }}
                                        >
                                            <Form.Item name="name" >
                                                <Input className="input-section" />
                                            </Form.Item>
                                        </Form>
                                        <div style={{ width: "60%", display: "flex", justifyContent: "end", marginTop: 18 }}>
                                            <button className="save-btn" form="name" htmlType="submit" disabled={updateNameService.isLoading || nameDisabled}>
                                                {updateNameService.isLoading === true ? (
                                                    <>
                                                        <LoadingOutlined style={{ marginRight: 5 }} />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    "Save"
                                                )}</button></div>
                                        <button className="close-btn" onClick={triggerEditName}> <CloseOutlined className="close-icon" />
                                        </button>
                                    </div>
                                </div> */}

                                    <div className="basic-info-email-section">
                                        <div className="basic-sub">
                                            <div style={{ display: "flex" }}>
                                                <img className="name-img" src={MailIcon} style={{ width: 40, height: 40 }}></img>
                                                <Typography.Text className="name-text">Email</Typography.Text>
                                            </div>
                                            <div className={
                                                showEditEmail === true ? "edit-email-section-sm" : "edit-email-section-hide-sm"
                                            }>
                                                <div>
                                                    <Form name="newEmail" onFinish={updateEmail}
                                                        onValuesChange={(changedFields, allFields) => {
                                                            if (
                                                                allFields.newEmail !== "" &&
                                                                allFields.newEmail !== undefined
                                                            ) {
                                                                setEmailDisabled(false);
                                                            } else {
                                                                setEmailDisabled(true);
                                                            }
                                                        }}>
                                                        <Form.Item name="newEmail"
                                                            rules={[
                                                                {
                                                                    type: 'email',
                                                                    message: 'The input is not valid E-mail!',
                                                                },
                                                                {
                                                                    required: true,
                                                                    message: 'Please input your E-mail!',
                                                                },
                                                            ]}>
                                                            <Input placeholder="Enter your new email address" type="text" className="input-section-sm" />
                                                        </Form.Item>
                                                    </Form>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "end", marginTop: 18 }}>
                                                    <button form="newEmail" className="send-verfication-btn-sm"
                                                        disabled={updateEmailService.isLoading || emailDisabled}>
                                                        {updateEmailService.isLoading === true ? (
                                                            <>
                                                                <LoadingOutlined style={{ marginRight: 5 }} />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            "Update"
                                                        )}</button></div>
                                                <button className="close-btn-sm" onClick={triggerEditEmail}> <CloseOutlined className="close-icon" /> </button>
                                            </div>
                                        </div>
                                        <div className={
                                            showEditEmail === false && showOtp === false ? "basic-sub2" : "basic-sub2-hide"
                                        }>
                                            <Typography.Text ellipsis={true} className="user-email">
                                                {userDetails ? userDetails.email : ""}
                                            </Typography.Text>
                                            {/* <button className="edit-btn" onClick={triggerEditEmail}><img className="edit-img" src={EditIcon}></img></button> */}
                                        </div>
                                        <div className={
                                            showEditEmail === true ? "edit-email-section" : "edit-email-section-hide"
                                        }>
                                            <div>
                                                <Form name="newEmail" onFinish={updateEmail}
                                                    onValuesChange={(changedFields, allFields) => {
                                                        if (
                                                            allFields.newEmail !== "" &&
                                                            allFields.newEmail !== undefined
                                                        ) {
                                                            setEmailDisabled(false);
                                                        } else {
                                                            setEmailDisabled(true);
                                                        }
                                                    }}>
                                                    <Form.Item name="newEmail"
                                                        rules={[
                                                            {
                                                                type: 'email',
                                                                message: 'The input is not valid E-mail!',
                                                            },
                                                            {
                                                                required: true,
                                                                message: 'Please input your E-mail!',
                                                            },
                                                        ]}>
                                                        <Input placeholder="Enter your new email address" type="text" className="input-section" />
                                                    </Form.Item>
                                                </Form>
                                            </div>
                                            <div style={{ width: "60%", display: "flex", justifyContent: "end", marginTop: 18 }}>
                                                <button onClick={updateEmail} className="send-verfication-btn"
                                                    disabled={updateEmailService.isLoading || emailDisabled}>
                                                    {updateEmailService.isLoading === true ? (
                                                        <>
                                                            <LoadingOutlined style={{ marginRight: 5 }} />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        "Update"
                                                    )}
                                                </button></div>
                                            <button className="close-btn" onClick={triggerEditEmail}> <CloseOutlined className="close-icon" /> </button>
                                        </div>
                                    </div>

                                    <div className="basic-password" >
                                        <div className="basic-sub">
                                            <img className="name-img" src={PasswordIcon} style={{ height: "40px", width: "40px" }}></img>
                                            <Typography.Text className="name-text">Password</Typography.Text>
                                            <div className={updatePassword === false ? "basic-sub-button-sm" : "basic-sub-button-hide-sm"
                                            }>
                                                <Button onClick={triggerUpdatePassword} className="change-password-btn-sm">Change Password</Button>
                                            </div>
                                        </div>
                                        <div className={
                                            updatePassword === true ? "edit-password-section-sm" : "edit-password-section-hide-sm"
                                        }>
                                            <div className="change-password-sm" >

                                                <div className="update-password-sm">
                                                    <Typography.Text style={{
                                                        color: "#393939",
                                                        fontSize: "15px",
                                                        fontWeight: "500"
                                                    }}>
                                                        Change Password
                                                    </Typography.Text>
                                                    <button className="close-btn-sm" onClick={triggerUpdatePassword}> <CloseOutlined className="close-icon" /> </button>
                                                    <div className="pass-text-section-sm" >
                                                        <div className="sml-text-sm"></div>
                                                        <Typography.Text className="password-text-sm" >
                                                            Passwords must have at least eight digits with one lowercase character, one uppercase character and one number
                                                        </Typography.Text><br />

                                                    </div>

                                                    <Form name="change-password" onFinish={changePassword} ref={formRef as any}
                                                        onValuesChange={(changedFields, allFields) => {
                                                            if (
                                                                allFields.oldPassword !== "" &&
                                                                allFields.oldPassword !== undefined &&
                                                                allFields.newPassword !== "" &&
                                                                allFields.newPassword !== undefined &&
                                                                allFields.confirmPassword !== "" &&
                                                                allFields.confirmPassword !== undefined
                                                            ) {
                                                                setPasswordDisabled(false);
                                                            } else {
                                                                setPasswordDisabled(true);
                                                            }
                                                        }}
                                                    >
                                                        <Form.Item name="oldPassword">
                                                            <Input disabled={changePasswordService.isLoading} type="password" className="input-Password-section-sm" placeholder="Current Password" />
                                                        </Form.Item>
                                                        <Form.Item name="newPassword"
                                                            rules={[
                                                                { required: true, message: "Please input your password!" },
                                                                {
                                                                    pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,100}$/,
                                                                    min: 8,
                                                                    message: "The password you entered dosen't meet the criteria",
                                                                }
                                                            ]}>
                                                            <Input disabled={changePasswordService.isLoading} type="password" className="input-Password-section-sm" placeholder="New Password" />
                                                        </Form.Item>
                                                        <Form.Item name="confirmPassword"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: "Please re-confirm your password",
                                                                },
                                                                ({ getFieldValue }) => ({
                                                                    validator(rule, value) {
                                                                        if (!value || getFieldValue("newPassword") === value) {
                                                                            return Promise.resolve();
                                                                        }
                                                                        return Promise.reject(
                                                                            new Error(
                                                                                "The two passwords that you entered do not match!"
                                                                            )
                                                                        );
                                                                    },
                                                                }),
                                                            ]}
                                                        >
                                                            <Input disabled={changePasswordService.isLoading} type="password" className="input-Password-section-sm" placeholder="Retype New Password" />
                                                        </Form.Item>
                                                        <Form.Item>
                                                            <div className="update-password-btn-sm">
                                                                <Button className="update-btn-sm" htmlType="submit" disabled={changePasswordService.isLoading || passwordDisabled}>
                                                                    {changePasswordService.isLoading === true ? (
                                                                        <>
                                                                            <LoadingOutlined style={{ marginRight: 5 }} />
                                                                            Updating...
                                                                        </>
                                                                    ) : (
                                                                        "Update Password"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </Form.Item>
                                                    </Form>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={updatePassword === false ? "basic-sub-button" : "basic-sub-button-hide"
                                        }>
                                            <Button onClick={triggerUpdatePassword} className="change-password-btn">Change Password</Button>
                                        </div>
                                        <div className={
                                            updatePassword === true ? "edit-password-section" : "edit-password-section-hide"
                                        }>
                                            <div className="change-password" >
                                                <div className="update-password">
                                                    <Typography.Text style={{
                                                        color: "#393939",
                                                        fontSize: "15px",
                                                        fontWeight: "500"
                                                    }}>
                                                        Change Password
                                                    </Typography.Text>
                                                    <Form name="change-password" onFinish={changePassword} ref={formRef as any}
                                                        onValuesChange={(changedFields, allFields) => {
                                                            if (
                                                                allFields.oldPassword !== "" &&
                                                                allFields.oldPassword !== undefined &&
                                                                allFields.newPassword !== "" &&
                                                                allFields.newPassword !== undefined &&
                                                                allFields.confirmPassword !== "" &&
                                                                allFields.confirmPassword !== undefined
                                                            ) {
                                                                setPasswordDisabled(false);
                                                            } else {
                                                                setPasswordDisabled(true);
                                                            }
                                                        }}
                                                    >
                                                        <Form.Item name="oldPassword">
                                                            <Input disabled={changePasswordService.isLoading} type="password" className="input-Password-section" placeholder="Current Password" />
                                                        </Form.Item>
                                                        <Form.Item name="newPassword"
                                                            rules={[
                                                                { required: true, message: "Please input your password!" },
                                                                {
                                                                    pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,100}$/,
                                                                    min: 8,
                                                                    message: "The password you entered dosen't meet the criteria",
                                                                }
                                                            ]}>
                                                            <Input disabled={changePasswordService.isLoading} type="password" className="input-Password-section" placeholder="New Password" />
                                                        </Form.Item>
                                                        <Form.Item name="confirmPassword"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: "Please retype your password",
                                                                },
                                                                ({ getFieldValue }) => ({
                                                                    validator(rule, value) {
                                                                        if (!value || getFieldValue("newPassword") === value) {
                                                                            return Promise.resolve();
                                                                        }
                                                                        return Promise.reject(
                                                                            new Error(
                                                                                "The two passwords that you entered do not match!"
                                                                            )
                                                                        );
                                                                    },
                                                                }),
                                                            ]}
                                                        >
                                                            <Input disabled={changePasswordService.isLoading} type="password" className="input-Password-section" placeholder="Retype New Password" />
                                                        </Form.Item>
                                                        <Form.Item>
                                                            <div className="update-password-btn">
                                                                <Button className="update-btn" htmlType="submit" disabled={changePasswordService.isLoading || passwordDisabled}>
                                                                    {changePasswordService.isLoading === true ? (
                                                                        <>
                                                                            <LoadingOutlined style={{ marginRight: 5 }} />
                                                                            Updating...
                                                                        </>
                                                                    ) : (
                                                                        "Update Password"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </Form.Item>
                                                    </Form>
                                                </div>
                                                <div className="pass-text-section" >
                                                    <div className="sml-text"></div>
                                                    <Typography.Text className="password-text" >
                                                        Passwords must have at least eight digits with one lowercase character, one uppercase character and one number
                                                    </Typography.Text><br />
                                                </div>
                                                <div><button className="close-btn" onClick={triggerUpdatePassword}> <CloseOutlined className="close-icon" /> </button></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "end" }}><Button type="danger"
                                    onClick={() => {
                                        Modal.confirm({
                                            maskClosable: true,
                                            title: "Logout Confirmation",
                                            content: " Are you sure you want to logout?",
                                            okText: logoutService.isLoading ? "Logging out.." : "Logout",
                                            okButtonProps: { disabled: logoutService.isLoading },
                                            onOk: () => {
                                                localStorage.removeItem('selectedTenant');
                                                logoutUser();
                                            }
                                        });
                                    }}>Logout</Button></div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Fade>
        </>
    );
});