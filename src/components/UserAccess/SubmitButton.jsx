import { Button } from 'antd';

const SubmitButton = ({ text, htmlType = 'submit', disabled = false }) => (
  <Button
    htmlType={htmlType}
    type="primary"
    className="custom-submit-button"
    disabled={disabled}
  >
    {text}
  </Button>
);

export default SubmitButton;
