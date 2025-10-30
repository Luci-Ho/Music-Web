import React from 'react';
import { Table, Space, Button } from 'antd';


export default function UsersTable({ users }) {
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Role', dataIndex: 'role' },
        { title: 'Joined', dataIndex: 'joined' },
        {
            title: 'Action', render: () => (
                <Space>
                    <Button size="small">View</Button>
                    <Button size="small">Promote</Button>
                </Space>
            )
        }
    ];
    return <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 8 }} />;
}