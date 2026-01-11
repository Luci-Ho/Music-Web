import React, { useState } from 'react';
import Sidebar from '../component/Sidebar';
import Header from '../component/Header';
import DashboardView from './DashBoardView';
import SongsView from './SongsView';
import UsersView from './UserView';
import TagsView from './TagsView';
import { AuthProvider } from '../context/AuthContext';
import './Admin.css';

export default function AdminPage() {
    const [active, setActive] = useState('dashboard');
    const [query, setQuery] = useState('');

    return (
        <AuthProvider>
            <div className={"admin"}>
                <Sidebar active={active} setActive={setActive} />
                <div className="admin-area">
                    <Header query={query} setQuery={setQuery} />
                    <div className="admin-container">
                        {active === 'dashboard' && <DashboardView />}
                        {active === 'songs' && <SongsView />}
                        {active === 'users' && <UsersView />}
                        {active === 'tags' && <TagsView />}
                    </div>
                </div>
            </div>
        </AuthProvider>
    );
}