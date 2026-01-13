import React, { useMemo, useState, useEffect } from 'react';
import { Table, Space, Button, message } from 'antd';
import useMatchingInfo from '../../hooks/useMatchingInfo';
import useDebounce from '../../hooks/useDebounce';
import formatNumber from '../../hooks/formatNumber';
import AddSongModal from './AddSongModal';
import EditSongModal from './EditSongModal';
import { useAuth } from '../context/AuthContext';

export default function SongsTable({ songs = [], onEdit, onDelete, onAdd, showUndefined = false, onRestore, suggestions = { artists: [], albums: [], genres: [] } }) {
    // Auth context for permissions
    const { canEditSongs, canDeleteSongs, canAddSongs } = useAuth();
    
    // use hook to fetch artists, albums and genres together
    const {
        artists = [],
        albums = [],
        genres = [],
        getArtistName,
        getAlbumTitle,
        getGenreName,
        loading,
        refresh,
    } = useMatchingInfo();

    // Modal state
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // table state (filters, sorter, pagination) persisted to localStorage
    const [tableState, setTableState] = useState(() => {
        try {
            const raw = localStorage.getItem('admin:songTableState');
            return raw ? JSON.parse(raw) : { filters: {}, sorter: null, pagination: { current: 1, pageSize: 10 } };
        } catch {
            return { filters: {}, sorter: null, pagination: { current: 1, pageSize: 10 } };
        }
    });

    const debouncedFilters = useDebounce(tableState.filters, 300);

    useEffect(() => {
        try {
            localStorage.setItem('admin:songTableState', JSON.stringify(tableState));
        } catch {
            // ignore storage errors
        }
    }, [tableState]);

    const dataSource = useMemo(() => {
        console.log('SongsTable - songs received:', songs);
        console.log('SongsTable - artists:', artists);
        console.log('SongsTable - albums:', albums);
        console.log('SongsTable - genres:', genres);
        
        // Check if we have songsList format (with IDs) or songs format (with names)
        const hasSongsListFormat = songs.length > 0 && songs[0].artistId;
        
        const result = (songs || []).map((s) => {
            if (hasSongsListFormat) {
                // songsList format - need to map IDs to names
                const matchedArtist = artists.find((a) => a && (a._id === s.artistId));
                const matchedAlbum = albums.find((a) => a && (a._id === s.albumId));
                const matchedGenre = genres.find((g) => g && (g._id === s.genreId));
                
                console.log(`Mapping song ${s.title}:`, {
                    genreId: s.genreId,
                    matchedGenre: matchedGenre,
                    genreTitle: matchedGenre?.title
                });
                
                return {
                    ...s,
                    title: s.title ?? s.name ?? '',
                    artist: matchedArtist?.name ?? s.artist ?? '',
                    album: matchedAlbum?.title ?? matchedAlbum?.name ?? s.album ?? '',
                    listens: s.viewCount ?? s.listens ?? s.play_count ?? 0,
                    date: s.releaseYear ?? s.release_date ?? s.date ?? '',
                    genre: matchedGenre?.title ?? matchedGenre?.name ?? s.genre ?? '', // sử dụng title từ genres
                };
            } else {
                // songs format - direct string names
                return {
                    ...s,
                    title: s.title ?? s.name ?? '',
                    artist: s.artist ?? '',
                    album: s.album ?? '',
                    listens: s.viewCount ?? s.listens ?? s.play_count ?? 0,
                    date: s.release_date ?? s.releaseYear ?? s.date ?? '',
                    genre: s.genre ?? '',
                };
            }
        });
        
        console.log('SongsTable - dataSource:', result);
        return result;
    }, [songs, artists, albums, genres]);

    // build simple filters from current rows
    const artistFilters = useMemo(() => {
        const set = new Set(dataSource.map((r) => r.artist).filter(Boolean));
        return Array.from(set).map((v) => ({ text: v, value: v }));
    }, [dataSource]);

    const albumFilters = useMemo(() => {
        const set = new Set(dataSource.map((r) => r.album).filter(Boolean));
        return Array.from(set).map((v) => ({ text: v, value: v }));
    }, [dataSource]);

    const genreFilters = useMemo(() => {
        const set = new Set(dataSource.map((r) => r.genre).filter(Boolean));
        return Array.from(set).map((v) => ({ text: v, value: v }));
    }, [dataSource]);

    const columns = useMemo(() => [
        { title: 'Song ID', dataIndex: 'id', width: 100, sorter: (a, b) => String(a._id || '').localeCompare(String(b._id || '')) },
        { title: 'Title', dataIndex: 'title', sorter: (a, b) => String(a.title || '').localeCompare(String(b.title || '')) },
        {
            title: 'Artist',
            dataIndex: 'artist',
            filters: artistFilters,
            filteredValue: debouncedFilters?.artist ?? null,
            onFilter: (value, record) => record.artist === value,
            sorter: (a, b) => String(a.artist || '').localeCompare(String(b.artist || ''))
        },
        {
            title: 'Album',
            dataIndex: 'album',
            filters: albumFilters,
            filteredValue: debouncedFilters?.album ?? null,
            onFilter: (value, record) => record.album === value,
            sorter: (a, b) => String(a.album || '').localeCompare(String(b.album || ''))
        },
        {
            title: 'Genre',
            dataIndex: 'genre',
            filters: genreFilters,
            filteredValue: debouncedFilters?.genre ?? null,
            onFilter: (value, record) => record.genre === value
        },
        { 
            title: 'View Count', 
            dataIndex: 'listens', 
            sorter: (a, b) => (a.listens || 0) - (b.listens || 0),
            render: (listens) => (
                <span className="font-medium text-blue-600">
                    {formatNumber(listens || 0)}
                </span>
            )
        },
        { title: 'Date', dataIndex: 'date', sorter: (a, b) => String(a.date || '').localeCompare(String(b.date || '')) },
        ...(showUndefined ? [{
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                if (record.isHidden) return <span style={{ color: 'red' }}>Hidden</span>;
                if (record.genreId === 'undefined') return <span style={{ color: 'orange' }}>Genre Undefined</span>;
                if (record.artistId === 'undefined') return <span style={{ color: 'orange' }}>Artist Undefined</span>;
                if (record.albumId === 'undefined') return <span style={{ color: 'orange' }}>Album Undefined</span>;
                return <span style={{ color: 'green' }}>Active</span>;
            }
        }] : []),
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {showUndefined && onRestore && (
                        <Button size="small" type="primary" onClick={() => onRestore(record._id)}>
                            Restore
                        </Button>
                    )}
                    {canEditSongs() && (
                        <Button size="small" onClick={() => handleEditClick(record)}>Edit</Button>
                    )}
                    {canDeleteSongs() && (
                        <Button danger size="small" onClick={() => onDelete && onDelete(record._id)}>Delete</Button>
                    )}
                </Space>
            )
        }
    ], [artistFilters, albumFilters, genreFilters, debouncedFilters, onEdit, onDelete, onRestore, showUndefined, canEditSongs, canDeleteSongs]);
    const handleTableChange = (pagination, filters, sorter) => {
        setTableState((prev) => ({
            ...prev,
            filters: {
                artist: filters.artist || [],
                album: filters.album || [],
                genre: filters.genre || [],
            },
            sorter,
            pagination,
        }));
    };

    // Modal handlers
    const handleAddClick = () => {
        setIsAddModalVisible(true);
    };

    const handleEditClick = (record) => {
        setEditingRecord(record);
        setIsEditModalVisible(true);
    };

    const handleAddSuccess = () => {
        setIsAddModalVisible(false);
        if (refresh) refresh();
    };

    const handleAddSubmit = async (newSong) => {
        try {
            if (onAdd) {
                await onAdd(newSong);
                handleAddSuccess();
            } else {
                throw new Error('No add handler provided');
            }
        } catch (error) {
            console.error('Error adding song:', error);
            throw error;
        }
    };

    const handleEditSuccess = () => {
        setIsEditModalVisible(false);
        setEditingRecord(null);
        if (refresh) refresh();
    };

    const handleEditSubmit = async (updatedSong) => {
        try {
            if (onEdit) {
                await onEdit(updatedSong);
                handleEditSuccess();
            } else {
                throw new Error('No edit handler provided');
            }
        } catch (error) {
            console.error('Error editing song:', error);
            throw error;
        }
    };

    return (
        <>
            {canAddSongs() && (
                <div className="mb-4">
                    <Button type="primary" onClick={handleAddClick}>
                        Add Song
                    </Button>
                </div>
            )}
            
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey={(record) => record._id ?? record.key}
                pagination={tableState.pagination ?? { pageSize: 10 }}
                loading={loading}
                onChange={handleTableChange}
            />

            {/* Modal Components */}
            {canAddSongs() && (
                <AddSongModal
                    visible={isAddModalVisible}
                    onCancel={() => setIsAddModalVisible(false)}
                    onSubmit={handleAddSubmit}
                    onSuccess={handleAddSuccess}
                    artists={artists}
                    albums={albums}
                    genres={genres}
                    suggestions={suggestions}
                    refresh={refresh}
                />
            )}

            {canEditSongs() && (
                <EditSongModal
                    visible={isEditModalVisible}
                    onCancel={() => setIsEditModalVisible(false)}
                    onSubmit={handleEditSubmit}
                    onSuccess={handleEditSuccess}
                    editingRecord={editingRecord}
                    artists={artists}
                    albums={albums}
                    genres={genres}
                    suggestions={suggestions}
                    loading={loading}
                />
            )}
        </>
    );
}