import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/user-details-page.scss';
import NameLogo from "../images/name-icon.png"
import MailIcon from "../images/mail-icon.png"
import PasswordIcon from "../images/password-icon.png"
import DeleteIcon from "../images/delete-icon.png";
import EditIcon from "../images/edit-icon.png"
import { useParams, useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import Fade from "react-reveal/Fade";
import { Helmet } from "react-helmet-async";
import { Col, Row, Typography, Button, Modal, Form, Input, message, Select, Menu, Dropdown } from "antd";
import { ArrowLeftOutlined, EditOutlined, CloseOutlined, LoadingOutlined, CheckOutlined, MoreOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export default createComponent((props) => {
    const { useService, useContext, useTableService } = props.use(Frontend);
    const params = useParams();
    const history = useHistory()
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [updatePassword, setUpdatePassword] = React.useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [accountDetails, setAccountDetails] = React.useState(null);
    const [groupDetails, setGroupDetails] = React.useState([]);
    const [editName, setEditName] = React.useState(false);
    const [showEditEmail, setShowEditEmail] = React.useState(false);

    const { Option } = Select;
    const formRef = React.useRef();
    const context = useContext();
    const [form] = Form.useForm();

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const showAssignModal = () => {
        setIsAssignModalOpen(true);
    };
    const handleAssignCancel = () => {
        setIsAssignModalOpen(false);
    };

    const triggerUpdatePassword = () => {
        setUpdatePassword(!updatePassword)
    }
    const triggerEditName = () => {
        setEditName(!editName)
    }
    const triggerEditEmail = () => {
        setShowEditEmail(!showEditEmail)
    }

    const updateDashboardAccessService = useService({ serviceId: "update-dashboard-access" });
    const deleteUserService = useService({ serviceId: "delete-user-service" });
    const deleteUser = () => {
        const userId = (params as any).id;
        deleteUserService.invoke(
            {
                userId,
            },
            { force: true })
            .then((res) => {
                setIsModalOpen(false)
                history.push("/app/users/all")
            })
            .catch(() => {
                message.error("Failed to delete user")
            })
    }

    const assignGroupService = useService({ serviceId: "assign-group-to-user" });
    const assignGroup = (data) => {
        const userId = (params as any).id;
        assignGroupService.invoke({
            userId,
            groupId: data.groupId
        },
            { force: true })
            .then((res) => {
                setIsAssignModalOpen(false);
                listAccountDetails()
            })
            .catch((e) => {
                message.error(e.message)
            })
    }

    const showAllGroupsService = useService({ serviceId: "assign-group" });
    const showAllGroups = () => {
        showAllGroupsService.invoke({}, { force: true })
            .then((res) => {
                setItems(res.data);
            })
            .catch(() => {
            })
    }

    const changePasswordService = useService({ serviceId: "change-user-password" });
    const updateUserPassword = (data) => {
        const accountId = (params as any).id;
        changePasswordService.invoke({
            password: data.newPassword,
            accountId
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

    const listAccountDetailsService = useService({ serviceId: "get-user-by-id" });
    const listAccountDetails = () => {
        const userId = (params as any).id;
        listAccountDetailsService.invoke({
            userId
        }, { force: true })
            .then((res) => {
                setAccountDetails(res.data[0])
            })
            .catch(() => {
                message.error("error")

            })
    }

    const updateNameService = useService({ serviceId: "update-name-service" });
    const updateName = (data) => {
        // const userId = context.response.meta.currentUser._id;
        const userId = (params as any).id;
        updateNameService.invoke({
            userId,
            name: data.name
        }, { force: true })
            .then((res) => {
                listAccountDetails()
                setEditName(false)
                window.location.reload()
            })
            .catch(() => {

            })
    }

    const listGroupDetailsService = useService({ serviceId: "get-group-by-id" });
    const getGroupDetails = React.useMemo(() => {
        listGroupDetailsService.invoke({
            groupId: accountDetails?.groupId
        }, { force: true })
            .then((res) => {
                setGroupDetails(res.data[0])
            })
            .catch(() => {
                message.error("error")

            })
    }, [accountDetails]);

    const [groups, setGroups] = React.useState([])

    const allGroupsService = useService({ serviceId: "list-group-service" });
    const allGroups = () => {
        allGroupsService
            .invoke()
            .then((res) => {
                setGroups(res.data)
            })
    };
    const getGroupIds = React.useMemo(() => {
        return groups?.find((g) =>
            g.groupTitle === "SUPER_ADMIN"
        );
    }, [groups]);

    const isSuperAdmin = context.response.meta.currentUser.groupId.includes(getGroupIds?._id);

    React.useEffect(() => {
        allGroups()
    }, []);


    React.useEffect(() => {
        form.setFieldsValue({
            name: accountDetails ? accountDetails.name : "",
        });
    }, [accountDetails]);

    React.useEffect(() => {
        showAllGroups();
        listAccountDetails();
        getGroupDetails;
    }, []);

    const haveAccess = React.useMemo(() => {
        if (accountDetails) {
            return Boolean(accountDetails.haveDashboardAccess)
        } else {
            return false
        }
    }, [accountDetails])

    const menu = (
        <Menu>
            <Menu.Item>
                <Button type="text"
                    onClick={() => {
                        Modal.confirm({
                            title: "Confirmation",
                            icon: <QuestionCircleOutlined />,
                            content: haveAccess
                                ? "Do you want to take away this user's dashboard access?"
                                : "Do you want to grant this user access to the dashboard?",
                            className: 'custom-confirm-modal-wrapper',
                            okText: updateDashboardAccessService.isLoading ? "Please wait..." : haveAccess ? "Remove access" : "Give access",
                            okType: haveAccess ? "danger" : "primary",
                            maskClosable: true,
                            closable: true,
                            cancelText: "Cancel",
                            okButtonProps: { disabled: updateDashboardAccessService.isLoading },
                            onOk: () => {
                                return updateDashboardAccessService.invoke(
                                    {
                                        userId: accountDetails._id,
                                        haveAccess: !haveAccess
                                    },
                                    { force: true })
                                    .then((res) => {
                                        listAccountDetails()
                                    })
                                    .catch(() => {
                                        message.error("Try again!");
                                    })
                            }
                        });
                    }}
                >
                    {haveAccess ? (
                        <span>Remove dashboard access</span>
                    ) : <span>Give access to dashbooard</span>}
                </Button>
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            {accountDetails ? (
                <Helmet>
                    <title>
                        {`${accountDetails.name || accountDetails.email} | Groups`}
                    </title>
                </Helmet>
            ) : null}
            <div className="user-details-layout">
                <Fade duration={700}>
                    <Row style={{ background: "#F8F8F8" }} justify="center">
                        <Col span={22} className="user-details-col" >
                            <div className="user-details-wrapper">
                                <div className="top-section">
                                    <div className="back-btn-section">
                                        <Link to="/app/users" className="back-btn">
                                            <ArrowLeftOutlined style={{ color: "black" }} />
                                            <Typography.Text className="all-users-text"> All Users / </Typography.Text>
                                            <Typography.Text className="user-details-text"> User Details</Typography.Text>
                                        </Link>
                                    </div>
                                    {
                                        isSuperAdmin === true ? (
                                            <div style={{ display: "flex" }}>
                                                <button className="assign-group-bttn" onClick={showAssignModal} >
                                                    <CheckOutlined className="assign-icon" />
                                                    <span className="assign-text"> Assign Group</span>
                                                </button>
                                                <button disabled={(params as any).id === context.response.meta.currentUser._id} className="delete-button" onClick={showModal}>
                                                    <img src={DeleteIcon} />
                                                    <Typography.Text className="delete-text"> Delete user </Typography.Text>
                                                </button>
                                                <Dropdown overlay={menu} trigger={["click"]}>
                                                    <button disabled={(params as any).id === context.response.meta.currentUser._id} className="assign-group-bttn">
                                                        <Typography.Text className="delete-text"><MoreOutlined /></Typography.Text>
                                                    </button>
                                                </Dropdown>
                                            </div>
                                        ) : null
                                    }
                                </div>
                                <div className="user-name-section">
                                    <Typography.Text className="name-text" >{accountDetails?.name || accountDetails?.email}</Typography.Text>
                                    <br />
                                    {accountDetails?.name ? (
                                        <><Typography.Text className="mail-id-text">{accountDetails?.email}</Typography.Text><br /></>
                                    ) : null}
                                    {haveAccess ? (
                                        <Typography.Text className="mail-id-text">This user has dashboard access permission.</Typography.Text>
                                    ) : (
                                        <Typography.Text className="mail-id-text">This user has no dashboard access permission.</Typography.Text>
                                    )}
                                </div>
                                <div className="user-information-box">
                                    <div><Typography.Text style={{ fontWeight: "500" }}>
                                        Basic Information
                                    </Typography.Text></div>
                                    <div className="basic-info-name-section">
                                        <div className="basic-sub">
                                            <img className="name-img" src={NameLogo} style={{ width: 40, height: 40 }}></img>
                                            <Typography.Text className="name-text">Name</Typography.Text>
                                        </div>
                                        <div className={
                                            editName === false ? "basic-sub2" : "basic-sub2-hide"
                                        }>
                                            <Typography.Text className="accountName">
                                                {accountDetails ? accountDetails.name : ""}
                                            </Typography.Text>
                                            {
                                                isSuperAdmin === true ? (
                                                    <button className="edit-btn"><img className="edit-img" src={EditIcon} onClick={triggerEditName}></img></button>
                                                ) : null}
                                        </div>
                                        <div className={
                                            editName === true ? "edit-name-section" : "edit-name-section-hide"
                                        }>
                                            <Form name="name" onFinish={updateName} form={form}>
                                                <Form.Item name="name" >
                                                    <Input className="input-section" />
                                                </Form.Item>
                                            </Form>
                                            <div style={{ width: "60%", display: "flex", justifyContent: "end", marginTop: 18 }}>
                                                <button className="save-btn" form="name" htmlType="submit" disabled={updateNameService.isLoading}>
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
                                        <div className={
                                            editName === true ? "edit-name-section-sm" : "edit-name-section-hide-sm"
                                        }>
                                            <Form name="name" onFinish={updateName} form={form} >
                                                <Form.Item name="name" >
                                                    <Input className="input-section-sm" />
                                                </Form.Item>

                                            </Form>
                                            <div style={{ display: "flex", justifyContent: "end", marginTop: 18 }}>
                                                <button className="save-btn-sm" form="name" htmlType="submit" >
                                                    Save
                                                </button></div>
                                            <button className="close-btn-sm" onClick={triggerEditName}> <CloseOutlined className="close-icon" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="basic-info-email-section">
                                        <div className="basic-sub">
                                            <img className="name-img" src={MailIcon} style={{ width: 40, height: 40 }}></img>
                                            <Typography.Text className="name-text">Email</Typography.Text>
                                        </div>
                                        <div className={
                                            showEditEmail === false ? "basic-sub2" : "basic-sub2-hide"
                                        }>
                                            <Typography.Text className="accountEmail">
                                                {accountDetails?.email}
                                            </Typography.Text>
                                        </div>

                                        <div className={
                                            showEditEmail === true ? "edit-email-section" : "edit-email-section-hide"
                                        }>
                                            <div>
                                                <Typography.Text className="email-description">
                                                    A verification code will be sent to the new email address
                                                </Typography.Text><br />
                                                <Input className="input-section" />
                                            </div>
                                            <div style={{ width: "60%", display: "flex", justifyContent: "end", marginTop: 18 }}>
                                                <button className="send-verfication-btn">
                                                    Send verification</button></div>
                                            <button className="close-btn" onClick={triggerEditEmail}> <CloseOutlined className="close-icon" /> </button>
                                        </div>
                                    </div>
                                    <div className="basic-password">
                                        <div className="basic-sub">
                                            <div><img className="name-img" src={PasswordIcon}></img></div>
                                            <Typography.Text className="name-text">Password</Typography.Text>
                                        </div>
                                        <div className={
                                            updatePassword === true ? "edit-password-section-sm" : "edit-password-section-hide-sm"
                                        }>
                                            <div className="change-password" >
                                                <div className="update-password">
                                                    <div>
                                                        <Typography.Text style={{
                                                            color: "#393939",
                                                            fontSize: "15px",
                                                            fontWeight: "500"
                                                        }}>
                                                            Change Password
                                                        </Typography.Text>
                                                    </div>
                                                    <button className="close-btn" onClick={triggerUpdatePassword}> <CloseOutlined className="close-icon" /> </button>
                                                    <div className="pass-text-section" >
                                                        <div className="sml-text"></div>
                                                        <Typography.Text className="password-text" >
                                                            Passwords must have at least eight digits with one lowercase character, one uppercase character and one number
                                                        </Typography.Text><br />
                                                    </div>
                                                    <Form name="change-password" onFinish={updateUserPassword} ref={formRef as any}>
                                                        <Form.Item name="newPassword"
                                                            rules={[
                                                                { required: true, message: "Please input your password!" },
                                                                {
                                                                    pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,100}$/,
                                                                    min: 8,
                                                                    message: "The password you entered dosen't meet the criteria",
                                                                }
                                                            ]}>
                                                            <Input type="password" className="input-Password-section" placeholder="New Password" />
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
                                                            <Input type="password" className="input-Password-section" placeholder="Retype New Password" />
                                                        </Form.Item>
                                                        <Form.Item>
                                                            <div className="update-password-btn">
                                                                <Button htmlType="submit" className="update-btn" disabled={changePasswordService.isLoading}>
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
                                        {
                                            isSuperAdmin === true ? (
                                                <div className={updatePassword === false ? "basic-sub-button" : "basic-sub-button-hide"
                                                }>
                                                    <Button onClick={triggerUpdatePassword}>Change Password</Button>
                                                </div>
                                            ) : null}
                                        <div className={
                                            updatePassword === true ? "edit-password-section" : "edit-password-section-hide"
                                        }>
                                            <div className="change-password" >
                                                <div className="update-password">
                                                    <div style={{ paddingBottom: 20, paddingTop: 2 }}>
                                                        <Typography.Text style={{
                                                            color: "#393939",
                                                            fontSize: "15px",
                                                            fontWeight: "500"
                                                        }}>
                                                            Change Password
                                                        </Typography.Text>
                                                    </div>
                                                    <Form name="change-password" onFinish={updateUserPassword} ref={formRef as any}>
                                                        <Form.Item name="newPassword"
                                                            rules={[
                                                                { required: true, message: "Please input your password!" },
                                                                {
                                                                    pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,100}$/,
                                                                    min: 8,
                                                                    message: "The password you entered dosen't meet the criteria",
                                                                }
                                                            ]}>
                                                            <Input type="password" className="input-Password-section" placeholder="New Password" />
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
                                                            <Input type="password" className="input-Password-section" placeholder="Retype New Password" />
                                                        </Form.Item>
                                                        <Form.Item>
                                                            <div className="update-password-btn">
                                                                <Button htmlType="submit" className="update-btn" disabled={changePasswordService.isLoading} >
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
                                <div className="group-inf-box">
                                    <div><Typography.Text style={{ fontWeight: "500" }}>
                                        In Groups:
                                    </Typography.Text></div>
                                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                                        {groupDetails.map((group, index) => {
                                            return (
                                                <div key={index} className="group-name-div">
                                                    <Typography.Text className="name-text">{group.groupTitle}</Typography.Text>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <Modal
                                className="delete-user-modal"
                                footer={null}
                                width={400}
                                centered
                                open={isModalOpen}
                                onCancel={handleCancel}
                            >
                                <div className="delete-wrapper">
                                    <div className="delete-confirm-section">
                                        <span style={{ color: "black", fontSize: 14, fontWeight: 500 }}>
                                            Confirm Delete
                                        </span>
                                        <br />
                                        <span style={{ color: "#8F959D", fontSize: 14 }}>
                                            {`Do you want to delete ${accountDetails?.name} ?`}
                                        </span>
                                    </div>
                                    <div className="delete-btn-section">
                                        <button className="delete-btn"
                                            onClick={deleteUser}
                                            disabled={deleteUserService.isLoading}>
                                            {deleteUserService.isLoading === true ? (
                                                <span>
                                                    <LoadingOutlined style={{ marginRight: 5 }} />
                                                    Deleting...
                                                </span>
                                            ) : (
                                                "Delete"
                                            )}
                                        </button>
                                        <button className="cancel-btn" onClick={handleCancel}>
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </div>
                            </Modal>
                            <Modal
                                title="Add Group"
                                className="assign-group-modal"
                                footer={null}
                                width={570}
                                centered
                                open={isAssignModalOpen}
                                onCancel={handleAssignCancel}
                            >
                                <Form onFinish={assignGroup} layout="vertical">
                                    <div style={{ padding: "0 28px", textAlign: "center" }}>
                                        <span style={{ marginBottom: 14, color: "#0F0F0F", fontSize: 14, fontWeight: 500 }}>Assign Groups</span>
                                        <Form.Item
                                            style={{ marginTop: 14 }}
                                            name="groupId"
                                        >
                                            <Select
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
                                        padding: "26px 28px 0px 28px",
                                    }}>
                                        <Form.Item>
                                            <Button htmlType="submit" className="create-btn"
                                                disabled={assignGroupService.isLoading}>
                                                {assignGroupService.isLoading === true ? (
                                                    <span>
                                                        <LoadingOutlined style={{ marginRight: 5 }} />
                                                        Adding Group...
                                                    </span>
                                                ) : (
                                                    "Add Group"
                                                )}
                                            </Button>
                                        </Form.Item>
                                    </div>
                                </Form>
                            </Modal>
                        </Col>
                    </Row>
                </Fade>
            </div>
        </>
    );
});