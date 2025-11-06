import React from 'react';
import SettingsForm from './SettingForm';
import '../style/Settings.css';

const UserSettingsPage = () => {
  return (
    <div className="settings-container">
      <h2>User Account Settings</h2>
      <SettingsForm />
    </div>
  );
};

export default UserSettingsPage;
