import React, { useState } from "react";
import { Table, Space, Button, Tag, Select, message } from "antd";
import { useAuth } from "../context/AuthContext";
import { adminUpdateUser } from "../api/admin.user.api";

export default function UsersTable({ users = [], onUserUpdate }) {
  const { canManageUsers } = useAuth();
  const [updating, setUpdating] = useState({});

  const roleTag = (role) => {
    switch (role) {
      case "admin": return <Tag color="red">Admin</Tag>;
      case "moderator": return <Tag color="orange">Moderator</Tag>;
      default: return <Tag color="blue">User</Tag>;
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating((p) => ({ ...p, [userId]: true }));
    try {
      await adminUpdateUser(userId, { role: newRole });
      message.success("User role updated!");
      onUserUpdate?.();
    } catch (e) {
      console.error(e);
      message.error("Failed to update user role");
    } finally {
      setUpdating((p) => ({ ...p, [userId]: false }));
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      width: 140,
      render: (id) => (
        <span style={{ fontFamily: "monospace" }} title={id}>
          {id ? String(id).slice(-8) : "—"}
        </span>
      ),
    },
    { title: "Username", dataIndex: "username" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => roleTag(role),
    },
    {
      title: "Action",
      width: 260,
      render: (_, record) => (
        <Space>
          <Button size="small" type="primary">View</Button>

          {canManageUsers() && (
            <Select
              size="small"
              value={record.role}
              style={{ width: 130 }}
              onChange={(value) => handleRoleChange(record._id, value)}
              loading={!!updating[record._id]}
            >
              <Select.Option value="admin">admin</Select.Option>
              <Select.Option value="moderator">moderator</Select.Option>
              <Select.Option value="user">user</Select.Option>
            </Select>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={Array.isArray(users) ? users : []}
      rowKey={(r) => r._id}
      pagination={{ pageSize: 8 }}
    />
  );
}
