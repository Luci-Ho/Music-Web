import React, { useEffect, useState } from 'react';
import { Card, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import UsersTable from '../component/UserTable';
import { getUsers } from '../api/db';

export default function UsersView() {
    const [users, setUsers] = useState([]);
    
    useEffect(() => { 
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const u = await getUsers(); 
        setUsers(u);
    };

    const handleAddUser = () => {
        // TODO: Implement add user functionality
        console.log('Add user clicked');
    };

    const handleUserUpdate = () => {
        // Reload users after update
        loadUsers();
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2>Users Management</h2>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddUser}
                >
                    Add User
                </Button>
            </div>
            <Card>
                <UsersTable users={users} onUserUpdate={handleUserUpdate} />
            </Card>
        </section>
    );
}