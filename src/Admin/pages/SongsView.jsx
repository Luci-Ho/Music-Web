import React, { useEffect, useState } from 'react';
import { Button, Card, message } from 'antd';
import SongsTable from '../component/SongTable';
import { getSongs, deleteSong, updateSong, addSong } from '../api/db';

const API_URL = 'http://localhost:4000';

export default function SongsView() {
    const [songs, setSongs] = useState([]);
    const [showUndefined, setShowUndefined] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() { 
        const s = await getSongs(); 
        console.log('SongsView - loaded songs:', s);
        setSongs(s); 
    }


    async function handleDelete(id) {
        await deleteSong(id);
        message.success('Deleted');
        load();
    }


    async function handleEdit(song) {
        try {
            await updateSong(song.id, song);
            message.success('Updated');
            load();
        } catch (error) {
            message.error('Failed to update song');
        }
    }

    async function handleAdd(newSong) {
        try {
            // Add to songsList endpoint
            const response = await fetch(`${API_URL}/songsList`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSong),
            });
            
            if (response.ok) {
                load();
                return true;
            } else {
                throw new Error('Failed to add song');
            }
        } catch (error) {
            message.error('Failed to add song');
            throw error;
        }
    }

    async function handleCreate() {
        const newSong = { title: 'New Song', artist: 'Unknown', album: 'Single', listens: 0, date: '2025-10-29' };
        await addSong(newSong);
            message.success('Created');
            load();
    }

    // Filter songs based on undefined/hidden status
    const filteredSongs = showUndefined 
        ? songs.filter(song => song.isHidden || song.genreId === 'undefined' || song.artistId === 'undefined' || song.albumId === 'undefined')
        : songs.filter(song => !song.isHidden);

    const restoreHiddenSong = async (songId) => {
        try {
            await fetch(`${API_URL}/songsList/${songId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    isHidden: false,
                    genreId: null,
                    artistId: null,
                    albumId: null,
                    genre: '',
                    artist: '',
                    album: ''
                })
            });
            message.success('Song restored');
            load();
        } catch (error) {
            message.error('Failed to restore song');
        }
    };


    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2>Songs Management</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                        type={showUndefined ? "default" : "primary"}
                        onClick={() => setShowUndefined(false)}
                    >
                        Active Songs ({songs.filter(song => !song.isHidden).length})
                    </Button>
                    <Button 
                        type={showUndefined ? "primary" : "default"}
                        onClick={() => setShowUndefined(true)}
                        danger={showUndefined}
                    >
                        Undefined/Hidden ({songs.filter(song => song.isHidden || song.genreId === 'undefined' || song.artistId === 'undefined' || song.albumId === 'undefined').length})
                    </Button>
                </div>
            </div>
            <Card>
                <SongsTable 
                    songs={filteredSongs} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                    onAdd={handleAdd}
                    showUndefined={showUndefined}
                    onRestore={restoreHiddenSong}
                />
            </Card>
        </section>
    );
}