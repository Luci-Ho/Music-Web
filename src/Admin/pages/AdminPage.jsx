import React, { useState } from 'react';
import Sidebar from '../component/Sidebar';
import Header from '../component/Header';
import DashboardView from './DashBoardView';
import SongsView from './SongsView';
import UsersView from './UserView';
import AnalyticsView from './AnalyticsView';
import './Admin.css';

export default function AdminPage() {
    const [active, setActive] = useState('dashboard');
    const [query, setQuery] = useState('');

    return (
        <div className={"admin"}>
            <Sidebar active={active} setActive={setActive} />
            <div className="admin-area">
                <Header query={query} setQuery={setQuery} />
                <div className="admin-container">
                    {active === 'dashboard' && <DashboardView />}
                    {active === 'songs' && <SongsView />}
                    {active === 'users' && <UsersView />}
                    {active === 'analytics' && <AnalyticsView />}
                </div>
            </div>
        </div>
    );
}