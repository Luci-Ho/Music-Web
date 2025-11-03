import React, { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

const AddSongModal = ({ visible, onCancel, onSubmit, artists, genres, loading }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Find or create artist
    const findOrCreateArtist = async (artistName) => {
        // Check if artist already exists (exact match or similar)
        const existingArtist = artists.find(a => 
            a.name.toLowerCase() === artistName.toLowerCase() ||
            a.name.toLowerCase().includes(artistName.toLowerCase()) ||
            artistName.toLowerCase().includes(a.name.toLowerCase())
        );
        
        if (existingArtist) {
            return existingArtist.id;
        }

        // Create new artist
        try {
            const newArtistId = `a${Date.now().toString(36)}`;
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
                return newArtistId;
            }
        } catch (error) {
            console.error('Error creating artist:', error);
        }
        
        return null;
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const values = await form.validateFields();
            
            // Find or create artist
            const artistId = await findOrCreateArtist(values.artist);
            if (!artistId) {
                message.error('Failed to create/find artist');
                return;
            }

            // Find genre ID
            const selectedGenre = genres.find(g => g.title === values.genre);
            
            const newSong = {
                id: `s${Date.now().toString(36)}`,
                title: values.title,
                artistId: artistId,
                albumId: values.album || 'al_default',
                genreId: selectedGenre?.id || 'g101',
                duration: "3:30",
                releaseYear: new Date().getFullYear(),
                img: "https://via.placeholder.com/300?text=New+Song",
                viewCount: 0,
                streaming_links: {
                    audio_url: "https://res.cloudinary.com/da4y5zf5k/video/upload/v1761576977/Lily_Allen_Somewhere_Only_We_Know_ika4ga.mp3"
                }
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
                    />
                </Form.Item>

                <Form.Item
                    label="Artist"
                    name="artist"
                    rules={[
                        { required: true, message: 'Please enter artist name!' },
                        { min: 1, max: 50, message: 'Artist name must be between 1 and 50 characters' }
                    ]}
                    extra="If artist doesn't exist, a new one will be created automatically"
                >
                    <Input 
                        placeholder="Enter artist name" 
                        disabled={submitting}
                    />
                </Form.Item>

                <Form.Item
                    label="Album"
                    name="album"
                    rules={[
                        { max: 100, message: 'Album name must be less than 100 characters' }
                    ]}
                >
                    <Input 
                        placeholder="Enter album name (optional)" 
                        disabled={submitting}
                    />
                </Form.Item>

                <Form.Item
                    label="Genre"
                    name="genre"
                    rules={[{ required: true, message: 'Please select a genre!' }]}
                >
                    <Select 
                        placeholder="Select genre" 
                        disabled={submitting || loading}
                        showSearch
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {genres.map(genre => (
                            <Select.Option key={genre.id} value={genre.title}>
                                {genre.title}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
                    <strong>Note:</strong> Date will be automatically set to current year ({new Date().getFullYear()})
                </div>
            </Form>
        </Modal>
    );
};

export default AddSongModal;