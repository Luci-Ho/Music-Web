import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import StartCard from '../component/StartCard';
import ChartBar from '../component/ChartBar';
import ChartPie from '../component/ChartPie';
import ChartLine from '../component/ChartLine';
import formatTimes from '../../hooks/formatTimes';

const API_URL = 'http://localhost:4000';


export default function DashboardView() {
const [songsCount, setSongsCount] = useState(0);
const [usersCount, setUsersCount] = useState(0);
const [artistsCount, setArtistsCount] = useState(0);
const [streamingCount, setStreamingCount] = useState(0);

useEffect(() => {
    async function load() {
        const songs = await fetch(`${API_URL}/songs`).then(res => res.json());
        const users = await fetch(`${API_URL}/users`).then(res => res.json());
        const artists = await fetch(`${API_URL}/artists`).then(res => res.json());
        const streaming = 4512500; // Giả sử giá trị tĩnh cho tổng số lượt phát
        setStreamingCount(streaming);
        setSongsCount(songs.length);
        setUsersCount(users.length);
        setArtistsCount(artists.length);
    }
    load();
    
}, []);

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


const vongtronsomenh = [ 
    { name: 'so1', value: 400 }, 
    { name: 'so2', value: 300 }, 
    { name: 'so3', value: 200 }, 
    { name: 'so4', value: 100 } 
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
                {stats.map(s => <StartCard key={s.id} title={s.title} value={s.value} />)}
            </div>


            <div className="grid grid-cols-3 gap-6 mb-6">
            <Card className="col-span-2">
                <h3>Listens by day</h3>
                <ChartBar data={listensByDay} />
            </Card>
            <Card>
                <h3>Vòng Tròn Số Mệnh</h3>
                <ChartPie data={vongtronsomenh} />
            </Card>
            </div>


            <Card>
                <h3>User activity (weekly)</h3>
                <ChartLine data={userActivity} />
            </Card>
        </section>
    );
}