import React, { useState } from 'react';

const SettingsForm = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [theme, setTheme] = useState('light');

  const handleSave = () => {
    // Gọi API hoặc cập nhật localStorage
    console.log('Lưu thông tin:', { username, email, theme });
  };

  return (
    <form className="settings-form">
      <label>Username</label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />

      <label>Email</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />

      <label>Theme</label>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>

      <button type="button" onClick={handleSave}>Save Changes</button>
    </form>
  );
};

export default SettingsForm;
