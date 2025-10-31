import { useState, useEffect, useCallback } from 'react';

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
        fetch('http://localhost:4000/artists')
            .then((res) => {
                if (!res.ok) throw new Error('Tìm Nghệ Sĩ Không Ra');
                return res.json();
            })
            .then((data) => {
                setArtists(Array.isArray(data) ? data : []);
                setLoadingArtists(false);
            })
            .catch((err) => {
                setArtists([]);
                setErrorArtists(err?.message ?? String(err));
                setLoadingArtists(false);
            });
    }, []);

    const fetchAlbums = useCallback(() => {
        setLoadingAlbums(true);
        setErrorAlbums(null);
        fetch('http://localhost:4000/albums')
            .then((res) => {
                if (!res.ok) throw new Error('Tìm Album Không Ra');
                return res.json();
            })
            .then((data) => {
                setAlbums(Array.isArray(data) ? data : []);
                setLoadingAlbums(false);
            })
            .catch((err) => {
                setAlbums([]);
                setErrorAlbums(err?.message ?? String(err));
                setLoadingAlbums(false);
            });
    }, []);

    const fetchGenres = useCallback(() => {
        setLoadingGenres(true);
        setErrorGenres(null);
        fetch('http://localhost:4000/genres')
            .then((res) => {
                if (!res.ok) throw new Error('Tìm Thể Loại Không Ra');
                return res.json();
            })
            .then((data) => {
                setGenres(Array.isArray(data) ? data : []);
                setLoadingGenres(false);
            })
            .catch((err) => {
                setGenres([]);
                setErrorGenres(err?.message ?? String(err));
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
            const found = artists.find((a) => a && (a.id === id || String(a.id) === String(id)));
            return found?.name ?? '';
        },
        [artists]
    );

    const getAlbumTitle = useCallback(
        (id) => {
            if (id == null) return '';
            const found = albums.find((a) => a && (a.id === id || String(a.id) === String(id)));
            return found?.title ?? found?.name ?? '';
        },
        [albums]
    );

    const getGenreName = useCallback(
        (id) => {
            if (id == null) return '';
            const found = genres.find((g) => g && (g.id === id || String(g.id) === String(id)));
            return found?.name ?? '';
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
