import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { authService } from '../services/auth.service';

import AuthHeader from '../components/UserAccess/AuthHeader';
import InputField from '../components/UserAccess/InputField';
import SubmitButton from '../components/UserAccess/SubmitButton';
import AuthForm from '../components/UserAccess/AuthForm';
import '../style/LoginAndSignUp.css';
import use10Clicks from '../hooks/use10Clicks';
import AdminLogin from './AdminLogin';

const logoImage = "https://res.cloudinary.com/da4y5zf5k/image/upload/v1751044695/logo-no-background_1_z7njh8.png";
// const API_URL = 'http://localhost:4000/users';

const Login = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const location = useLocation();
    const redirectTo = location.state?.redirectTo || '/';

    // Nhấp Liên Tục Kích Hoạt Admin
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const onTenClick = use10Clicks(() => {
        setShowAdminLogin(true);
        toast.info('Chào Admin! Vui lòng nhập mã để đăng nhập.');
    }, { threshold: 10, resetMs: 800 });

    // Mở modal admin nếu được điều hướng với state.openAdmin
    useEffect(() => {
        if (location.state?.openAdmin) {
            setShowAdminLogin(true);
        }
    }, [location.state]);

    // const handleSubmit = async (values) => {
    //     const { email, password } = values;
    //     console.log("Form đã submit:", values);

    //     // Kiểm tra định dạng email và mật khẩu
    //     if (!/\S+@\S+\.\S+/.test(email)) {
    //         toast.error('Email không hợp lệ!');
    //         return;
    //     }
    //     if (!password) {
    //         toast.error('Vui lòng nhập mật khẩu!');
    //         return;
    //     }

    //     try {
    //         const res = await fetch(API_URL);
    //         const allUsers = await res.json();

    //         // Tìm người dùng theo email
    //         const user = allUsers.find(u => u.email === email);

    //         if (!user) {
    //             toast.error('Email này chưa đăng ký tài khoản!');
    //             return;
    //         }

    //         if (user.password !== password) {
    //             toast.error('Mật khẩu không đúng!');
    //             return;
    //         }

    //         // ✅ Đăng nhập thành công
    //         toast.success('Chào mừng bạn đến với Melodies!');
    //         localStorage.setItem('user', JSON.stringify(user));
    //         navigate(redirectTo);

    //     } catch (err) {
    //         toast.error('Lỗi kết nối đến server!');
    //         console.error(err);
    //     }
    // };
    const handleSubmit = async (values) => {
        const { email, password } = values;

        // Validate cơ bản
        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error('Email không hợp lệ!');
            return;
        }

        if (!password) {
            toast.error('Vui lòng nhập mật khẩu!');
            return;
        }

        try {
            // 🔥 GỌI BACKEND
            const res = await authService.login({
                email,
                password,
            });

            const { accessToken, user } = res.data;

            // 🔐 LƯU TOKEN & USER
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success('Chào mừng bạn đến với Melodies!');
            navigate(redirectTo);

        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Đăng nhập thất bại!'
            );
        }
    };


    return (
        <div className="login-container">
            <div className="login-background">
                <LeftOutlined className="back-icon" onClick={() => navigate(-1)} />
                <div className="login-header">
                    <img src={logoImage} alt="Melodies Logo" className="logo-image" />
                    <h2 className="logo-text">Melodies</h2>
                </div>

                <AuthHeader title="Login To Continue" />

                <AuthForm form={form} onFinish={handleSubmit}>
                    <InputField
                        label="E-Mail"
                        name="email"
                        type="email"
                        form={form} />

                    <InputField
                        label="Password"
                        name="password"
                        type="password"
                        form={form} />

                    <div className="submit">
                        <div className="forgot-password">Forgot password &gt;</div>
                        <SubmitButton text="Login" htmlType="submit" onClick={onTenClick} />
                    </div>
                </AuthForm>

                {showAdminLogin && <AdminLogin onClose={() => setShowAdminLogin(false)} />}

                <div className="social-login">
                    <button className="google-login">
                        <img src="https://res.cloudinary.com/da4y5zf5k/image/upload/v1751041194/devicon_google_be5zib.png" alt="Google" />
                        Google
                    </button>

                    <button className="facebook-login">
                        <img src="https://res.cloudinary.com/da4y5zf5k/image/upload/v1751041193/logos_facebook_tyae02.png" alt="Facebook" />
                        Facebook
                    </button>
                </div>

                <div className="signup-row">
                    <div className="signup-text">
                        <p>Don't have an account?</p>
                        <p className="signup-link" onClick={() => navigate('/signup')}>Sign Up Here</p>
                    </div>
                    <button className="signup-button" onClick={() => navigate('/signup')}>Sign Up</button>
                </div>
            </div>
        </div>
    );
};

export default Login;
