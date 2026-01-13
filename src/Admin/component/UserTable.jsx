import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Select, message } from 'antd';
import { useAuth } from '../context/AuthContext';

export default function UsersTable({ users, onUserUpdate }) {
    const { canManageUsers } = useAuth();
    const [levels, setLevels] = useState([]);
    const [updating, setUpdating] = useState({});
    
    // Fetch levels from API
    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            const response = await fetch('http://localhost:5000/levels');
            const levelsData = await response.json();
            setLevels(levelsData);
        } catch (error) {
            console.error('Error fetching levels:', error);
        }
    };

    // Map level to role name and color using API data
    const getLevelRole = (levelId) => {
        const level = levels.find(l => l.id === levelId);
        if (!level) return { text: 'Unknown', color: 'gray' };
        
        switch (level.name) {
            case 'Admin': return { text: 'Admin', color: 'red' };
            case 'Moderator': return { text: 'Moderator', color: 'orange' };
            case 'User': return { text: 'User', color: 'blue' };
            default: return { text: level.name, color: 'gray' };
        }
    };

    // Check if current user is admin (assuming we get this from context or props)
    const isCurrentUserAdmin = () => {
        return canManageUsers();
    };

    // Handle promotion (level change)
    const handlePromotion = async (userId, newLevelId) => {
        setUpdating(prev => ({ ...prev, [userId]: true }));
        
        try {
            const response = await fetch(`http://localhost:5000/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ level: newLevelId })
            });

            if (response.ok) {
                message.success('User level updated successfully!');
                if (onUserUpdate) onUserUpdate();
            } else {
                message.error('Failed to update user level');
            }
        } catch (error) {
            console.error('Error updating user level:', error);
            message.error('Error updating user level');
        } finally {
            setUpdating(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Get action buttons based on user level and permissions
    const getActionButtons = (record) => {
        const isAdmin = isCurrentUserAdmin();
        
        return (
            <Space>
                <Button size="small" type="primary">View</Button>
                {isAdmin && (
                    <Select
                        size="small"
                        value={record.level}
                        style={{ width: 100 }}
                        onChange={(value) => handlePromotion(record.id, value)}
                        loading={updating[record.id]}
                        placeholder="Promote"
                    >
                        {levels.map(level => (
                            <Select.Option key={level.id} value={level.id}>
                                {level.name}
                            </Select.Option>
                        ))}
                    </Select>
                )}
                {isAdmin && record.level !== 'l1' && (
                    <Button 
                        size="small" 
                        danger
                        loading={updating[record.id]}
                    >
                        Delete
                    </Button>
                )}
            </Space>
        );
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Username', dataIndex: 'username' },
        { title: 'Email', dataIndex: 'email' },
        { 
            title: 'Role', 
            dataIndex: 'level',
            render: (level) => {
                const roleInfo = getLevelRole(level);
                return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
            }
        },
        {
            title: 'Action', 
            render: (_, record) => getActionButtons(record),
            width: 250
        }
    ];

    return <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 8 }} />;
}