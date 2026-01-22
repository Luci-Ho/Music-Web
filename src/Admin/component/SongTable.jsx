import React, { useMemo, useState, useEffect } from "react";
import { Table, Space, Button, Tag, message } from "antd";
import useMatchingInfo from "../../hooks/useMatchingInfo";
import useDebounce from "../../hooks/useDebounce";
import formatNumber from "../../hooks/formatNumber";
import AddSongModal from "./AddSongModal";
import EditSongModal from "./EditSongModal";
import { useAuth } from "../context/AuthContext";

export default function SongsTable({
  songs = [],
  onEdit,        // ✅ REQUIRED: parent handle update
  onDelete,      // ✅ REQUIRED: parent handle delete
  onAdd,         // ✅ REQUIRED: parent handle create
  showUndefined = false,
  onRestore,     // optional
  suggestions = { artists: [], albums: [], genres: [] },
}) {
  const { canEditSongs, canDeleteSongs, canAddSongs } = useAuth();

  // ✅ dùng để map ObjectId -> label (artists/albums/genres)
  const {
    artists = [],
    albums = [],
    genres = [],
    loading,
    refresh,
  } = useMatchingInfo();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [tableState, setTableState] = useState(() => {
    try {
      const raw = localStorage.getItem("admin:songTableState");
      return raw
        ? JSON.parse(raw)
        : { filters: {}, sorter: null, pagination: { current: 1, pageSize: 10 } };
    } catch {
      return { filters: {}, sorter: null, pagination: { current: 1, pageSize: 10 } };
    }
  });

  const debouncedFilters = useDebounce(tableState.filters, 300);

  useEffect(() => {
    try {
      localStorage.setItem("admin:songTableState", JSON.stringify(tableState));
    } catch {}
  }, [tableState]);

  // ---------- map ID -> label ----------
  const getArtistLabel = (artistId) => {
    if (!artistId) return "";
    if (typeof artistId === "object") return artistId?.name || "";
    const found = artists.find((a) => String(a?._id) === String(artistId));
    return found?.name || "";
  };

  const getAlbumLabel = (albumId) => {
    if (!albumId) return "";
    if (typeof albumId === "object") return albumId?.title || albumId?.name || "";
    const found = albums.find((a) => String(a?._id) === String(albumId));
    return found?.title || found?.name || "";
  };

  const getGenreLabel = (genreId) => {
    if (!genreId) return "";
    if (typeof genreId === "object") return genreId?.title || genreId?.name || "";
    const found = genres.find((g) => String(g?._id) === String(genreId));
    return found?.title || found?.name || "";
  };

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10);
  };

  // ---------- DataSource ----------
  const dataSource = useMemo(() => {
    const list = Array.isArray(songs) ? songs : [];
    return list.map((s) => ({
      ...s,
      songId: s._id,
      title: s.title || "",
      artist: getArtistLabel(s.artistId),
      album: getAlbumLabel(s.albumId),
      genre: getGenreLabel(s.genreId),
      listens: s.viewCount ?? 0,
      date: formatDate(s.releaseDate),
      audioUrl: s.media?.audioUrl || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songs, artists, albums, genres]);

  // ---------- Filters ----------
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

  // ---------- Columns ----------
  const columns = useMemo(() => {
    return [
      {
        title: "Song ID",
        dataIndex: "songId",
        width: 140,
        sorter: (a, b) => String(a.songId || "").localeCompare(String(b.songId || "")),
        render: (id) => (
          <span title={id} style={{ fontFamily: "monospace" }}>
            {id ? String(id).slice(-8) : ""}
          </span>
        ),
      },
      {
        title: "Title",
        dataIndex: "title",
        sorter: (a, b) => String(a.title || "").localeCompare(String(b.title || "")),
      },
      {
        title: "Artist",
        dataIndex: "artist",
        filters: artistFilters,
        filteredValue: debouncedFilters?.artist ?? null,
        onFilter: (value, record) => record.artist === value,
        sorter: (a, b) => String(a.artist || "").localeCompare(String(b.artist || "")),
        render: (v) => v || <span style={{ color: "#999" }}>—</span>,
      },
      {
        title: "Album",
        dataIndex: "album",
        filters: albumFilters,
        filteredValue: debouncedFilters?.album ?? null,
        onFilter: (value, record) => record.album === value,
        sorter: (a, b) => String(a.album || "").localeCompare(String(b.album || "")),
        render: (v) => v || <span style={{ color: "#999" }}>—</span>,
      },
      {
        title: "Genre",
        dataIndex: "genre",
        filters: genreFilters,
        filteredValue: debouncedFilters?.genre ?? null,
        onFilter: (value, record) => record.genre === value,
        render: (v) => v || <span style={{ color: "#999" }}>—</span>,
      },
      {
        title: "View Count",
        dataIndex: "listens",
        sorter: (a, b) => (a.listens || 0) - (b.listens || 0),
        render: (listens) => (
          <span className="font-medium text-blue-600">{formatNumber(listens || 0)}</span>
        ),
      },
      {
        title: "Release Date",
        dataIndex: "date",
        sorter: (a, b) => String(a.date || "").localeCompare(String(b.date || "")),
        render: (v) => v || <span style={{ color: "#999" }}>—</span>,
      },
      {
        title: "Flags",
        key: "flags",
        width: 180,
        render: (_, record) => (
          <Space size={6} wrap>
            {record.isFeatured ? <Tag color="magenta">Featured</Tag> : null}
            {record.isActive === false ? <Tag color="red">Inactive</Tag> : <Tag color="green">Active</Tag>}
          </Space>
        ),
      },
      {
        title: "Audio",
        dataIndex: "audioUrl",
        width: 120,
        render: (url) =>
          url ? (
            <a href={url} target="_blank" rel="noreferrer">
              Open MP3
            </a>
          ) : (
            <span style={{ color: "#999" }}>—</span>
          ),
      },

      ...(showUndefined
        ? [
            {
              title: "Status",
              key: "status",
              width: 220,
              render: (_, record) => {
                const missing = [];
                if (!record.artistId) missing.push("Artist");
                if (!record.genreId) missing.push("Genre");
                if (!record.albumId) missing.push("Album");

                if (record.isActive === false) return <span style={{ color: "red" }}>Inactive</span>;
                if (missing.length > 0)
                  return <span style={{ color: "orange" }}>Missing: {missing.join(", ")}</span>;
                return <span style={{ color: "green" }}>OK</span>;
              },
            },
          ]
        : []),

      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space>
            {showUndefined && onRestore && (
              <Button size="small" type="primary" onClick={() => onRestore(record._id)}>
                Restore
              </Button>
            )}

            {canEditSongs() && (
              <Button size="small" onClick={() => handleEditClick(record)}>
                Edit
              </Button>
            )}

            {canDeleteSongs() && (
              <Button danger size="small" onClick={() => onDelete(record._id)}>
                Delete
              </Button>
            )}
          </Space>
        ),
      },
    ];
  }, [
    artistFilters,
    albumFilters,
    genreFilters,
    debouncedFilters,
    onDelete,
    onRestore,
    showUndefined,
    canEditSongs,
    canDeleteSongs,
  ]);

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

  // ---------- Modal handlers ----------
  const handleAddClick = () => setIsAddModalVisible(true);

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setIsEditModalVisible(true);
  };

  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    refresh?.();
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setEditingRecord(null);
    refresh?.();
  };

  // ✅ ALWAYS call parent handler (đồng nhất)
  const handleAddSubmit = async (payload) => {
    try {
      await onAdd(payload);
      message.success("Created");
      handleAddSuccess();
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Create failed");
    }
  };

  const handleEditSubmit = async (payload) => {
    try {
      await onEdit(payload);
      message.success("Updated");
      handleEditSuccess();
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Update failed");
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
        rowKey={(record) => record._id || record.songId}
        pagination={tableState.pagination ?? { pageSize: 10 }}
        loading={loading}
        onChange={handleTableChange}
      />

      {/* ✅ Add modal: luôn truyền onSubmit */}
      {canAddSongs() && (
        <AddSongModal
          visible={isAddModalVisible}
          onCancel={() => setIsAddModalVisible(false)}
          onSubmit={handleAddSubmit}     // ✅ FIX: luôn có
          onSuccess={handleAddSuccess}
          artists={artists}
          genres={genres}
          suggestions={suggestions}
          loading={loading}
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
          genres={genres}
          suggestions={suggestions}
          loading={loading}
        />
      )}
    </>
  );
}
