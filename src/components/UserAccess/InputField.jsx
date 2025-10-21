import { Form, Input } from 'antd';
import { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const InputField = ({ label, type, name, form }) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <Form.Item
      name={name}
      rules={[{ required: true, message: `${label} không được để trống` }]}
      style={{ marginBottom: 5 }}
    >
      <div className="input-group">
        <Input
          type={inputType}
          placeholder={label}
          className="basic-input"
        />
        {isPassword && (
          <span className="toggle-password" onClick={() => setShowPassword(prev => !prev)}>
            {showPassword ? <EyeOutlined className="eye-icon" /> : <EyeInvisibleOutlined className="eye-icon" />}
          </span>
        )}
      </div>
    </Form.Item>
  );
};

export default InputField;
