import React, { useEffect, useState } from 'react';
import { Button, Card, message } from 'antd';
import SongsTable from '../component/SongTable';
import { getSongs, deleteSong, updateSong, addSong } from '../api/db';

const API_URL = 'http://localhost:4000';

export default function SongsView() {
    const [songs, setSongs] = useState([]);

    useEffect(() => { load(); }, []);

    async function load() { const s = await getSongs(); setSongs(s); }


    async function handleDelete(id) {
        await deleteSong(id);
        message.success('Deleted');
        load();
    }


    async function handleEdit(song) {
    // open modal (omitted for brevity). Here we'll just update title for demo
        await updateSong(song.id, { ...song, title: song.title + ' (edited)' });
            message.success('Updated');
            load();
    }


    async function handleCreate() {
        const newSong = { title: 'New Song', artist: 'Unknown', album: 'Single', listens: 0, date: '2025-10-29' };
        await addSong(newSong);
            message.success('Created');
            load();
    }


    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2>Songs</h2>
                <Button type="primary" onClick={handleCreate}>Add Song</Button>
            </div>
            <Card>
                <SongsTable songs={songs} onEdit={handleEdit} onDelete={handleDelete} />
            </Card>
        </section>
    );
}