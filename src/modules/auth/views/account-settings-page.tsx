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

    if (showAllGroupsService && listUserDetailsService.isLoading) {
        return (
            <div
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
            <Fade duration={700}>
                <div className="account-settings-layout">
                    <div className="content-wrapper">
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
                                    <div className="basic-info-name-section">
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
                                    </div>

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
                                            <button className="edit-btn" onClick={triggerEditEmail}><img className="edit-img" src={EditIcon}></img></button>
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
                                {isSuperAdmin ? (
                                    <Collapse>
                                        <Panel key="1" header={`Users (${forUserCount.length})`}
                                            extra={genExtra()}
                                        >
                                            <Table dataSource={listAllUsers.dataSource} columns={columns} onChange={listAllUsers.onChange} pagination={false} />
                                            <div className="seeAll-text">
                                                <Link to="/app/users/all" className="seeAll-button" >See All</Link>
                                            </div>
                                        </Panel>
                                    </Collapse >
                                ) : (null)}
                                <Collapse>
                                    <Panel key="1" header={`Groups (${items.length})`} extra={genExtra1()}>
                                        <Table dataSource={listAllGroups.dataSource} columns={columns1} onChange={listAllGroups.onChange} pagination={false} />
                                        <div className="seeAll-groups">
                                            <Link to="/app/groups/all" className="seeAllGroupLink">See All</Link>
                                        </div>
                                    </Panel>
                                </Collapse>
                                <Modal title="New Group"
                                    width={570}
                                    open={isModalOpen}
                                    onCancel={handleCancel}
                                    footer={null}
                                    centered
                                    className="new-group-modal">
                                    <Form layout="vertical" onFinish={addGroup} ref={groupRef as any} name="group"
                                        onValuesChange={(changedFields, allFields) => {
                                            if (
                                                allFields.groupTitle !== "" &&
                                                allFields.groupTitle !== undefined,
                                                allFields.description !== "" &&
                                                allFields.description !== undefined
                                            ) {
                                                setGroupTitleDisabled(false);
                                            } else {
                                                setGroupTitleDisabled(true);
                                            }
                                        }}
                                    >
                                        <Form.Item className="group-title-form-item"
                                            label="Group title"
                                            name="groupTitle"
                                        >
                                            <Input className="title-input" placeholder="Title" />
                                        </Form.Item>
                                        <div style={{ color: "red", marginBottom: 15, transition: "color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)" }} >
                                            {addGroupService.err ? addGroupService.err.message : ""}
                                        </div>
                                        <Form.Item
                                            label="Description"
                                            name="description"
                                        >
                                            <TextArea
                                                showCount
                                                maxLength={122}
                                                style={{ height: 182, resize: 'none' }}
                                                placeholder="The purpose of this group"
                                                className="description-input"
                                            />
                                        </Form.Item>
                                        <div style={{ display: "flex", justifyContent: "end", marginTop: 60 }}>
                                            <Form.Item>
                                                <Button className="create-btn" htmlType="submit" disabled={addGroupService.isLoading || groupTitleDisabled}>
                                                    {addGroupService.isLoading === true ? (
                                                        <>
                                                            <LoadingOutlined style={{ marginRight: 5 }} />
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        "Create"
                                                    )}</Button>
                                            </Form.Item></div>
                                    </Form>
                                </Modal>

                                <Modal title="New User"
                                    width={570}
                                    open={isUserModalOpen}
                                    onCancel={userCancel}
                                    footer={null}
                                    centered
                                    className="new-user-modal">
                                    <Form layout="vertical" ref={userRef as any} onFinish={addNewUser} name="user">
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
                                                <Input className="title-input" placeholder="johndoe@example.com" />
                                            </Form.Item>
                                            <div style={{ color: "red", marginBottom: 15, transition: "color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)" }} >
                                                {addNewUserService.err ? addNewUserService.err.message : ""}
                                            </div>
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
                                            <><p style={{ color: "#717171", fontSize: 12 }}>Password should have at least 8 characters including one uppercase character, one lowercase character & one number</p></>
                                            <Checkbox style={{ paddingBottom: 10, fontSize: 13 }} checked={isTenantIdAvailable} onChange={() => { setIsTenantIdAvailable(!isTenantIdAvailable) }}>Is this account for a tenant?</Checkbox>
                                            <Form.Item>
                                                {isTenantIdAvailable ? (
                                                    <>
                                                        <label style={{ fontSize: 13 }}>Tenant ID</label>
                                                        <Input
                                                            onChange={(e) => { setTenantId(e.target.value) }}
                                                            className="title-input"
                                                            style={{ marginTop: 7 }}
                                                            placeholder="Enter organisation name"
                                                        />
                                                        {availabilityCheckService?.response?.data === false ? (
                                                            <div style={{ color: "red", marginBottom: 15, transition: "color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)" }}>
                                                                Tenant ID already taken
                                                            </div>
                                                        ) : null}
                                                    </>
                                                ) : null}
                                            </Form.Item>
                                        </div>
                                        <Divider />
                                        <div style={{ padding: "0 28px", textAlign: "center" }}>
                                            <span style={{ marginBottom: 14, color: "#0F0F0F", fontSize: 12, fontWeight: 500 }}>Assign to group</span>
                                            <Form.Item
                                                style={{ marginTop: 14 }}
                                                name="groupId"
                                            >
                                                <Select
                                                    placeholder="Select groups"
                                                    mode="multiple"
                                                    showArrow
                                                    style={{ width: '100%' }}
                                                    filterOption={(input, option) =>
                                                        (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                                                    }
                                                >
                                                    {items.map((item, index) => (
                                                        <Option value={item._id} key={index}>
                                                            {item.groupTitle}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "end",
                                            padding: "0 28px",
                                            marginTop: 40,
                                            paddingBottom: 10
                                        }}>
                                            <Form.Item
                                            >
                                                <Button className="create-btn" htmlType="submit" disabled={addNewUserService.isLoading || availabilityCheckService?.response?.data === false && isTenantIdAvailable}>
                                                    {addNewUserService.isLoading === true ? (
                                                        <>
                                                            <LoadingOutlined style={{ marginRight: 5 }} />
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        "Create"
                                                    )}
                                                </Button>
                                            </Form.Item></div>
                                    </Form>
                                </Modal>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Fade>
        </>
    );
});