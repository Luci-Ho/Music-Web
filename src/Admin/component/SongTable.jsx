import React, { useMemo, useState, useEffect } from 'react';
import { Table, Space, Button } from 'antd';
import useMatchingInfo from '../../hooks/useMatchingInfo';
import useDebounce from '../../hooks/useDebounce';

export default function SongsTable({ songs = [], onEdit, onDelete }) {
    // use hook to fetch artists, albums and genres together
    const {
        artists = [],
        albums = [],
        genres = [],
        getArtistName,
        getAlbumTitle,
        getGenreName,
        loading,
    } = useMatchingInfo();

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
        const artistsList = artists || [];
        const albumsList = albums || [];
        const genresList = genres || [];

        return (songs || []).map((s) => {
            const matchedArtist = artistsList.find((a) => a && (a.id === s.artist || String(a.id) === String(s.artist)));
            const artistName = matchedArtist?.name ?? getArtistName(s.artist) ?? s.artist ?? s.artist_name ?? '';

            const matchedAlbum = albumsList.find((a) => a && (a.id === s.album || String(a.id) === String(s.album)));
            const albumName = matchedAlbum?.title ?? matchedAlbum?.name ?? getAlbumTitle(s.album) ?? s.album ?? s.album_title ?? '';

            const matchedGenre = genresList.find((g) => g && (g.id === s.genre || String(g.id) === String(s.genre)));
            const genreName = matchedGenre?.name ?? getGenreName(s.genre) ?? s.genre ?? s.genre_name ?? '';

            return {
                ...s,
                title: s.title ?? s.name ?? '',
                artist: artistName,
                album: albumName,
                listens: s.listens ?? s.play_count ?? 0,
                date: s.release_date ?? s.releaseYear ?? s.date ?? '',
                genre: genreName,
            };
        });
    }, [songs, artists, albums, genres, getArtistName, getAlbumTitle, getGenreName]);

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
        { title: '#', dataIndex: 'index', width: 60, render: (_, __, idx) => idx + 1 },
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
        { title: 'Listens', dataIndex: 'listens', sorter: (a, b) => (a.listens || 0) - (b.listens || 0) },
        { title: 'Date', dataIndex: 'date', sorter: (a, b) => String(a.date || '').localeCompare(String(b.date || '')) },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => onEdit && onEdit(record)}>Edit</Button>
                    <Button danger size="small" onClick={() => onDelete && onDelete(record.id)}>Delete</Button>
                </Space>
            )
        }
    ], [artistFilters, albumFilters, genreFilters, debouncedFilters, onEdit, onDelete]);
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

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            rowKey={(record) => record.id ?? record.key}
            pagination={tableState.pagination ?? { pageSize: 10 }}
            loading={loading}
            onChange={handleTableChange}
        />
    );
}