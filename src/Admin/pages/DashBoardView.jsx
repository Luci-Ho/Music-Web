import React, { useEffect, useState } from 'react';
import { Card, Table, Tag } from 'antd';
import StartCard from '../component/StartCard';
import ChartBar from '../component/ChartBar';
import ChartPie from '../component/ChartPie';
import ChartLine from '../component/ChartLine';
import { useAuth } from '../context/AuthContext';
import formatTimes from '../../hooks/formatTimes';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';


export default function DashboardView() {
    const { userLevel, isAdmin, isModerator, isUser, canEditSongs, canDeleteSongs, canAddSongs, canManageUsers } = useAuth();
    const [songsCount, setSongsCount] = useState(0);
    const [usersCount, setUsersCount] = useState(0);
    const [artistsCount, setArtistsCount] = useState(0);
    const [streamingCount, setStreamingCount] = useState(0);

    useEffect(() => {
        async function load() {
            const songs = await fetch(`${API_BASE}/songs`).then(res => res.json());
            const users = await fetch(`${API_BASE}/users`).then(res => res.json());
            const artists = await fetch(`${API_BASE}/artists`).then(res => res.json());
            const streaming = 4512500; // Giả sử giá trị tĩnh cho tổng số lượt phát
            setStreamingCount(streaming);
            setSongsCount(songs.length);
            setUsersCount(users.length);
            setArtistsCount(artists.length);
        }
        load();
        
    }, []);

    const getLevelName = (level) => {
        switch (level) {
            case 'l1': return 'Admin';
            case 'l2': return 'Moderator';
            case 'l3': return 'User';
            default: return 'Unknown';
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'l1': return 'red';
            case 'l2': return 'orange';
            case 'l3': return 'blue';
            default: return 'gray';
        }
    };

    // Permissions data for display
    const permissionsData = [
        {
            key: '1',
            action: 'View Songs',
            permission: '✅',
            description: 'Can view all songs in the system'
        },
        {
            key: '2',
            action: 'Edit Songs',
            permission: canEditSongs() ? '✅' : '❌',
            description: 'Can modify song information'
        },
        {
            key: '3',
            action: 'Delete Songs',
            permission: canDeleteSongs() ? '✅' : '❌',
            description: 'Can remove songs from the system'
        },
        {
            key: '4',
            action: 'Add Songs',
            permission: canAddSongs() ? '✅' : '❌',
            description: 'Can add new songs to the system'
        },
        {
            key: '5',
            action: 'Manage Users',
            permission: canManageUsers() ? '✅' : '❌',
            description: 'Can promote/demote user levels'
        }
    ];

    const permissionColumns = [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
        },
        {
            title: 'Permission',
            dataIndex: 'permission',
            key: 'permission',
            width: 100,
            align: 'center'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        }
    ];

const stats = [
    { id: 1, title: 'Total Songs', value: songsCount },
    { id: 2, title: 'Total Users', value: usersCount },
    { id: 3, title: 'Total Streaming', value: formatTimes(streamingCount, { unit: 's' }) },
    { id: 4, title: 'Total Artists', value: artistsCount },
];


const listensByDay = [
    { day: 'Mon', listens: 1200 }, 
    { day: 'Tue', listens: 2500 }, 
    { day: 'Wed', listens: 2000 }, 
    { day: 'Thu', listens: 3000 }, 
    { day: 'Fri', listens: 4500 }, 
    { day: 'Sat', listens: 6000 }, 
    { day: 'Sun', listens: 5200 }
];


const userActivity = [ 
    { date: '2025-10-23', users: 1200 }, 
    { date: '2025-10-24', users: 1350 }, 
    { date: '2025-10-25', users: 1600 }, 
    { date: '2025-10-26', users: 1500 }, 
    { date: '2025-10-27', users: 1800 }, 
    { date: '2025-10-28', users: 2200 }, 
    { date: '2025-10-29', users: 2100 } 
];


    return (
        <section>
            <div className="grid grid-cols-4 gap-4 mb-6 ">
                {stats.map(s => <StartCard key={s._id} title={s.title} value={s.value} />)}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
            <Card className="col-span-2">
                <h3>Listens by day</h3>
                <ChartBar data={listensByDay} />
            </Card>
            <Card>
                <h3>Top 10 Bài Hát Được Nghe Nhiều Nhất</h3>
                <ChartPie />
            </Card>
            </div>

            <Card>
                <h3>User activity (weekly)</h3>
                <ChartLine data={userActivity} />
            </Card>
        </section>
    );
}