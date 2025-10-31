import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form } from 'antd';

import AuthHeader from '../components/UserAccess/AuthHeader';
import InputField from '../components/UserAccess/InputField';
import SubmitButton from '../components/UserAccess/SubmitButton';
import AuthForm from '../components/UserAccess/AuthForm';
import '../style/LoginAndSignUp.css';

const logoImage = "https://res.cloudinary.com/da4y5zf5k/image/upload/v1751044695/logo-no-background_1_z7njh8.png";
const API_URL = 'http://localhost:4000/users';

const Login = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const location = useLocation();
    const redirectTo = location.state?.redirectTo || '/';

    const handleSubmit = async (values) => {
  const { email, password } = values;
  console.log("Form đã submit:", values);

  // Kiểm tra định dạng email và mật khẩu
  if (!/\S+@\S+\.\S+/.test(email)) {
    toast.error('Email không hợp lệ!');
    return;
  }
  if (!password) {
    toast.error('Vui lòng nhập mật khẩu!');
    return;
  }

  try {
    const res = await fetch(API_URL);
    const allUsers = await res.json();

    // Tìm người dùng theo email
    const user = allUsers.find(u => u.email === email);

    if (!user) {
      toast.error('Email này chưa đăng ký tài khoản!');
      return;
    }

    if (user.password !== password) {
      toast.error('Mật khẩu không đúng!');
      return;
    }

    // ✅ Đăng nhập thành công
    toast.success('Chào mừng bạn đến với Melodies!');
    localStorage.setItem('user', JSON.stringify(user));
    navigate(redirectTo);

  } catch (err) {
    toast.error('Lỗi kết nối đến server!');
    console.error(err);
  }
};


    return (
        <div className="login-container">
            <div className="login-background">
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
                        <SubmitButton text="Login" htmlType="submit" />
                    </div>
                </AuthForm>

                <div className="social-login">
                    <button className="google-login">
                        <img src="https://res.cloudinary.com/da4y5zf5k/image/upload/v1751041194/devicon_google_be5zib.png" alt="Google" />
                        Google Login
                    </button>

                    <button className="facebook-login">
                        <img src="https://res.cloudinary.com/da4y5zf5k/image/upload/v1751041193/logos_facebook_tyae02.png" alt="Facebook" />
                        Facebook Login
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
