import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/group-details-page.scss';
import { Col, Row, Typography, Table, Modal, Input, message, Form } from "antd";
import { ArrowLeftOutlined, LoadingOutlined, CheckOutlined } from '@ant-design/icons';
import UserIcon from "../images/user-male-icon .png"
import DeleteIcon from "../images/delete-icon.png";
import RemoveIcon from "../images/remove-icon.png";
import PencilIcon from "../images/3671689_edit_pencil_icon.png";
import { Link } from "react-router-dom";
import { useParams, useHistory } from "react-router-dom";
import { UserInfo } from "../../auth/components/user-info";
import Fade from "react-reveal/Fade";
import { Helmet } from "react-helmet-async";

export default createComponent((props) => {
    const { useService, useContext, useTableService } = props.use(Frontend);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editText, setEditText] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [idToDelete, setIdToDelete] = React.useState("");
    const [showGroup, setShowGroup] = React.useState([])
    const [groupTitle, setGroupTitle] = React.useState()
    const [description, setDescription] = React.useState()

    const params = useParams();
    const groupId = (params as any).id;
    const [form] = Form.useForm();
    const history = useHistory();

    const showDeleteModal = () => {
        setIsDeleteModalOpen(true);
    };
    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const showModal = (id) => {
        setIdToDelete(id);
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const columns = [
        {
            title: 'Name',
            dataSource: "userId",
            key: "userId",
            render: (user) => {
                return (
                    <>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <img className="user-icon" src={UserIcon} />
                            <UserInfo userId={user.userId} />
                        </div>
                    </>
                )
            }
        },
        {
            title: '',
            key: 'remove',
            render: (user) =>
                isSuperAdmin === true ? (
                    <>
                        <button className="remove-btn" onClick={() => showModal((user).userId)} ><img src={RemoveIcon} /></button>
                    </>
                ) : null
        },
    ];

    const triggerEditText = () => {
        setEditText(!editText)
    }

    const deleteGroupService = useService({ serviceId: "delete-group" });
    const deleteGroup = () => {
        deleteGroupService.invoke(
            {
                groupId
            },
            { force: true })
            .then((res) => {
                message.success("Group deleted")
                setIsDeleteModalOpen(false);
                history.push("/app/groups/all");
            })
            .catch(() => {
                message.error("Failed to delete Group")
            })
    }

    const listAllUsers = useTableService({
        serviceId: `list-group-details?groupId=${groupId}`,
        columns,
    });

    const removeMemberService = useService({ serviceId: "remove-member-service" });
    const removeMember = () => {
        removeMemberService.invoke(
            {
                groupId: groupId,
                userId: idToDelete,
            },
            { force: true })
            .then((res) => {
                message.success("Member removed!")
                setIsModalOpen(false);
                listAllUsers.onChange();
                groupDetails();
            })
            .catch(() => {
                message.error("Try again!");
            })
    };

    const groupDetailsService = useService({ serviceId: "group-details" });
    const groupDetails = () => {
        groupDetailsService.invoke(
            {
                groupId,
            },
            { force: true })
            .then((res) => {
                setShowGroup(res.data[0])
            })
            .catch(() => {
                message.error("Try again!");
            })
    };

    const updateGroupService = useService({ serviceId: "update-group-service" });
    const updateGroupDetails = (data) => {
        updateGroupService.invoke({
            groupId,
            groupTitle,
            description

        }, { force: true })
            .then((res) => {
                message.success("Group details updated")
                setEditText(false);
                groupDetails()
                setUpdateGroup(false);
            })
            .catch(() => {

            })
    }
    const [groups, setGroups] = React.useState([])
    const context = useContext();
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
        groupDetails();
    }, []);

    React.useEffect(() => {
        form.setFieldsValue({
            groupTitle: showGroup ? showGroup.groupTitle : "",
            description: showGroup ? showGroup.description : "",
        });
    }, [showGroup]);

    return (
        <>
            <Helmet>
                {`${showGroup ? showGroup.groupTitle : ""} | Groups`}
            </Helmet>
            <div className="group-details-layout">
                <Row style={{ background: "#F8F8F8" }} justify="center">
                    <Col span={22} className="admin-details-main">
                        <Fade duration={700}>
                            <div className="header-section">
                                <div className="back-btn-section">
                                    <Link to={"/app/groups/all"} className="back-btn-grp-details">
                                        <ArrowLeftOutlined style={{ color: "black" }} />
                                        <span className="all-groups-text"> All Groups / </span>
                                        <span className="group-details-text"> Group Details</span>
                                    </Link>
                                </div>
                                <div style={{ display: "flex" }}>
                                    {
                                        isSuperAdmin === true ? (
                                            <button onClick={showDeleteModal} className={
                                                editText === false ? "delete-btn" : "delete-btn-hide"}>
                                                <img src={DeleteIcon} />
                                                <Typography.Text className="delete-text"> Delete group </Typography.Text>
                                            </button>
                                        ) : null}
                                    {editText === false ? (
                                        isSuperAdmin === true ? (
                                            <button className="edit-btn" onClick={triggerEditText}>
                                                <img src={PencilIcon} />
                                                <span className="edit-group-text" > Edit group </span>
                                            </button>
                                        ) : null) :
                                        <button className="update-btn" onClick={updateGroupDetails} disabled={updateGroupService.isLoading}>
                                            {updateGroupService.isLoading === true ? (
                                                <span style={{ fontSize: 14, color: "green", fontWeight: 500 }}>
                                                    <LoadingOutlined style={{ marginRight: 5 }} />
                                                    Updating group
                                                </span>
                                            ) : (
                                                <>
                                                    <CheckOutlined style={{ color: "green" }} />
                                                    <span className="edit-group-text" > Update group </span>
                                                </>
                                            )}
                                        </button>}
                                </div>
                            </div>

                            <div>
                                {editText === false ? (
                                    <span className="group-title"
                                    >{showGroup ? showGroup.groupTitle : ""}</span>
                                ) :
                                    <Input className="edit-group-title" defaultValue={showGroup.groupTitle} onChange={(e) => {
                                        setGroupTitle(e.target.value)
                                    }}
                                    />
                                }<br />
                                <span className="member-text">{showGroup ? showGroup.count : ""} Member(s)</span>
                            </div>
                            <div className="description-area">
                                <div style={{ color: "#222222", fontSize: 14, marginBottom: 10, fontWeight: 500 }}><span >Description</span></div>
                                {editText === false ? (
                                    <Typography.Text style={{ color: "#393939", fontSize: 14 }}>
                                        {showGroup ? showGroup.description : ""}
                                    </Typography.Text>
                                ) :
                                    <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} className="edit-description"
                                        defaultValue={showGroup.description} onChange={(e) => {
                                            setDescription(e.target.value)
                                        }} />}

                            </div>
                            <div className="table-section">
                                <div style={{ color: "#222222", fontSize: 14, fontWeight: 500 }}><span>Members</span></div>
                                <Table dataSource={listAllUsers.dataSource} columns={columns} pagination={false} className="member-table"
                                    loading={listAllUsers.loading}
                                />
                                <Modal
                                    className="remove-modal"
                                    footer={null}
                                    width={400}
                                    centered
                                    open={isModalOpen}
                                    onCancel={handleCancel}
                                >
                                    <div className="remove-wrapper">
                                        <div className="remove-confirm-section">
                                            <span style={{ color: "black", fontSize: 14, fontWeight: 500 }}>
                                                Confirm Remove
                                            </span>
                                            <br />
                                            <span style={{ color: "#8F959D", fontSize: 14 }}>
                                                Do you want to Remove this Member?
                                            </span>
                                        </div>
                                        <div className="remove-btn-section">
                                            <button onClick={removeMember} className="remove-btn"
                                                disabled={removeMemberService.isLoading} >
                                                {removeMemberService.isLoading === true ? (
                                                    <span>
                                                        <LoadingOutlined style={{ marginRight: 5 }} />
                                                        Removing Member
                                                    </span>
                                                ) : (
                                                    "Remove"
                                                )}
                                            </button>
                                            <button className="cancel-btn" onClick={handleCancel}>
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    </div>
                                </Modal>
                                <Modal
                                    className="delete-group-modal"
                                    footer={null}
                                    width={400}
                                    centered
                                    open={isDeleteModalOpen}
                                    onCancel={handleDeleteCancel}
                                >
                                    <div className="delete-wrapper">
                                        <div className="delete-confirm-section">
                                            <span style={{ color: "black", fontSize: 14, fontWeight: 500 }}>
                                                Confirm delete
                                            </span>
                                            <br />
                                            <span style={{ color: "#8F959D", fontSize: 14 }}>
                                                Do you want to delete this Group?
                                            </span>
                                        </div>
                                        <div className="delete-btn-section">
                                            <Link to="/app/groups/all" className="delete-btn" onClick={deleteGroup}
                                                disabled={deleteGroupService.isLoading}>
                                                {deleteGroupService.isLoading === true ? (
                                                    <span>
                                                        <LoadingOutlined style={{ marginRight: 5 }} />
                                                        Deleting...
                                                    </span>
                                                ) : (
                                                    "Delete"
                                                )}
                                            </Link>
                                            <button className="cancel-btn" onClick={handleDeleteCancel}>
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    </div>
                                </Modal>
                            </div>
                        </Fade>
                    </Col>
                </Row>
            </div>
        </>
    );
});