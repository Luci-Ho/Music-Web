import { Button } from 'antd';

const SubmitButton = ({ text, htmlType = 'submit', disabled = false, onClick }) => (
  <Button
    htmlType={htmlType}
    type="primary"
    className="custom-submit-button"
    disabled={disabled}
    onClick={onClick}
  >
    {text}
  </Button>
);

export default SubmitButton;
