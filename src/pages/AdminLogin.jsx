import React from "react";
import { Modal, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import '../style/LoginAndSignUp.css';
import { useNavigate } from "react-router-dom";

export default function AdminLogin({ visible = true, onClose }) {
    const [form] = Form.useForm();
    const API_URL = 'http://localhost:5000/users';
    const navigate = useNavigate();

    const checkAdmin = async (code) => {
        try {
            const res = await fetch(API_URL);
            const allUsers = await res.json();
            const adminUser = allUsers.find(user => user.level === 'l1' && user.phone === code);

            if (adminUser) {
                localStorage.setItem('adminuser', JSON.stringify(adminUser));
                toast.success('Chào mừng Admin!');
            } else {
                toast.error('Mã admin không hợp lệ');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Không thể xác minh mã admin');
        }
    };

    return (

        <Modal open={visible} title="Admin Login" onCancel={() => { form.resetFields(); onClose && onClose(); }} onOk={() => checkAdmin(form.getFieldValue('code')) && navigate('/admin')} okText="Login">
            <Form form={form} layout="vertical">
                <Form.Item name="code" label="Admin Code" rules={[{ required: true, message: 'Please enter admin code' }]}>
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    );
}
