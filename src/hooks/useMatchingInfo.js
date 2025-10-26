import { useState, useEffect, useCallback } from 'react';

// Hook: useMatchingInfo
// Fetches matching datasets used across components (currently: artists)
// Returns: { artists, getArtistName, loading, error, refresh }
export default function useMatchingInfo() {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArtists = useCallback(() => {
        setLoading(true);
        setError(null);
        fetch('http://localhost:4000/artists')
            .then((res) => {
                if (!res.ok) throw new Error('Tìm Nghệ Sĩ Không Ra');
                return res.json();
            })
            .then((data) => {
                setArtists(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                setArtists([]);
                setError(err?.message ?? String(err));
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchArtists();
    }, [fetchArtists]);

    const getArtistName = useCallback(
        (id) => {
            if (id == null) return '';
            // allow numeric or string IDs and match loosely
            const found = artists.find((a) => a.id === id || String(a.id) === String(id));
            return found?.name ?? '';
        },
        [artists]
    );

    return {
        artists,
        getArtistName,
        loading,
        error,
        refresh: fetchArtists,
    };
}
