import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import formatNumber from '../../hooks/formatNumber';
import './TopSongsChart.css';

const API_URL = 'http://localhost:4000';

export default function TopSongsChart() {
    const [topSongs, setTopSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTopSongs() {
            try {
                const response = await fetch(`${API_URL}/songs`);
                const songs = await response.json();
                
                // Sắp xếp theo viewCount giảm dần và lấy top 10
                const sortedSongs = songs
                    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                    .slice(0, 10)
                    .map((song, index) => ({
                        key: song.id,
                        rank: index + 1,
                        title: song.title,
                        artist: song.artist,
                        viewCount: song.viewCount || 0,
                        duration: song.duration
                    }));
                
                setTopSongs(sortedSongs);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching top songs:', error);
                setLoading(false);
            }
        }

        fetchTopSongs();
    }, []);

    const columns = [
        {
            title: '#',
            dataIndex: 'rank',
            key: 'rank',
            width: 50,
            render: (rank) => (
                <span className={`font-medium text-sm ${
                    rank === 1 ? 'text-yellow-500' : 
                    rank === 2 ? 'text-gray-400' : 
                    rank === 3 ? 'text-orange-400' : 
                    'text-gray-600'
                }`}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                </span>
            )
        },
        {
            title: 'Bài hát',
            dataIndex: 'title',
            key: 'title',
            render: (title, record) => (
                <div>
                    <div className="font-medium text-gray-900 truncate max-w-[200px] text-sm" title={title}>
                        {title}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]" title={record.artist}>
                        {record.artist}
                    </div>
                </div>
            )
        },
        {
            title: 'Thời lượng',
            dataIndex: 'duration',
            key: 'duration',
            width: 100,
            align: 'center',
            render: (duration) => (
                <span className="text-gray-600 font-mono text-xs">{duration}</span>
            )
        },
        {
            title: 'Lượt nghe',
            dataIndex: 'viewCount',
            key: 'viewCount',
            width: 120,
            align: 'center',
            render: (viewCount) => (
                <div className="text-center">
                    <span className="font-medium text-blue-600 text-sm">
                        {formatNumber(viewCount)}
                    </span>
                    <div className="text-xs text-gray-400">
                        lượt nghe
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="h-full">
            <Table
                columns={columns}
                dataSource={topSongs}
                loading={loading}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
                className="top-songs-table"
            />
        </div>
    );
}