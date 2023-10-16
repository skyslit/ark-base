import React from "react";
import { createComponent, Frontend, useArkReactServices } from "@skyslit/ark-frontend";
import { useFile } from '@skyslit/ark-frontend/build/dynamics-v2';
import { useCatalogueItemPicker, generateFileLink } from '@skyslit/ark-frontend/build/dynamics-v2/widgets/catalogue';
import { Input, Row, Col, Button, Tabs, Select, Menu, Grid, Form, Divider } from 'antd';
import { Space, Table, Tag, Dropdown, Modal, message } from 'antd';
import Placeholder from "./assets/images/placeholder.jpg";
import { createSchema } from '@skyslit/ark-frontend/build/dynamics-v2';
import "./PropertyEditor.scss";
import type { TabsProps } from 'antd';
import { useState, useEffect } from 'react';
import { useParams, useHistory } from "react-router-dom";
import {
    HolderOutlined,
    LoadingOutlined,
    DeleteOutlined
} from '@ant-design/icons';

export const PropertySchema = createSchema({
    orgName: "",
    shopLogoPath: "",
    shopAddress: "",
    description: "",
    phoneNumber: "",
    email: "",
    availableSlots: [""],
    marketinglogo: "",
})

export function PropertyRenderer() {
    const ArkServices = useArkReactServices();

    const BasicInformation = ((props) => {
        const picker = useCatalogueItemPicker();
        const file:any = useFile();

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
                                <Input className="input" placeholder="Give a name for this app"
                                    onChange={(e) => file.cms.updateKey("orgName", e.target.value)}
                                    value={(file.cms.content as any).orgName}
                                />
                            </div>
                            {/* <div className="input-wrapper">
                                <label>Available slots</label>
                                <Select className="select" mode="tags" value={(file.cms.content as any).availableSlots} onChange={(e) => file.cms.updateKey('availableSlots', e)} />
                            </div> */}
                            <div className="input-wrapper">
                                <label>Address</label>
                                <Input className="input"
                                    placeholder="Enter your address"
                                    value={file.cms.content.shopAddress} onChange={(e) => file.cms.updateKey('shopAddress', e.target.value)} />
                            </div>
                            <div className="input-wrapper">
                                <label>Phone Number</label>
                                <Input className="input" type="number"
                                    placeholder="Enter your phone number"
                                    value={file.cms.content.phoneNumber} onChange={(e) => file.cms.updateKey('phoneNumber', e.target.value)} />
                            </div>
                            <div className="input-wrapper">
                                <label>Marketing Email ID</label>
                                <Input className="input"
                                    placeholder="Enter your marketing email ID"
                                    value={file.cms.content.email} onChange={(e) => file.cms.updateKey('email', e.target.value)} />
                            </div>
                            <div className="input-wrapper">
                                <label>Description</label>
                                <Input.TextArea className="description" value={file.cms.content.description}
                                    onChange={(e) => file.cms.updateKey('description', e.target.value)} />
                            </div>
                            <div className="input-wrapper">
                                {/*  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <label>Logo</label>
                                    <div className="whole-logo-image">
                                        {(file.cms.content as any).shopLogoPath ? (
                                            <img
                                                className="image-wrapper"
                                                src={generateFileLink((file.cms.content as any).shopLogoPath)} />
                                        ) : (
                                            <img
                                                className="image-wrapper"
                                                src={Placeholder} />
                                        )}
                                        {(file.cms.content as any).shopLogoPath ? (
                                            <Button className="delete-btn" onClick={() => file.cms.updateKey('shopLogoPath', '')}>Delete Image</Button>
                                        ) : (
                                            <Button
                                                className="upload-btn"
                                                onClick={() => {
                                                    picker.chooseItems().then((result) => {
                                                        file.cms.updateKey('shopLogoPath', result.items[0].path);
                                                    });
                                                }}
                                            >
                                                Upload Image
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="text-wrapper">
                                    <span className="recomnd-text">Recommended Size: 70 x 70 px</span>
                                    <span className="recomnd-text">Maximum size: 2 MB </span>
                                </div> */}


                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <label>Marketing logo</label>
                                    <div className="whole-logo-image">
                                        {(file.cms.content as any).marketinglogo ? (
                                            <img
                                                className="image-wrapper"
                                                src={generateFileLink((file.cms.content as any).marketinglogo)} />
                                        ) : (
                                            <img
                                                className="image-wrapper"
                                                src={Placeholder} />
                                        )}
                                        {(file.cms.content as any).marketinglogo ? (
                                            <Button className="delete-btn" onClick={() => file.cms.updateKey('marketinglogo', '')}>Delete Image</Button>
                                        ) : (
                                            <Button
                                                className="upload-btn"
                                                onClick={() => {
                                                    picker.chooseItems({ initialPath: "/uploads" }).then((result) => {
                                                        file.cms.updateKey('marketinglogo', result.items[0].path);
                                                    });
                                                }}
                                            >
                                                Upload Image
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="text-wrapper">
                                    <span className="recomnd-text">Recommended Size: 70 x 70 px</span>
                                    <span className="recomnd-text">Maximum size: 2 MB </span>
                                </div>

                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    })

    const TenantsInformation = ((props) => {

        const { use } = useArkReactServices();
        const { useService, useTableService } = use(Frontend);
        const [isTenantIdAvailable, setIsTenantIdAvailable] = React.useState(false);
        const [tenantId, setTenantId] = React.useState("");
        const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);

        const availabilityCheckService = useService({ serviceId: "availability-check-of-tenantId" });
        const addTenantService = useService({ serviceId: "add-user" });
        const listAllGroupsService = useService({ serviceId: "assign-group" });
        const deleteTenantService = useService({ serviceId: "delete-user-service" });

        const [tenantForm] = Form.useForm();

        const showAddUserModal = () => {
            setIsUserModalOpen(true);
        };

        const userCancel = () => {
            setIsUserModalOpen(false);
        };

        const disabledState = React.useMemo(() => {
            return (
                addTenantService.isLoading ||
                availabilityCheckService?.response?.data === false ||
                tenantId === ""
            );
        }, [addTenantService.isLoading, availabilityCheckService?.response?.data, tenantId]);

        const menu = (userId) => (
            <Menu >
                <Menu.Item key="remove" onClick={() => {
                    Modal.confirm({
                        title: "Delete Confirmation",
                        icon: <DeleteOutlined />,
                        content: "Are you sure you want to remove this tenant?",
                        className: 'custom-confirm-modal-wrapper',
                        okText: "Delete",
                        okType: "danger",
                        maskClosable: true,
                        closable: true,
                        cancelText: "Cancel",
                        onOk: () => {
                            deleteTenantService.invoke(
                                {
                                    userId: userId,
                                },
                                { force: true })
                                .then((res) => {
                                    listTenants.onChange();
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
                key: 'rollno',
                title: 'Sl No:',
                render: (text, record, index) => index + 1,
            },
            {
                key: 'name',
                title: 'Name',
                dataIndex: 'name',
            },
            {
                key: 'email',
                title: 'Email',
                dataIndex: 'email',
                responsive: ['md'],
            },
            {
                key: 'tenantId',
                title: 'Tenant ID',
                dataIndex: 'tenantId',
                responsive: ['md'],
            },
            {
                key: 'x',
                title: 'Action',
                dataIndex: '',
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


        React.useEffect(() => {
            listAllGroupsService.invoke({}, { force: true })
                .then((res) => {
                })
                .catch(() => {
                })
        }, []);

        const hasGroupsLoaded = React.useMemo(() => {
            return listAllGroupsService.hasInitialized === true && listAllGroupsService.isLoading === false
        }, [listAllGroupsService.hasInitialized, listAllGroupsService.isLoading,]);

        const groups = React.useMemo(() => {
            if (hasGroupsLoaded === true) {
                return listAllGroupsService.response.data;
            }
            return [];
        }, [hasGroupsLoaded, listAllGroupsService.response,]);

        const adminGroup: any = React.useMemo(() => {
            return groups.find(group => group.groupTitle === 'ADMIN');
        }, [groups]);

        const initialValues = {
            groupId: adminGroup ? [adminGroup._id] : undefined
        };


        React.useEffect(() => {
            if (tenantId) {
                availabilityCheckService.invoke({
                    tenantId: tenantId
                }, { force: true })
                    .then((res) => {

                    })
                    .catch(() => {

                    })
            }
        }, [tenantId])

        const addNewTenant = (data) => {
            addTenantService.invoke({
                name: data.name,
                email: data.email,
                password: data.password,
                tenantId: tenantId,
                groupId: data.groupId
            }, { force: true })
                .then((res) => {
                    setIsUserModalOpen(false);
                    tenantForm.resetFields()
                    listTenants.onChange();
                    // setIsTenantIdAvailable(false);
                    setTenantId("")

                })
                .catch((e) => {
                })
        }

        const listTenants = useTableService({
            serviceId: "list-all-tenants",
            defaultPageSize: 10,
            columns,
            disableSelect: true,
        });


        return (
            <Row className="tenant-editor-row-wrapper" justify="center">
                <Col span={22} className="tenant-editor-col-wrapper">
                    <div className="tenant-editor-wrapper">
                        <div className="heading-settings-user-wrapper">
                            <div className="header-text-wrapper">
                                <span className="heading-settings">Settings /</span>
                                <span className="heading-text">Tenants</span>
                            </div>
                            <div className="heading-button-wrapper" >
                                <Button className="top-add-btn" type="text" onClick={showAddUserModal}>
                                    Add
                                </Button>
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <Table
                                rowKey={(item) => item._id}
                                dataSource={listTenants.dataSource}
                                columns={listTenants.columns}
                                onChange={listTenants.onChange}
                                loading={listTenants.loading}
                                pagination={listTenants.pagination}
                            />
                        </div>
                    </div>
                </Col>
                <Modal title="New Tenant"
                    width={570}
                    open={isUserModalOpen}
                    onCancel={userCancel}
                    footer={null}
                    centered
                    className="new-user-modal">
                    <Form layout="vertical" onFinish={addNewTenant} name="user" form={tenantForm} initialValues={initialValues}>
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
                                {addTenantService.err ? addTenantService.err.message : ""}
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
                            <Form.Item
                            >
                                <label style={{ fontSize: 12 }}>Tenant ID</label>
                                <Input
                                    onChange={(e) => { setTenantId(e.target.value) }}
                                    value={tenantId}
                                    className="title-input"
                                    style={{ marginTop: 7 }}
                                    placeholder="Enter organisation name"
                                />
                                {availabilityCheckService?.response?.data === false ? (
                                    <div style={{ color: "#960018", marginBottom: 15, transition: "color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)" }}>
                                        Tenant ID already taken
                                    </div>
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
                                    options={groups.map((item: any) => ({ label: item.groupTitle, value: item._id }))}
                                />
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
                                <Button className="create-btn" htmlType="submit" disabled={disabledState}>
                                    {addTenantService.isLoading === true ? (
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
            </Row >
        )
    })

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `Basic Information`,
            children: <BasicInformation />
        },
        // {
        //     key: '2',
        //     label: `Tenants`,
        //     children: <TenantsInformation />
        // },
        // {
        //     key: '3',
        //     label: `Enrolled Users`,
        //     children: <EnrolledUsersInformation />
        // }
    ];

    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const tabPosition = screens.md ? 'left' : 'top';

    return (
        <Row className="property-editor-row-wrapper">
            <Col span={24} className="property-editor-col-wrapper">
                <Tabs className="tab-wrapper" defaultActiveKey="1" tabPosition={tabPosition} items={items} />
            </Col>
        </Row>
    );
}