import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, AutoComplete, message } from 'antd';

const EditSongModal = ({ visible, onCancel, onSubmit, onSuccess, editingRecord, artists, genres, loading, suggestions = { artists: [], albums: [], genres: [] } }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Validate and clean artist name (similar to AddSongModal)
    const validateArtistName = (name) => {
        if (!name || typeof name !== 'string') {
            return null;
        }
        
        // Remove extra whitespace and special characters that might cause issues
        const cleaned = name.trim().replace(/[<>"/\\|?*:]/g, '');
        
        // Check length
        if (cleaned.length < 1 || cleaned.length > 100) {
            return null;
        }
        
        return cleaned;
    };

    // Update song directly via API
    const updateSongDirectly = async (songData) => {
        try {
            const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';
            // Try PATCH first (partial update)
            let response = await fetch(`${API_BASE}/songs/${songData._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(songData),
            });

            // If PATCH fails, try PUT (full replace)
            if (!response.ok) {
                console.log('PATCH failed, trying PUT method');
                response = await fetch(`${API_BASE}/songs/${songData._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(songData),
                });
            }

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to update song: ${response.statusText} - ${errorData}`);
            }

            const updatedSong = await response.json();
            console.log('Successfully updated song:', updatedSong);
            return updatedSong;
        } catch (error) {
            console.error('Error updating song:', error);
            throw error;
        }
    };

    // Find or create multiple artists (similar to AddSongModal)
    const findOrCreateArtists = async (artistNames) => {
        const artistIds = [];
        const validNames = [];
        
        // First validate all artist names
        for (const rawName of artistNames) {
            const cleanName = validateArtistName(rawName);
            if (cleanName) {
                validNames.push(cleanName);
            } else {
                console.warn(`Invalid artist name skipped: "${rawName}"`);
                message.warning(`Skipped invalid artist name: "${rawName}"`);
            }
        }
        
        if (validNames.length === 0) {
            message.error('No valid artist names provided');
            return { artistIds: [], validNames: [] };
        }
        
        for (const artistName of validNames) {
            // Check if artist already exists
            const existingArtist = artists.find(a => 
                a.name.toLowerCase() === artistName.toLowerCase() ||
                a.name.toLowerCase().includes(artistName.toLowerCase()) ||
                artistName.toLowerCase().includes(a.name.toLowerCase())
            );
            
            if (existingArtist) {
                artistIds.push(existingArtist._id);
            } else {
                // Create new artist
                try {
                    const newArtistId = `a${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
                    const newArtist = {
                        id: newArtistId,
                        name: artistName,
                        img: "https://via.placeholder.com/150?text=New+Artist"
                    };

                    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';
                    const response = await fetch(`${API_BASE}/artists`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newArtist),
                    });

                    if (response.ok) {
                        const createdArtist = await response.json();
                        message.success(`Created new artist: ${artistName}`);
                        artistIds.push(newArtistId);
                        console.log('Successfully created artist:', createdArtist);
                    } else {
                        const errorData = await response.text();
                        console.error(`Failed to create artist "${artistName}":`, response.status, errorData);
                        message.error(`Failed to create artist "${artistName}": ${response.statusText}`);
                        // Still continue with other artists, don't break the entire process
                    }
                } catch (error) {
                    console.error(`Error creating artist "${artistName}":`, error);
                    message.error(`Network error while creating artist "${artistName}": ${error.message}`);
                    // Still continue with other artists, don't break the entire process
                }
            }
        }
        
        return { artistIds, validNames };
    };

    useEffect(() => {
        if (visible && editingRecord) {
            // Handle both single artist and multiple artists
            const artistsValue = editingRecord.artists && Array.isArray(editingRecord.artists) 
                ? editingRecord.artists 
                : editingRecord.artist 
                ? [editingRecord.artist]
                : [];

            // Handle both single genre and multiple genres  
            const genresValue = editingRecord.genres && Array.isArray(editingRecord.genres)
                ? editingRecord.genres
                : editingRecord.genre
                ? [editingRecord.genre]
                : [];

            form.setFieldsValue({
                title: editingRecord.title,
                artists: artistsValue,
                album: editingRecord.album,
                genres: genresValue,
            });
        }
    }, [visible, editingRecord, form]);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const values = await form.validateFields();
            
            // Handle multiple artists
            const artistNames = Array.isArray(values.artists) ? values.artists : [values.artists];
            console.log('Input artist names:', artistNames);
            
            const { artistIds, validNames } = await findOrCreateArtists(artistNames);
            console.log('Found/created artists:', { artistIds, validNames });
            
            if (artistIds.length === 0) {
                message.error('Failed to create/find any artists. Please check your input and try again.');
                return;
            }

            // Show warning if some artists couldn't be created
            if (artistIds.length < artistNames.length) {
                const failedCount = artistNames.length - artistIds.length;
                message.warning(`${failedCount} artist(s) could not be created. Proceeding with ${artistIds.length} artist(s).`);
            }

            // Handle multiple genres
            const selectedGenres = Array.isArray(values.genres) ? values.genres : [values.genres];
            const genreIds = selectedGenres.map(genreName => {
                const genre = genres.find(g => g.title === genreName);
                return genre?._id || 'g101'; // fallback to default genre
            });
            
            const updatedSong = {
                ...editingRecord, // Preserve all existing fields
                title: values.title,
                // Primary artist (first one)
                artistId: artistIds[0],
                artist: validNames[0],
                // All artists (for display and search) - only include those that were successfully created/found
                artists: validNames.slice(0, artistIds.length),
                artistIds: artistIds,
                // Primary genre (first one)
                genreId: genreIds[0],
                genre: selectedGenres[0],
                // All genres
                genres: selectedGenres,
                genreIds: genreIds,
                // Album
                album: values.album || 'Single',
                albumId: values.album ? (editingRecord.albumId || 'al_custom') : 'al_default',
                // Update timestamp
                updated_at: new Date().toISOString(),
                // Preserve important fields that shouldn't be lost
                id: editingRecord._id,
                duration: editingRecord.duration || "3:30",
                releaseYear: editingRecord.releaseYear || new Date().getFullYear(),
                release_date: editingRecord.release_date || new Date().toISOString().split('T')[0],
                views: editingRecord.views || 0,
                viewCount: editingRecord.viewCount || 0,
                streaming_links: editingRecord.streaming_links || {
                    audio_url: "https://res.cloudinary.com/da4y5zf5k/video/upload/v1761576977/Lily_Allen_Somewhere_Only_We_Know_ika4ga.mp3"
                },
                img: editingRecord.img || "https://via.placeholder.com/300?text=Song",
                cover_url: editingRecord.cover_url || editingRecord.img || "https://via.placeholder.com/300?text=Song",
                isHidden: editingRecord.isHidden || false,
                created_at: editingRecord.created_at || new Date().toISOString()
            };

            console.log('Attempting to update song with data:', updatedSong);
            
            // Check if we have onSubmit (from parent component that handles API)
            if (onSubmit) {
                console.log('Using onSubmit handler');
                await onSubmit(updatedSong);
            } else if (onSuccess) {
                // For backward compatibility - handle the song update here
                console.log('Using onSuccess handler with direct API call');
                await updateSongDirectly(updatedSong);
                onSuccess();
            } else {
                throw new Error('No handler provided for song update');
            }
            
            message.success(`Successfully updated song "${values.title}" with ${artistIds.length} artist(s)`);
            handleCancel();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            if (error.name === 'ValidationError') {
                message.error('Please fill in all required fields correctly');
            } else {
                message.error(`Failed to update song: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Edit Song"
            open={visible}
            onOk={handleSubmit}
            onCancel={handleCancel}
            width={600}
            confirmLoading={submitting}
            okText="Save Changes"
            cancelText="Cancel"
        >
            <Form
                form={form}
                layout="vertical"
                requiredMark={false}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[
                        { required: true, message: 'Please enter song title!' },
                        { min: 1, max: 100, message: 'Title must be between 1 and 100 characters' }
                    ]}
                >
                    <Input 
                        placeholder="Enter song title" 
                        disabled={submitting}
                        style={{
                            borderColor: '#EE10B0',
                            boxShadow: '0 0 0 2px rgba(238, 16, 176, 0.1)'
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="Artist(s)"
                    name="artists"
                    rules={[
                        { required: true, message: 'Please select at least one artist!' }
                    ]}
                    extra="You can select multiple artists or add new ones"
                >
                    <Select
                        mode="tags"
                        placeholder="Enter or select artists"
                        disabled={submitting}
                        style={{ 
                            width: '100%'
                        }}
                        dropdownStyle={{
                            border: '1px solid #EE10B0',
                            borderRadius: '6px'
                        }}
                        tokenSeparators={[',']}
                        maxTagCount={5}
                        maxTagTextLength={20}
                    >
                        {suggestions.artists.map(artist => (
                            <Select.Option key={artist._id} value={artist.value}>
                                {artist.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Album"
                    name="album"
                    rules={[
                        { max: 100, message: 'Album name must be less than 100 characters' }
                    ]}
                >
                    <AutoComplete
                        placeholder="Enter or select album name (optional)"
                        disabled={submitting}
                        options={suggestions.albums}
                        filterOption={(inputValue, option) =>
                            option.label.toLowerCase().includes(inputValue.toLowerCase())
                        }
                        style={{ 
                            width: '100%'
                        }}
                        dropdownStyle={{
                            border: '1px solid #EE10B0',
                            borderRadius: '6px'
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="Genre(s)"
                    name="genres"
                    rules={[{ required: true, message: 'Please select at least one genre!' }]}
                    extra="You can select multiple genres"
                >
                    <Select
                        mode="multiple"
                        placeholder="Enter or select genres"
                        disabled={submitting || loading}
                        style={{ 
                            width: '100%'
                        }}
                        dropdownStyle={{
                            border: '1px solid #EE10B0',
                            borderRadius: '6px'
                        }}
                        maxTagCount={3}
                        maxTagTextLength={15}
                        showSearch
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {suggestions.genres.map(genre => (
                            <Select.Option key={genre._id} value={genre.value}>
                                {genre.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
                    <strong>Note:</strong> 
                    <ul className="mt-2 ml-4">
                        <li>• You can select multiple artists and genres</li>
                        <li>• First artist and genre will be used as primary</li>
                        <li>• New artists will be created automatically if they don't exist</li>
                        <li>• Last updated: {new Date().toLocaleDateString()}</li>
                    </ul>
                </div>
            </Form>
        </Modal>
    );
};

export default EditSongModal;