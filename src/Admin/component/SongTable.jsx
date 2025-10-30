import React, { useMemo } from 'react';
import { Table, Space, Button } from 'antd';
import useMatchingInfo from '../../hooks/useMatchingInfo';

export default function SongsTable({ songs , onEdit, onDelete }) {

    // fetch matching lists for artists, albums and genres
    const artistsHook = useMatchingInfo([], 'artists');
    const albumsHook = useMatchingInfo([], 'albums');
    const genresHook = useMatchingInfo([], 'genres');

    

    const getArtistTitle = artistsHook.getSourceTitle;
    const getAlbumTitle = albumsHook.getSourceTitle;
    const getGenreTitle = genresHook.getSourceTitle;

    const findBySource = artistsHook.findBySource;

    const columns = [
        { title: '#', dataIndex: 'index', width: 60, render: (_, __, idx) => idx + 1 },
        { title: 'Title', dataIndex: 'title', sorter: (a, b) => String(a.title || '').localeCompare(String(b.title || '')) },
        { title: 'Artist', dataIndex: 'artist', sorter: (a, b) => String(a.artist || '').localeCompare(String(b.artist || '')) },
        { title: 'Album', dataIndex: 'album', sorter: (a, b) => String(a.album || '').localeCompare(String(b.album || '')) },
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
    ];

    const dataSource = useMemo(() => {
        const artistsList = artistsHook.source || [];
        const albumsList = albumsHook.source || [];
        const genresList = genresHook.source || [];

        return (songs || []).map((s) => {
            const matchedArtist = findBySource(artistsList, { sourceid: 'id', id: s.artist });
            const artistName = matchedArtist?.name ?? matchedArtist?.title ?? getArtistTitle(s.artist) ?? s.artist ?? s.artist_name ?? '';

            const matchedAlbum = findBySource(albumsList, { sourceid: 'id', id: s.album });
            const albumName = matchedAlbum?.title ?? matchedAlbum?.name ?? getAlbumTitle(s.album) ?? s.album ?? s.album_title ?? '';

            const matchedGenre = findBySource(genresList, { sourceid: 'id', id: s.genre });
            const genreName = matchedGenre?.name ?? getGenreTitle(s.genre) ?? s.genre ?? s.genre_name ?? '';

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
    }, [songs, artistsHook.source, albumsHook.source, genresHook.source, getArtistTitle, getAlbumTitle, getGenreTitle, findBySource]);

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            rowKey={(record) => record.id ?? record.key}
            pagination={{ pageSize: 10 }}
        />
    );
}