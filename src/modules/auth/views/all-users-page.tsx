import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/all-users-page.scss';
import { Col, Row, Button, Table, Input, Modal, Form, Divider, Select, message } from "antd";
import SearchIcon from "../images/search.png"
import UserIcon from "../images/user-male-icon .png"
import { ArrowLeftOutlined, PlusOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { GroupInfo } from "../../auth/components/group-info";
import { Link } from "react-router-dom";
import Fade from "react-reveal/Fade";
import { Helmet } from "react-helmet-async";

export default createComponent((props) => {
    const { Option } = Select;
    const formRef = React.useRef();
    const [searchText, setSearchText] = React.useState("");
    const [groups, setGroups] = React.useState([])

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [items, setItems] = React.useState([]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: "name",
            filterDropdown: ({ selectedKeys, setSelectedKeys, confirm }) => {
                return (
                    <div style={{ padding: 8 }}>
                        <Input
                            placeholder="Search Name"
                            value={selectedKeys[0]}
                            onChange={(e) =>
                                setSelectedKeys(e.target.value ? [e.target.value] : [])
                            }
                            onPressEnter={confirm}
                            style={{ width: 188, marginBottom: 8, display: "block" }}
                        />
                    </div>
                );
            },
            render: (user: any, row: any) => {
                console.log("data",row)
                return (
                    <>
                        <Link className="allUserstable-name" to={`/app/users/${(row as any)._id}`} style={{ color: "black" }}>{user || row.email}</Link>
                    </>
                )
            }
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
    const { useService, useTableService, useContext } = props.use(Frontend);
    const context = useContext();

    const listAllUsers = useTableService({
        serviceId: `list-all-users`,
        columns,
        disableSelect: true,
    });

    const showAllGroupsService = useService({ serviceId: "assign-group" });
    const showAllGroups = () => {
        showAllGroupsService.invoke({}, { force: true })
            .then((res) => {
                setItems(res.data);
            })
            .catch(() => {
            })
    }

    const [showSearch, setShowSearch] = React.useState(false);

    const triggerSearch = () => {
        setShowSearch(!showSearch)
    }

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const addNewUserService = useService({ serviceId: "add-user" });

    const addNewUser = (data) => {
        addNewUserService.invoke({
            name: data.name,
            email: data.email,
            password: data.password,
            groupId: data.groupId
        }, { force: true })
            .then((res) => {
                (formRef.current as any).resetFields();
                setIsModalOpen(false);
                listAllUsers.onChange()
            })
            .catch((e) => {
            })
    }
    const inputTagRef = React.useRef(null);

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

    React.useEffect(() => {
        allGroups()
    }, []);

    const isSuperAdmin = context.response.meta.currentUser.groupId.includes(getGroupIds?._id);

    React.useEffect(() => {
        if (inputTagRef.current) {
            inputTagRef.current.focus();
        }
    }, [inputTagRef.current]);

    React.useEffect(() => {
        showAllGroups();
    }, []);

    return (
        <>
            <Helmet>
                <title> Users | Account </title>
            </Helmet>
            <Fade duration={700}>
                <div className="all-users-page-layout">
                    <Row style={{ paddingBottom: 50 }} justify="center">
                        <Col className="all-users-main" span={22}>
                            <div className="back-button-div">
                                <Link to={"/app/users"} className="back-btn">
                                    <ArrowLeftOutlined />
                                    <span className="back-btn-text">Back to Dashboard</span>
                                </Link>
                            </div>
                            <div className="add-button-div">
                                {/* <button className={
                            showSearch === false ? "searchicon" : "searchicon-hide"
                        } onClick={triggerSearch}>
                            <img src={SearchIcon} />
                        </button> */}
                                <Input
                                    value={searchText}
                                    placeholder="Search name"
                                    onChange={(e) => {
                                        setSearchText(e.target.value)
                                    }}
                                    className={
                                        showSearch === true ? "search-input" : "search-input-hide"
                                    }
                                    ref={inputTagRef}
                                />
                                <button className={
                                    showSearch === true ? "close-btn" : "close-btn-hide"
                                } onClick={triggerSearch}>
                                    <CloseOutlined /> </button>
                                {
                                    isSuperAdmin === true ? (
                                        <button className="add-button" onClick={showModal}><PlusOutlined className="plus-icon" />
                                            <span className="add-grp-text">Add user</span>
                                        </button>
                                    ) : null}
                                <Modal title="New User"
                                    width={570}
                                    open={isModalOpen}
                                    onCancel={handleCancel}
                                    footer={null}
                                    centered
                                    className="new-user-modal">
                                    <Form layout="vertical" name="user" onFinish={addNewUser} ref={formRef as any}>
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
                                        </div>
                                        <Divider />
                                        <div style={{ padding: "0 28px", textAlign: "center" }}>
                                            <span style={{ marginBottom: 14, color: "#0F0F0F", fontSize: 12, fontWeight: 500 }}>Assign to group</span>
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
                                            padding: "0 28px",
                                            marginTop: 40,
                                            paddingBottom: 10
                                        }}>
                                            <Form.Item>
                                                <Button className="create-btn" htmlType="submit" disabled={addNewUserService.isLoading}>
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
                            </div>
                        </Col>
                        <Col span={22} >
                            <h2 className="all-users-title" >{`All Users (${listAllUsers.dataSource.length})`}</h2>
                            <Table
                                dataSource={listAllUsers.dataSource}
                                columns={columns} onChange={listAllUsers.onChange}
                                pagination={false}
                                loading={listAllUsers.loading}
                                scroll={{ x: 240 }}
                                className="users-table" />
                        </Col>
                    </Row>
                </div>
            </Fade>
        </>
    );
});