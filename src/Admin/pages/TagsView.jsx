import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Modal, Form, Input, Select, Table, Space, Popconfirm, message, Tag, Dropdown, Menu } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, DownOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

// Suppress Ant Design React 19 compatibility warning
const originalWarn = console.warn;
console.warn = (...args) => {
    if (args[0]?.includes?.('[antd: compatible]')) return;
    originalWarn(...args);
};

const { Option } = Select;

export default function TagsView() {
    const { isAdmin, isModerator, canDeleteSongs } = useAuth();
    const [genres, setGenres] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(''); // 'genre', 'album', 'artist'
    const [editingItem, setEditingItem] = useState(null);
    const [selectedSongs, setSelectedSongs] = useState([]);
    
    // Form instance
    const [form] = Form.useForm();

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [genresRes, albumsRes, artistsRes, songsRes] = await Promise.all([
                fetch('http://localhost:4000/genres'),
                fetch('http://localhost:4000/albums'),
                fetch('http://localhost:4000/artists'),
                fetch('http://localhost:4000/songsList')
            ]);

            setGenres(await genresRes.json());
            setAlbums(await albumsRes.json());
            setArtists(await artistsRes.json());
            setSongs(await songsRes.json());
        } catch (error) {
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Generic handlers
    const showModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalVisible(true);
        
        if (item) {
            form.setFieldsValue(item);
            // For editing, load associated songs
            const associatedSongs = songs.filter(song => {
                if (type === 'genre') return song.genreId === item.id || song.genre === item.title;
                if (type === 'artist') return song.artistId === item.id || song.artist === item.name;
                if (type === 'album') return song.albumId === item.id || song.album === item.title;
                return false;
            });
            setSelectedSongs(associatedSongs.map(song => song.id));
        } else {
            form.resetFields();
            setSelectedSongs([]);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingItem(null);
        setSelectedSongs([]);
        form.resetFields();
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            // Validate minimum 3 songs for new items
            if (!editingItem && selectedSongs.length < 3) {
                message.error('Please select at least 3 songs');
                return;
            }

            const endpoint = `http://localhost:4000/${modalType === 'genre' ? 'genres' : modalType === 'artist' ? 'artists' : 'albums'}`;
            
            let newItem;
            if (editingItem) {
                // Update existing item
                const response = await fetch(`${endpoint}/${editingItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...editingItem, ...values })
                });
                newItem = await response.json();
            } else {
                // Create new item
                const id = modalType === 'genre' ? `g${Date.now()}` : 
                          modalType === 'artist' ? `a${Date.now()}` : `al${Date.now()}`;
                
                newItem = {
                    id,
                    ...values,
                    songs: selectedSongs
                };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newItem)
                });
                newItem = await response.json();
            }

            // Update songs with new associations
            await updateSongAssociations(newItem, selectedSongs);
            
            message.success(`${modalType} ${editingItem ? 'updated' : 'created'} successfully`);
            loadData();
            handleModalCancel();
        } catch (error) {
            message.error(`Failed to ${editingItem ? 'update' : 'create'} ${modalType}`);
        }
    };

    const updateSongAssociations = async (item, songIds) => {
        const updatePromises = songIds.map(songId => {
            const song = songs.find(s => s.id === songId);
            if (!song) return Promise.resolve();

            let updateData = {};
            if (modalType === 'genre') {
                updateData = { genreId: item.id, genre: item.title };
            } else if (modalType === 'artist') {
                updateData = { artistId: item.id, artist: item.name };
            } else if (modalType === 'album') {
                updateData = { albumId: item.id, album: item.title };
            }

            return fetch(`http://localhost:4000/songsList/${songId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
        });

        await Promise.all(updatePromises);
    };

    const deleteItem = async (type, item) => {
        try {
            // Move associated songs to undefined category
            const associatedSongs = songs.filter(song => {
                if (type === 'genre') return song.genreId === item.id;
                if (type === 'artist') return song.artistId === item.id;
                if (type === 'album') return song.albumId === item.id;
                return false;
            });

            // Update songs to undefined/hidden state
            const hidePromises = associatedSongs.map(song => {
                let updateData = { isHidden: true };
                if (type === 'genre') {
                    updateData.genreId = 'undefined';
                    updateData.genre = 'Undefined';
                } else if (type === 'artist') {
                    updateData.artistId = 'undefined';
                    updateData.artist = 'Undefined';
                } else if (type === 'album') {
                    updateData.albumId = 'undefined';
                    updateData.album = 'Undefined';
                }

                return fetch(`http://localhost:4000/songsList/${song.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });
            });

            await Promise.all(hidePromises);

            // Delete the item
            const endpoint = `http://localhost:4000/${type === 'genre' ? 'genres' : type === 'artist' ? 'artists' : 'albums'}`;
            await fetch(`${endpoint}/${item.id}`, { method: 'DELETE' });

            message.success(`${type} deleted and ${associatedSongs.length} songs moved to undefined`);
            loadData();
        } catch (error) {
            message.error(`Failed to delete ${type}`);
        }
    };

    // Table columns for each type
    const getColumns = (type) => [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            align: 'center',
            className: 'text-center',
        },
        {
            title: type === 'album' ? 'Title' : type === 'genre' ? 'Title' : 'Name',
            dataIndex: type === 'album' ? 'title' : type === 'genre' ? 'title' : 'name',
            key: 'name',
            width: 200,
            align: 'right',
            className: 'text-right',
            ellipsis: true,
        },
        {
            title: 'Songs Count',
            key: 'songsCount',
            width: 120,
            align: 'center',
            className: 'text-center',
            render: (_, record) => {
                const count = songs.filter(song => {
                    if (type === 'genre') return song.genreId === record.id;
                    if (type === 'artist') return song.artistId === record.id;
                    if (type === 'album') return song.albumId === record.id;
                    return false;
                }).length;
                return <Tag color={count === 0 ? 'red' : 'blue'}>{count}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 280,
            align: 'left',
            className: 'text-left',
            render: (_, record) => (
                <Space size="small" className="flex flex-nowrap">
                    <Dropdown 
                        menu={getSongsDropdown(type, record)}
                        trigger={['click']}
                        placement="bottomLeft"
                    >
                        <Button 
                            icon={<EyeOutlined />} 
                            size="small"
                            className="hover:bg-blue-50"
                        >
                            View <DownOutlined />
                        </Button>
                    </Dropdown>
                    {(isAdmin() || isModerator()) && (
                        <Button 
                            icon={<EditOutlined />} 
                            size="small"
                            onClick={() => showModal(type, record)}
                            className="hover:bg-green-50"
                        >
                            Edit
                        </Button>
                    )}
                    {isAdmin() && (
                        <Popconfirm
                            title={`Delete this ${type}?`}
                            description="Songs will be moved to undefined."
                            onConfirm={() => deleteItem(type, record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button 
                                icon={<DeleteOutlined />} 
                                size="small" 
                                danger
                                className="hover:bg-red-50"
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const getSongsDropdown = (type, item) => {
        const associatedSongs = songs.filter(song => {
            if (type === 'genre') return song.genreId === item.id;
            if (type === 'artist') return song.artistId === item.id;
            if (type === 'album') return song.albumId === item.id;
            return false;
        });

        if (associatedSongs.length === 0) {
            return {
                items: [
                    {
                        key: 'empty',
                        label: 'No songs found',
                        disabled: true
                    }
                ]
            };
        }

        return {
            items: associatedSongs.map(song => ({
                key: song.id,
                label: song.title
            }))
        };
    };

    const availableSongs = songs.filter(song => !song.isHidden);

    const tabItems = [
        {
            key: 'genres',
            label: 'Genres',
            children: (
                <Card>
                    {isAdmin() && (
                        <div className="mb-4 flex justify-end">
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => showModal('genre')}
                            >
                                Add Genre
                            </Button>
                        </div>
                    )}
                    <Table
                        columns={getColumns('genre')}
                        dataSource={genres}
                        rowKey="id"
                        loading={loading}
                        pagination={{ 
                            pageSize: 10,
                            showSizeChanger: false,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                        }}
                        className="overflow-x-auto"
                        scroll={{ x: 700 }}
                        size="middle"
                        bordered
                    />
                </Card>
            ),
        },
        {
            key: 'albums',
            label: 'Albums',
            children: (
                <Card>
                    {isAdmin() && (
                        <div className="mb-4 flex justify-end">
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => showModal('album')}
                            >
                                Add Album
                            </Button>
                        </div>
                    )}
                    <Table
                        columns={getColumns('album')}
                        dataSource={albums}
                        rowKey="id"
                        loading={loading}
                        pagination={{ 
                            pageSize: 10,
                            showSizeChanger: false,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                        }}
                        className="overflow-x-auto"
                        scroll={{ x: 700 }}
                        size="middle"
                        bordered
                    />
                </Card>
            ),
        },
        {
            key: 'artists',
            label: 'Artists',
            children: (
                <Card>
                    {isAdmin() && (
                        <div className="mb-4 flex justify-end">
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => showModal('artist')}
                            >
                                Add Artist
                            </Button>
                        </div>
                    )}
                    <Table
                        columns={getColumns('artist')}
                        dataSource={artists}
                        rowKey="id"
                        loading={loading}
                        pagination={{ 
                            pageSize: 10,
                            showSizeChanger: false,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                        }}
                        className="overflow-x-auto"
                        scroll={{ x: 700 }}
                        size="middle"
                        bordered
                    />
                </Card>
            ),
        },
    ];

    return (
        <div className="p-6">
            <style jsx>{`
                .white-tabs .ant-tabs-tab {
                    color: white !important;
                    transition: all 0.3s ease;
                }
                
                .white-tabs .ant-tabs-tab:hover {
                    color: #EE10B0 !important;
                    text-shadow: 0 0 8px #EE10B0, 0 0 16px #EE10B0;
                    transform: translateY(-2px);
                }
                
                .white-tabs .ant-tabs-tab-active {
                    color: #EE10B0 !important;
                    text-shadow: 0 0 10px #EE10B0, 0 0 20px #EE10B0;
                }
                
                .white-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #EE10B0 !important;
                    text-shadow: 0 0 10px #EE10B0, 0 0 20px #EE10B0;
                }
                
                .white-tabs .ant-tabs-tab .ant-tabs-tab-btn {
                    color: inherit;
                    transition: all 0.3s ease;
                }
                
                .white-tabs .ant-tabs-tab:hover .ant-tabs-tab-btn {
                    color: #EE10B0 !important;
                }
                
                .white-tabs .ant-tabs-ink-bar {
                    background: linear-gradient(90deg, #EE10B0, #ff69b4) !important;
                    box-shadow: 0 0 10px #EE10B0;
                    height: 3px !important;
                }
                
                .white-tabs .ant-tabs-tab-btn:active {
                    color: #EE10B0 !important;
                    text-shadow: 0 0 15px #EE10B0, 0 0 30px #EE10B0;
                    transform: scale(0.95);
                }
            `}</style>
            <h2 className="text-2xl font-bold mb-2">Tags Management</h2>
            <p className="text-gray-600 mb-6">Manage genres, albums, and artists. Each tag must have at least 3 songs.</p>

            <Tabs 
                defaultActiveKey="genres" 
                items={tabItems} 
                tabBarGutter={24}
                size="large"
                className="white-tabs"
                tabBarStyle={{
                    color: 'white',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                style={{
                    '--tab-text-color': 'white',
                    '--tab-hover-color': '#EE10B0',
                    '--tab-active-color': '#EE10B0'
                }}
            />

            {/* Modal for Add/Edit */}
            <Modal
                title={`${editingItem ? 'Edit' : 'Add'} ${modalType}`}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={800}
                okText={editingItem ? 'Update' : 'Create'}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        label={modalType === 'album' ? 'Title' : modalType === 'genre' ? 'Title' : 'Name'}
                        name={modalType === 'album' ? 'title' : modalType === 'genre' ? 'title' : 'name'}
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    {modalType === 'album' && (
                        <Form.Item
                            label="Artist ID"
                            name="artistId"
                            rules={[{ required: true, message: 'Please select an artist!' }]}
                        >
                            <Select placeholder="Select an artist">
                                {artists.map(artist => (
                                    <Option key={artist.id} value={artist.id}>
                                        {artist.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    <Form.Item
                        label="Image URL"
                        name="img"
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>

                    <Form.Item
                        label={`Select Songs (${!editingItem ? 'minimum 3 required' : 'current: ' + selectedSongs.length})`}
                        required={!editingItem}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select songs"
                            value={selectedSongs}
                            onChange={setSelectedSongs}
                            optionFilterProp="children"
                            className="w-full"
                            maxTagCount={5}
                        >
                            {availableSongs.map(song => (
                                <Option key={song.id} value={song.id}>
                                    {song.title} - {song.artist}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}