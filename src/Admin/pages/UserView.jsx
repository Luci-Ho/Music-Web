import React, { useEffect, useState } from "react";
import { Card, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import UsersTable from "../component/UserTable";
import { adminGetUsers } from "../api/admin.user.api";

// normalize mongoose doc -> plain object
function normalizeUsers(res) {
  const arr =
    Array.isArray(res) ? res :
    Array.isArray(res?.data) ? res.data :
    Array.isArray(res?.users) ? res.users :
    [];

  return arr.map((u) => {
    const plain = u?._doc ? { ...u._doc, _id: u._id } : u;
    return {
      _id: plain._id,
      username: plain.username || "",
      email: plain.email || "",
      phone: plain.phone || "",
      role: plain.role || "user",
    };
  });
}

export default function UsersView() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await adminGetUsers();
    const list = normalizeUsers(res);
    console.log("[UsersView] res =", res);
    console.log("[UsersView] list =", list);
    setUsers(list);
  };

  const handleAddUser = () => {
    console.log("Add user clicked");
  };

  const handleUserUpdate = () => loadUsers();

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2>Users Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
          Add User
        </Button>
      </div>

      <Card>
        <UsersTable users={users} onUserUpdate={handleUserUpdate} />
      </Card>
    </section>
  );
}
