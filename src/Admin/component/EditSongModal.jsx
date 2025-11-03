import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

const EditSongModal = ({ visible, onCancel, onSubmit, editingRecord, genres, loading }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible && editingRecord) {
            form.setFieldsValue({
                title: editingRecord.title,
                artist: editingRecord.artist,
                album: editingRecord.album,
                genre: editingRecord.genre,
            });
        }
    }, [visible, editingRecord, form]);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const values = await form.validateFields();
            
            const updatedSong = {
                ...editingRecord,
                title: values.title,
                artist: values.artist,
                album: values.album,
                genre: values.genre,
            };
            
            await onSubmit(updatedSong);
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
                    />
                </Form.Item>

                <Form.Item
                    label="Artist"
                    name="artist"
                    rules={[
                        { required: true, message: 'Please enter artist name!' },
                        { min: 1, max: 50, message: 'Artist name must be between 1 and 50 characters' }
                    ]}
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
                        placeholder="Enter album name" 
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
            </Form>
        </Modal>
    );
};

export default EditSongModal;