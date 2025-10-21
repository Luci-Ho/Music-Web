
import { Form } from 'antd';

const AuthForm = ({ form, onFinish, children }) => {
  return (
    <Form
      form={form}                // kết nối form instance
      onFinish={onFinish}        // kích hoạt khi submit
      layout="vertical"          // kiểu layout form
      requiredMark={false}       // ẩn dấu * bắt buộc
    >
      {children}
    </Form>
  );
};

export default AuthForm;