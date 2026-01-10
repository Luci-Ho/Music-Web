import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

import InputField from '../components/UserAccess/InputField';
import SubmitButton from '../components/UserAccess/SubmitButton';
import AuthForm from '../components/UserAccess/AuthForm';
import '../style/LoginAndSignUp.css';

const logoImage = "https://res.cloudinary.com/da4y5zf5k/image/upload/v1751044695/logo-no-background_1_z7njh8.png";
// const backIcon = "https://res.cloudinary.com/da4y5zf5k/image/upload/v1751041190/ooui_next-ltr_np1svd.png";
const API_URL = 'http://localhost:4000/users';

const SignUp = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        const { username, email, password, phone } = values;
        console.log("Dữ liệu form:", values); // 👈 kiểm tra đầu vào
        setLoading(true);

        try {
            // Kiểm tra email đã tồn tại chưa
            const checkRes = await fetch(API_URL);
            const allUsers = await checkRes.json();
            const emailExists = allUsers.some(user => user.email === email);

            if (emailExists) {
                alert('Email này đã được sử dụng!');
                setLoading(false);
                return;
            }


            // Gửi dữ liệu đăng ký với favorites và playlists mặc định
            const newUser = {
                username, 
                email, 
                password, 
                phone,
                level: 'l3', // User level mặc định
                favorites: [],
                playlists: [
                    {
                        id: `${Date.now()}_1`,
                        name: "Yêu thích của tôi",
                        songs: []
                    }
                ]
            };

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            console.log("Kết quả trả về từ API:", res);

            if (!res.ok) {
                console.error("API trả về lỗi:", res.status);
                throw new Error('Đăng ký thất bại');
            }

            const result = await res.json();
            console.log("Kết quả trả về từ API:", result);

            toast.success('Tạo tài khoản thành công!');
            navigate('/login', { state: { redirectTo: '/' } });
        } catch (err) {
            toast.error(`Lỗi: ${err.message}`);
        }


        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-background">
                {/* <img
                        src={backIcon}
                        alt="Back"
                        className="back-icon"
                        onClick={() => navigate(-1)}
                    /> */}
                <LeftOutlined className="back-icon" onClick={() => navigate(-1)} />
                <div className="login-header">
                    <img src={logoImage} alt="Melodies Logo" className="logo-image" />
                    <h2 className="logo-text">Melodies</h2>
                </div>

                <div className="auth-header">
                    <h2 className="auth-title">Sign Up To Join</h2>
                </div>

                <AuthForm form={form} onFinish={handleSubmit}>
                    <InputField label="User name" name="username" type="text" form={form} />
                    <InputField label="E-Mail" name="email" type="email" form={form} />
                    <InputField label="Password" name="password" type="password" form={form} />
                    <InputField label="Phone Number" name="phone" type="text" form={form} />
                    <div className="submit-button-wrapper">
                        <SubmitButton
                            text={loading ? "Sign Up" : "Sign Up"}
                            disabled={loading}
                        />
                    </div>

                </AuthForm>
            </div>
        </div>
    );
};

export default SignUp;
