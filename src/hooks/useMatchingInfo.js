import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Hook: useMatchingInfo
// Fetches matching datasets used across components (currently: artists)
// Returns: { artists, getArtistName, loading, error, refresh }
export default function useMatchingInfo() {
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [genres, setGenres] = useState([]);

    const [loadingArtists, setLoadingArtists] = useState(true);
    const [loadingAlbums, setLoadingAlbums] = useState(true);
    const [loadingGenres, setLoadingGenres] = useState(true);

    const loading = loadingArtists || loadingAlbums || loadingGenres;

    const [errorArtists, setErrorArtists] = useState(null);
    const [errorAlbums, setErrorAlbums] = useState(null);
    const [errorGenres, setErrorGenres] = useState(null);
    const error = errorArtists || errorAlbums || errorGenres;

    const fetchArtists = useCallback(() => {
        setLoadingArtists(true);
        setErrorArtists(null);

         api.get('/artists')
    .then((res) => {
      setArtists(Array.isArray(res.data) ? res.data : []);
      setLoadingArtists(false);
    })
    .catch((err) => {
      setArtists([]);
      setErrorArtists(err?.response?.data?.message || err.message);
      setLoadingArtists(false);
    });
}, []);

    const fetchAlbums = useCallback(() => {
        setLoadingAlbums(true);
        setErrorAlbums(null);

        api.get('/albums')
            .then((res) => {
                setAlbums(Array.isArray(res.data) ? res.data : []);
                setLoadingAlbums(false);
            })
            .catch((err) => {
                setAlbums([]);
                setErrorAlbums(err?.response?.data?.message ?? String(err));
                setLoadingAlbums(false);
            });
    }, []);

    const fetchGenres = useCallback(() => {
        setLoadingGenres(true);
        setErrorGenres(null);

        api.get('/genres')
                .then((res) => {
                setGenres(Array.isArray(res.data) ? res.data : []);
                setLoadingGenres(false);
            })
            .catch((err) => {
                setGenres([]);
                setErrorGenres(err?.response?.data?.message ?? String(err));
                setLoadingGenres(false);
            });
    }, []);

    useEffect(() => {
        fetchArtists();
        fetchAlbums();
        fetchGenres();
    }, [fetchArtists, fetchAlbums, fetchGenres]);

    const getArtistName = useCallback(
        (id) => {
            if (id == null) return '';
            const found = artists.find((a) => a && (a._id === id || String(a._id) === String(id)));
            return found?.name ?? '';
        },
        [artists]
    );

    const getAlbumTitle = useCallback(
        (id) => {
            if (id == null) return '';
            const found = albums.find((a) => a && (a._id === id || String(a._id) === String(id)));
            return found?.title ?? found?.name ?? '';
        },
        [albums]
    );

    const getGenreName = useCallback(
        (id) => {
            if (id == null) return '';
            const found = genres.find((g) => g && (g._id === id || String(g._id) === String(id)));
            return found?.title ?? found?.name ?? ''; // sử dụng title trước, fallback name
        },
        [genres]
    );

    const refresh = useCallback(() => {
        fetchArtists();
        fetchAlbums();
        fetchGenres();
    }, [fetchArtists, fetchAlbums, fetchGenres]);

    return {
        artists,
        albums,
        genres,
        getArtistName,
        getAlbumTitle,
        getGenreName,
        loading,
        error,
        refresh,
        refreshArtists: fetchArtists,
        refreshAlbums: fetchAlbums,
        refreshGenres: fetchGenres,
    };
}
