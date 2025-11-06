import React, { useState } from 'react';
import { Modal, Form, Input, Select, AutoComplete, message } from 'antd';

const AddSongModal = ({ visible, onCancel, onSubmit, artists, genres, loading, suggestions = { artists: [], albums: [], genres: [] } }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Find or create multiple artists
    const findOrCreateArtists = async (artistNames) => {
        const artistIds = [];
        
        for (const artistName of artistNames) {
            // Check if artist already exists
            const existingArtist = artists.find(a => 
                a.name.toLowerCase() === artistName.toLowerCase() ||
                a.name.toLowerCase().includes(artistName.toLowerCase()) ||
                artistName.toLowerCase().includes(a.name.toLowerCase())
            );
            
            if (existingArtist) {
                artistIds.push(existingArtist.id);
            } else {
                // Create new artist
                try {
                    const newArtistId = `a${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
                    const newArtist = {
                        id: newArtistId,
                        name: artistName,
                        img: "https://via.placeholder.com/150?text=New+Artist"
                    };

                    const response = await fetch('http://localhost:4000/artists', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newArtist),
                    });

                    if (response.ok) {
                        message.success(`Created new artist: ${artistName}`);
                        artistIds.push(newArtistId);
                    }
                } catch (error) {
                    console.error('Error creating artist:', error);
                }
            }
        }
        
        return artistIds;
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const values = await form.validateFields();
            
            // Handle multiple artists
            const artistNames = Array.isArray(values.artists) ? values.artists : [values.artists];
            const artistIds = await findOrCreateArtists(artistNames);
            
            if (artistIds.length === 0) {
                message.error('Failed to create/find artists');
                return;
            }

            // Handle multiple genres
            const selectedGenres = Array.isArray(values.genres) ? values.genres : [values.genres];
            const genreIds = selectedGenres.map(genreName => {
                const genre = genres.find(g => g.title === genreName);
                return genre?.id || 'g101'; // fallback to default genre
            });
            
            const newSong = {
                id: `s${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`,
                title: values.title,
                // Primary artist (first one)
                artistId: artistIds[0],
                artist: artistNames[0],
                // All artists (for display and search)
                artists: artistNames,
                artistIds: artistIds,
                // Primary genre (first one)
                genreId: genreIds[0],
                genre: selectedGenres[0],
                // All genres
                genres: selectedGenres,
                genreIds: genreIds,
                // Album
                albumId: values.album || 'al_default',
                album: values.album || 'Single',
                duration: "3:30",
                releaseYear: new Date().getFullYear(),
                release_date: new Date().toISOString().split('T')[0],
                img: "https://via.placeholder.com/300?text=New+Song",
                cover_url: "https://via.placeholder.com/300?text=New+Song",
                viewCount: 0,
                views: 0,
                streaming_links: {
                    audio_url: "https://res.cloudinary.com/da4y5zf5k/video/upload/v1761576977/Lily_Allen_Somewhere_Only_We_Know_ika4ga.mp3"
                },
                isHidden: false,
                created_at: new Date().toISOString()
            };

            await onSubmit(newSong);
            handleCancel();
        } catch (error) {
            console.error('Validation failed:', error);
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
            title="Add New Song"
            open={visible}
            onOk={handleSubmit}
            onCancel={handleCancel}
            width={600}
            confirmLoading={submitting}
            okText="Add Song"
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
                            <Select.Option key={artist.id} value={artist.value}>
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
                            <Select.Option key={genre.id} value={genre.value}>
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
                        <li>• Date will be set to current year ({new Date().getFullYear()})</li>
                    </ul>
                </div>
            </Form>
        </Modal>
    );
};

export default AddSongModal;