import React, { useEffect, useState } from 'react';
import { Button, Card, message } from 'antd';
import SongsTable from '../component/SongTable';
import { getSongs, deleteSong, updateSong, addSong } from '../api/db';

const API_URL = 'http://localhost:4000';

export default function SongsView() {
    const [songs, setSongs] = useState([]);
    const [showUndefined, setShowUndefined] = useState(false);
    const [suggestions, setSuggestions] = useState({
        artists: [],
        albums: [],
        genres: []
    });

    useEffect(() => { 
        load(); 
        loadSuggestions();
    }, []);

    async function loadSuggestions() {
        try {
            const [artistsRes, albumsRes, genresRes] = await Promise.all([
                fetch(`${API_URL}/artists`),
                fetch(`${API_URL}/albums`),
                fetch(`${API_URL}/genres`)
            ]);

            const artists = await artistsRes.json();
            const albums = await albumsRes.json();
            const genres = await genresRes.json();

            setSuggestions({
                artists: artists.map(artist => ({
                    value: artist.name,
                    id: artist.id,
                    label: artist.name
                })),
                albums: albums.map(album => ({
                    value: album.title,
                    id: album.id,
                    label: album.title
                })),
                genres: genres.map(genre => ({
                    value: genre.title,
                    id: genre.id,
                    label: genre.title
                }))
            });
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        }
    }

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
            console.log('SongsView handleEdit called with:', song);
            const result = await updateSong(song.id, song);
            console.log('Update result:', result);
            message.success('Updated');
            load(); // Reload the songs list
        } catch (error) {
            console.error('Error in handleEdit:', error);
            message.error('Failed to update song');
        }
    }

    async function handleAdd(newSong) {
        try {
            // Generate unique ID
            const id = `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Create song object with proper structure
            const songToAdd = {
                id,
                title: newSong.title || 'New Song',
                artist: newSong.artist || 'Unknown Artist',
                album: newSong.album || 'Single',
                genre: newSong.genre || 'Pop',
                duration: newSong.duration || '3:00',
                release_date: newSong.release_date || new Date().toISOString().split('T')[0],
                views: 0,
                viewCount: 0,
                streaming_links: {
                    audio_url: newSong.audio_url || ''
                },
                cover_url: newSong.cover_url || '',
                img: newSong.img || newSong.cover_url || '',
                // Set IDs based on suggestions
                artistId: newSong.artistId || findSuggestionId('artists', newSong.artist),
                albumId: newSong.albumId || findSuggestionId('albums', newSong.album),
                genreId: newSong.genreId || findSuggestionId('genres', newSong.genre),
                isHidden: false,
                created_at: new Date().toISOString()
            };

            // Add to songsList endpoint
            const response = await fetch(`${API_URL}/songsList`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(songToAdd),
            });
            
            if (response.ok) {
                message.success('Song added successfully');
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

    // Helper function to find suggestion ID by value
    function findSuggestionId(type, value) {
        if (!value) return null;
        const suggestion = suggestions[type]?.find(item => 
            item.value.toLowerCase() === value.toLowerCase()
        );
        return suggestion ? suggestion.id : null;
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
                    suggestions={suggestions}
                />
            </Card>
        </section>
    );
}