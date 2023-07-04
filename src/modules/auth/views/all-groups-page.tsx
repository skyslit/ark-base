import React from "react";
import { createComponent, Frontend } from "@skyslit/ark-frontend";
import '../styles/all-groups-page.scss';
import { Col, Row, Button, Table, Modal, Form, Input, Select, message } from "antd";
import SearchIcon from "../images/search.png"
import UserIcon from "../images/user-male-icon .png"
import { ArrowLeftOutlined, PlusOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import Fade from "react-reveal/Fade";
import { Helmet } from "react-helmet-async";

export default createComponent((props) => {
    const { TextArea } = Input;
    const { Option } = Select;
    const [searchText, setSearchText] = React.useState("");
    const [groupTitleDisabled, setGroupTitleDisabled] = React.useState(true);
    const [groups, setGroups] = React.useState([])

    const columns = [
        {
            title: 'Group Title',
            dataIndex: 'groupTitle',
            key: 'groupTitle',
            filterDropdown: ({ selectedKeys, setSelectedKeys, confirm }) => {
                return (
                    <div style={{ padding: 8 }}>
                        <Input
                            placeholder="Search group title"
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
                return (
                    <>
                        <Link className="allGroupsTable-name" to={`/app/groups/${(row as any)._id}`} style={{ color: "black" }}>
                            {user ? user : <span style={{ fontStyle: "italic", color: "red" }}>Untitled*</span>}
                        </Link>
                    </>
                )
            }
        },
        {
            title: 'No. of members',
            dataIndex: 'count',
            key: 'count',
            render: (count, row: any) => {
                return (
                    <>
                        <span>{count > 0 ? count : 0}</span>
                    </>
                )
            }
        },
    ];

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const [showSearch, setShowSearch] = React.useState(false);

    const triggerSearch = () => {
        setShowSearch(!showSearch)
    }

    const formRef = React.useRef();

    const { useService, useTableService, useContext } = props.use(Frontend);
    const context = useContext();
    const addGroupService = useService({ serviceId: "add-new-group" });

    const addGroup = (data: any) => {
        addGroupService.invoke({
            groupTitle: data.groupTitle,
            description: data.description
        }, { force: true })
            .then((res) => {
                (formRef.current as any).resetFields();
                setIsModalOpen(false)
                listAllGroups.onChange()
            })
            .catch((e) => {
            })
    }

    const listAllGroups = useTableService({
        serviceId: `list-all-groups`,
        columns,
        disableSelect: true,
    });


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

    const inputTagRef = React.useRef(null);

    React.useEffect(() => {
        if (inputTagRef.current) {
            inputTagRef.current.focus();
        }
    }, [inputTagRef.current]);

    return (
        <>
            <Helmet>
                <title> Groups | Account </title>
            </Helmet>
            <Fade duration={700}>
                <div className="all-groups-page-layout">
                    <Row justify="center">
                        <Col className="all-groups-main" span={22}>
                            <div className="back-button-div">
                                <Link className="groups-back-btn" to={"/app/users"}>
                                    <ArrowLeftOutlined />
                                    <span className="back-btn-text">Back to Dashboard</span>
                                </Link>
                            </div>
                            <div className="add-button-div">
                                {/*  <button className={
                            showSearch === false ? "searchicon" : "searchicon-hide"
                        } onClick={triggerSearch}>
                            <img src={SearchIcon} />
                        </button> */}
                                <Input
                                    value={searchText}
                                    placeholder="Search title"
                                    onChange={(e) => {
                                        setSearchText(e.target.value)
                                    }} className={
                                        showSearch === true ? "search-input" : "search-input-hide"
                                    }
                                    ref={inputTagRef}
                                />
                                <button className={
                                    showSearch === true ? "close-btn" : "close-btn-hide"
                                } onClick={triggerSearch}><CloseOutlined /></button>
                                {
                                    isSuperAdmin === true ? (
                                        <button className="add-button" onClick={showModal}><PlusOutlined className="plus-icon" />
                                            <span className="add-grp-text">Add Group</span>
                                        </button>
                                    ) : null}
                            </div>
                        </Col>
                        <Col span={22}>
                            <h2 className="all-group-title" >{`All Groups (${listAllGroups.dataSource.length})`}</h2>
                            <Table dataSource={listAllGroups.dataSource}
                                columns={columns}
                                onChange={listAllGroups.onChange}
                                pagination={false}
                                scroll={{ x: 240 }}
                                className="group-table" />
                        </Col>
                        <Modal title="New Group"
                            width={570}
                            open={isModalOpen}
                            onCancel={handleCancel}
                            footer={null}
                            centered
                            className="new-group-modal">
                            <Form layout="vertical" name="group" onFinish={addGroup} ref={formRef as any}
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
                                    <Form.Item
                                    >
                                        <Button className="create-btn" htmlType="submit" disabled={addGroupService.isLoading || groupTitleDisabled}>
                                            {addGroupService.isLoading === true ? (
                                                <>
                                                    <LoadingOutlined style={{ marginRight: 5 }} />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Create"
                                            )}
                                        </Button>
                                    </Form.Item>
                                </div>
                            </Form>
                        </Modal>
                    </Row>
                </div>
            </Fade>
        </>
    );
});