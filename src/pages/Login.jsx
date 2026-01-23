import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Form } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { authService } from "../services/auth.service";

import AuthHeader from "../components/UserAccess/AuthHeader";
import InputField from "../components/UserAccess/InputField";
import SubmitButton from "../components/UserAccess/SubmitButton";
import AuthForm from "../components/UserAccess/AuthForm";
import "../style/LoginAndSignUp.css";
import use10Clicks from "../hooks/use10Clicks";
import AdminLogin from "./AdminLogin";

const logoImage =
  "https://res.cloudinary.com/da4y5zf5k/image/upload/v1751044695/logo-no-background_1_z7njh8.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const redirectTo = location.state?.redirectTo || "/";

  const [submitting, setSubmitting] = useState(false);

  // Nhấp Liên Tục Kích Hoạt Admin
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const onTenClick = use10Clicks(
    () => {
      setShowAdminLogin(true);
      toast.info("Chào Admin! Vui lòng nhập mã để đăng nhập.");
    },
    { threshold: 10, resetMs: 800 }
  );

  useEffect(() => {
    if (location.state?.openAdmin) {
      setShowAdminLogin(true);
    }
  }, [location.state]);

  const handleSubmit = async (values) => {
    const email = (values.email || "").trim();
    const password = values.password || "";

    // Validate cơ bản
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }
    if (!password) {
      toast.error("Vui lòng nhập mật khẩu!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.login({ email, password });

      // Backend thường trả: { accessToken, refreshToken, user }
      // Nhưng đôi lúc bọc trong res.data.data => fallback cho chắc
      const payload = res?.data?.data ?? res?.data ?? {};
      const accessToken = payload.accessToken;
      const refreshToken = payload.refreshToken;
      const user = payload.user;

      if (!accessToken || !user) {
        toast.error("Đăng nhập thất bại: thiếu token hoặc user.");
        setSubmitting(false);
        return;
      }

      authService.setSession({ accessToken, refreshToken, user });
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("accesstoken", accessToken); 


      toast.success("Chào mừng bạn đến với Melodies!");
      navigate(redirectTo);
    } catch (err) {
      const status = err?.response?.status;
      const msgFromServer = err?.response?.data?.message;

      // ưu tiên message backend
      if (msgFromServer) {
        toast.error(msgFromServer);
      } else if (status === 401) {
        toast.error("Sai email hoặc mật khẩu!");
      } else if (status === 403) {
        toast.error("Bạn không có quyền truy cập.");
      } else if (err?.message?.includes("Network")) {
        toast.error("Không kết nối được server!");
      } else {
        toast.error("Đăng nhập thất bại!");
      }
    } finally {
      setSubmitting(false);
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
          <InputField label="E-Mail" name="email" type="email" form={form} />
          <InputField
            label="Password"
            name="password"
            type="password"
            form={form}
          />

          <div className="submit">
            <div className="forgot-password">Forgot password &gt;</div>

            {/* onClick giữ lại để 10-click mở admin */}
            <SubmitButton
              text={submitting ? "Logging in..." : "Login"}
              htmlType="submit"
              onClick={onTenClick}
              disabled={submitting}
            />
          </div>
        </AuthForm>

        {showAdminLogin && (
          <AdminLogin onClose={() => setShowAdminLogin(false)} />
        )}

        <div className="social-login">
          <button className="google-login" type="button">
            <img
              src="https://res.cloudinary.com/da4y5zf5k/image/upload/v1751041194/devicon_google_be5zib.png"
              alt="Google"
            />
            Google
          </button>

          <button className="facebook-login" type="button">
            <img
              src="https://res.cloudinary.com/da4y5zf5k/image/upload/v1751041193/logos_facebook_tyae02.png"
              alt="Facebook"
            />
            Facebook
          </button>
        </div>

        <div className="signup-row">
          <div className="signup-text">
            <p>Don't have an account?</p>
            <p className="signup-link" onClick={() => navigate("/signup")}>
              Sign Up Here
            </p>
          </div>
          <button
            className="signup-button"
            type="button"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
