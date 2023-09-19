import React from "react";
import { Frontend, useArkReactServices } from '@skyslit/ark-frontend';
import { useFile } from '@skyslit/ark-frontend/build/dynamics-v2';
import { Input, Row, Col, Button, Tabs, Menu, Grid, Form, Table, Dropdown, Modal, message } from 'antd';
import {
    DeleteOutlined,
    HolderOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { createSchema } from '@skyslit/ark-frontend/build/dynamics-v2';
import "./PropertyEditor.scss"
import type { TabsProps } from 'antd';


export const SettingsSchema = createSchema({
    orgName: "",
})


export function SettingsRenderer() {

    const BasicInformation = ((props) => {

        const file = useFile();

        return (
            <Row className="basic-information-editor-row-wrapper" justify="center">
                <Col span={22} className="basic-information-editor-col-wrapper">
                    <div className="basic-information-editor-wrapper">
                        <div className="heading-wrapper">
                            <span className="heading-text">Basic Information</span>
                        </div>
                        <div className="content-wrapper">
                            <div className="input-wrapper">
                                <label>Business Name:</label>
                                <Input className="input" placeholder="Give a name for this app (Eg: John’s Online Store)"
                                    onChange={(e) => file.cms.updateKey("orgName", e.target.value)}
                                    value={(file.cms.content as any).orgName}
                                />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    })

    const UserInformationOfTenants = ((props) => {
        const { use } = useArkReactServices();
        const { useService, useTableService } = use(Frontend);

        const [failedToAddUserOfTenant, setFailedToAddUserOfTenant] = React.useState(false);
        const [addUserOfTenantModalOpen, setIsAddUserOfTenantModalOpen] = React.useState(false);

        const removeUserOfTenantService = useService({ serviceId: "remove-user-of-tenant-service" });
        const addExistingUserOfTenantService = useService({ serviceId: "cross-check-email-service" });
        const addUserOfTenantService = useService({ serviceId: "add-user-of-tenant-service" });

        const [userForm] = Form.useForm();

        const toggleAddUserOfTenantModal = () => {
            setIsAddUserOfTenantModalOpen(!addUserOfTenantModalOpen)
        }

        const menu = (userId) => (
            <Menu >
                <Menu.Item key="remove" onClick={() => {
                    Modal.confirm({
                        title: "Delete Confirmation",
                        icon: <DeleteOutlined />,
                        content: "Are you sure you want to remove this user?",
                        className: 'custom-confirm-modal-wrapper',
                        okText: "Delete",
                        okType: "danger",
                        maskClosable: true,
                        closable: true,
                        cancelText: "Cancel",
                        onOk: () => {
                            removeUserOfTenantService.invoke(
                                {
                                    userId,
                                    tenantId
                                },
                                { force: true })
                                .then((res) => {
                                    listUsersOfTenant.onChange();
                                })
                                .catch(() => {
                                    message.error("Try again!");
                                })
                        }
                    });
                }}>
                    Remove
                </Menu.Item>
            </Menu>
        );


        const columns = [
            {
                title: 'Sl. No',
                key: 'rollno',
                render: (text, record, index) => index + 1,
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                responsive: ['md'],
            },
            {
                title: 'Action',
                dataIndex: '',
                key: 'x',
                width: 100,
                render: (data) =>
                (
                    <Dropdown overlay={menu(data._id)} trigger={['click']}>
                        <a>
                            <HolderOutlined />
                        </a>
                    </Dropdown>
                )
            },
        ];

        const tenantId = React.useMemo(() => {
            const url = location.pathname;
            const urlParts = url.split('/');
            const tenantsIndex = urlParts.indexOf('tenants');
            if (tenantsIndex !== -1 && tenantsIndex < urlParts.length - 1) {
                return urlParts[tenantsIndex + 1]
            }
        }, [])

        const listUsersOfTenant = useTableService({
            serviceId: `list-users-of-tenant-table-service?tenantId=${tenantId}`,
            columns,
            defaultPageSize: 10,
            disableSelect: true,
        });

        const addExistingUser = (data) => {
            addExistingUserOfTenantService.invoke({
                name: data.name,
                email: data.email,
                tenantId
            }, { force: true })
                .then((res) => {
                    setIsAddUserOfTenantModalOpen(false);
                    userForm.resetFields()
                    listUsersOfTenant.onChange();
                    setFailedToAddUserOfTenant(false);
                })
                .catch((e) => {
                    if (e.message === "Email doesn't exist") {
                        setFailedToAddUserOfTenant(true);
                    } else {
                        message.error(e.message)
                    }
                })
        }

        const addUserOfTenant = (data) => {
            addUserOfTenantService.invoke({
                name: data.name,
                email: data.email,
                password: data.password,
                tenantId
            }, { force: true })
                .then((res) => {
                    toggleAddUserOfTenantModal();
                    userForm.resetFields()
                    listUsersOfTenant.onChange();
                    setFailedToAddUserOfTenant(false);
                })
                .catch(() => {
                })
        }

        const handleFormSubmit = React.useCallback((values: any) => {
            if (failedToAddUserOfTenant) {
                addUserOfTenant(values);
            } else {
                addExistingUser(values);
            }
        }, [addExistingUserOfTenantService.isLoading, failedToAddUserOfTenant]);


        return (
            <Row className="tenant-editor-row-wrapper" justify="center">
                <Col span={22} className="tenant-editor-col-wrapper">
                    <div className="tenant-editor-wrapper">
                        <div className="heading-settings-user-wrapper">
                            <div className="header-text-wrapper">
                                <span className="heading-settings">Settings /</span>
                                <span className="heading-text">Users</span>
                            </div>
                            <div className="heading-button-wrapper" >
                                <Button className="top-add-btn" type="text" onClick={toggleAddUserOfTenantModal}>
                                    Add
                                </Button>
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <Table
                                rowKey={(item) => item._id}
                                dataSource={listUsersOfTenant.dataSource}
                                columns={listUsersOfTenant.columns}
                                onChange={listUsersOfTenant.onChange}
                                loading={listUsersOfTenant.loading}
                                pagination={listUsersOfTenant.pagination} />
                        </div>
                    </div>
                </Col>

                <Modal className="add-user-of-tenant-modal" title="Add User" centered open={addUserOfTenantModalOpen} onCancel={toggleAddUserOfTenantModal}
                    footer={[
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                            <Button type="default" className="cancel-btn" onClick={toggleAddUserOfTenantModal}>
                                Cancel
                            </Button>
                            <Button type="text"
                                className="update-btn"
                                form="create"
                                htmlType="submit"
                                key="submit"
                                disabled={addUserOfTenantService.isLoading || addExistingUserOfTenantService.isLoading}
                            >
                                {addUserOfTenantService.isLoading === true || addExistingUserOfTenantService.isLoading === true ? (
                                    <>
                                        <LoadingOutlined style={{ marginRight: 5 }} />
                                        Adding...
                                    </>
                                ) : (
                                    "Add"
                                )}
                            </Button>
                        </div>
                    ]}
                >
                    <div className="modal-content-wrapper" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <Form
                            name="create"
                            form={userForm}
                            onFinish={handleFormSubmit}
                        >
                            <Form.Item
                                label={<span style={{ fontSize: "14px", fontWeight: "600" }}>Name</span>}
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input name of user!',
                                    },
                                ]}
                            >
                                <Input className="title-input" style={{ borderRadius: "4px" }} placeholder="Enter full name" />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                label={<span style={{ fontSize: "14px", fontWeight: "600" }}>Email</span>}
                                rules={[
                                    {
                                        required: true,
                                        type: 'email',
                                        message: 'The input is not a valid E-mail!',
                                    },
                                ]}
                            >
                                <Input disabled={failedToAddUserOfTenant} style={{ borderRadius: "4px" }} placeholder="Enter User mail ID" />
                            </Form.Item>
                            {failedToAddUserOfTenant ? (
                                <>
                                    <Form.Item
                                        name="password"
                                        label={<span style={{ fontSize: "14px", fontWeight: "600" }}>Password</span>}
                                        rules={[
                                            { required: true, message: "Please input your password!" },
                                            {
                                                min: 8,
                                                message: "The password you entered dosen't meet the criteria",
                                            }
                                        ]}
                                        hasFeedback
                                    >
                                        <Input.Password
                                            style={{ borderRadius: "4px" }}
                                            placeholder="Enter a strong password" />
                                    </Form.Item>
                                    <Form.Item
                                        name="confirmPassword"
                                        dependencies={['password']}
                                        label={<span style={{ fontSize: "14px", fontWeight: "600" }}>Confirm Password</span>}
                                        hasFeedback
                                        rules={[
                                            { required: true, message: "Confirm new password" },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('The new password that you entered do not match!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            style={{ borderRadius: "4px" }}
                                            placeholder="Confirm Password" />
                                    </Form.Item>
                                </>
                            ) : null}
                        </Form>
                    </div>
                </Modal>
            </Row >
        )
    })

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `Basic Information`,
            children: <BasicInformation />
        },
        {
            key: '2',
            label: `Users`,
            children: <UserInformationOfTenants />
        }
    ];

    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const tabPosition = screens.md ? 'left' : 'top';

    return (
        <Row className="property-editor-row-wrapper">
            <Col span={24} className="property-editor-col-wrapper">
                <Tabs className="tab-wrapper" defaultActiveKey="2" tabPosition={tabPosition} items={items} />
            </Col>
        </Row>
    );
}