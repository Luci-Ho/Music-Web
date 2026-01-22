import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Table,
  Space,
  Popconfirm,
  message,
  Tag,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Option } = Select;
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/** ---------- Helpers ---------- */
const toId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return String(v._id || v.id || v.legacyId || "");
  return String(v);
};

const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return null;
  if (text.trim().startsWith("<")) return null; // HTML error page
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const normalizeArray = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  return [];
};

const displayId = (tag) =>
  tag?.legacyId || tag?.id || (tag?._id ? String(tag._id).slice(-6) : "—");

const songLabel = (song) => {
  const title = song?.title || "Untitled";
  const artist =
    song?.artistName ||
    song?.artist?.name ||
    song?.artistId?.name ||
    "";
  const genre =
    song?.genreTitle ||
    song?.genre?.title ||
    song?.genreId?.title ||
    "";
  const album =
    song?.albumTitle ||
    song?.album?.title ||
    song?.albumId?.title ||
    "";

  // format như hình bạn gửi: Title • Artist • Genre • Album
  const parts = [title, artist, genre, album].filter(Boolean);
  return parts.join(" • ");
};

const patchSong = async (songId, body) => {
  const res = await fetch(`${API_BASE}/songs/${songId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
};

export default function TagsView() {
  const { isAdmin, isModerator } = useAuth();

  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);

  const [loading, setLoading] = useState(false);

  // modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // genre|album|artist
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [form] = Form.useForm();

  /** ---------- Load all ---------- */
  const loadData = async () => {
    setLoading(true);
    try {
      const [gRes, alRes, arRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/genres`),
        fetch(`${API_BASE}/albums`),
        fetch(`${API_BASE}/artists`),
        fetch(`${API_BASE}/songs`),
      ]);

      const [gJson, alJson, arJson, sJson] = await Promise.all([
        safeJson(gRes),
        safeJson(alRes),
        safeJson(arRes),
        safeJson(sRes),
      ]);

      setGenres(normalizeArray(gJson));
      setAlbums(normalizeArray(alJson));
      setArtists(normalizeArray(arJson));
      setSongs(normalizeArray(sJson));
    } catch (e) {
      console.error(e);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /** ---------- Association logic (IMPORTANT) ---------- */
  const getSongTagId = (song, type) => {
    if (type === "genre") return toId(song?.genreId?._id ? song.genreId : song?.genreId);
    if (type === "artist") return toId(song?.artistId?._id ? song.artistId : song?.artistId);
    if (type === "album") return toId(song?.albumId?._id ? song.albumId : song?.albumId);
    return "";
  };

  const isSongBelongsToTag = (song, type, tag) => {
    const tagId = toId(tag?._id);
    const songTagId = getSongTagId(song, type);

    // primary match by ObjectId
    if (tagId && songTagId && String(tagId) === String(songTagId)) return true;

    // fallback cho data legacy (nếu còn)
    if (type === "genre") {
      const t = (tag?.title || "").toLowerCase();
      const s = (song?.genre || "").toLowerCase();
      if (t && s && s === t) return true;
    }
    if (type === "artist") {
      const t = (tag?.name || "").toLowerCase();
      const s = (song?.artist || song?.artistName || "").toLowerCase();
      if (t && s && s === t) return true;
    }
    if (type === "album") {
      const t = (tag?.title || "").toLowerCase();
      const s = (song?.album || song?.albumTitle || "").toLowerCase();
      if (t && s && s === t) return true;
    }

    return false;
  };

  const songsOfTag = useMemo(() => {
    // build quick map: type -> tagId -> songs[]
    const map = { genre: new Map(), artist: new Map(), album: new Map() };
    const all = Array.isArray(songs) ? songs : [];

    ["genre", "artist", "album"].forEach((type) => {
      all.forEach((song) => {
        const sid = toId(song?._id);
        if (!sid) return;

        const tagId = getSongTagId(song, type);
        if (!tagId) return;

        const key = String(tagId);
        if (!map[type].has(key)) map[type].set(key, []);
        map[type].get(key).push(song);
      });
    });

    return map;
  }, [songs]);

  const getAssociatedSongs = (type, tag) => {
    const tid = String(toId(tag?._id));
    const list = songsOfTag?.[type]?.get(tid) || [];

    // fallback scan nếu chưa map được (data legacy)
    if (list.length > 0) return list;

    return (songs || []).filter((s) => isSongBelongsToTag(s, type, tag));
  };

  /** ---------- Modal open/close ---------- */
  const showModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalVisible(true);

    if (item) {
      form.setFieldsValue(item);

      const associated = getAssociatedSongs(type, item);
      const ids = associated.map((s) => String(s._id)).filter(Boolean);
      setSelectedSongs(ids);
    } else {
      form.resetFields();
      setSelectedSongs([]);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    setSelectedSongs([]);
    form.resetFields();
  };

  /** ---------- CRUD endpoints ---------- */
  const endpointForType = (type) => {
    if (type === "genre") return `${API_BASE}/genres`;
    if (type === "artist") return `${API_BASE}/artists`;
    return `${API_BASE}/albums`;
  };

  const tagNameField = (type) => (type === "artist" ? "name" : "title");

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // create: require >= 3 songs
      if (!editingItem && selectedSongs.length < 3) {
        message.error("Please select at least 3 songs");
        return;
      }

      const ep = endpointForType(modalType);
      const nameKey = tagNameField(modalType);

      let savedTag = null;

      if (editingItem) {
        // update tag info
        const res = await fetch(`${ep}/${editingItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editingItem, ...values }),
        });
        const json = await safeJson(res);
        if (!res.ok || !json?._id) throw new Error("Update tag failed");
        savedTag = json;
      } else {
        // create tag
        const payload = { ...values };
        const res = await fetch(ep, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await safeJson(res);
        if (!res.ok || !json?._id) throw new Error("Create tag failed");
        savedTag = json;
      }

      // update song associations (add + remove)
      const currentlyAssociatedIds = editingItem
        ? getAssociatedSongs(modalType, editingItem).map((s) => String(s._id))
        : [];

      const nextIds = selectedSongs.map(String);

      const toAdd = nextIds.filter((id) => !currentlyAssociatedIds.includes(id));
      const toRemove = currentlyAssociatedIds.filter((id) => !nextIds.includes(id));

      const tagId = savedTag._id;

      // what to set in song
      const setBody =
        modalType === "genre"
          ? { genreId: tagId, isHidden: false }
          : modalType === "artist"
          ? { artistId: tagId, isHidden: false }
          : { albumId: tagId, isHidden: false };

      // remove: set null + hide to go undefined list
      const removeBody =
        modalType === "genre"
          ? { genreId: null, isHidden: true }
          : modalType === "artist"
          ? { artistId: null, isHidden: true }
          : { albumId: null, isHidden: true };

      await Promise.all([
        ...toAdd.map((id) => patchSong(id, setBody)),
        ...toRemove.map((id) => patchSong(id, removeBody)),
      ]);

      message.success(`${modalType} ${editingItem ? "updated" : "created"} successfully`);
      await loadData();
      closeModal();
    } catch (e) {
      console.error(e);
      message.error(`Failed to ${editingItem ? "update" : "create"} ${modalType}`);
    }
  };

  const deleteItem = async (type, item) => {
    try {
      const ep = endpointForType(type);

      const associated = getAssociatedSongs(type, item);
      const ids = associated.map((s) => String(s._id));

      const removeBody =
        type === "genre"
          ? { genreId: null, isHidden: true }
          : type === "artist"
          ? { artistId: null, isHidden: true }
          : { albumId: null, isHidden: true };

      await Promise.all(ids.map((id) => patchSong(id, removeBody)));

      await fetch(`${ep}/${item._id}`, { method: "DELETE" });

      message.success(`${type} deleted. ${ids.length} songs moved to undefined/hidden.`);
      loadData();
    } catch (e) {
      console.error(e);
      message.error(`Failed to delete ${type}`);
    }
  };

  /** ---------- Dropdown menu ---------- */
  const getSongsDropdown = (type, tag) => {
    const associated = getAssociatedSongs(type, tag);

    if (!associated.length) {
      return {
        items: [{ key: "empty", label: "No songs found", disabled: true }],
      };
    }

    return {
      items: associated.slice(0, 30).map((s) => ({
        key: String(s._id),
        label: s.title || "(untitled)",
      })),
    };
  };

  /** ---------- Table columns ---------- */
  const getColumns = (type) => [
    {
      title: "ID",
      key: "id",
      width: 120,
      align: "center",
      render: (_, record) => <span style={{ fontFamily: "monospace" }}>{displayId(record)}</span>,
    },
    {
      title: type === "artist" ? "Name" : "Title",
      key: "name",
      width: 240,
      ellipsis: true,
      render: (_, record) => record?.[type === "artist" ? "name" : "title"] || "—",
    },
    {
      title: "Songs Count",
      key: "songsCount",
      width: 140,
      align: "center",
      render: (_, record) => {
        const count = getAssociatedSongs(type, record).length;
        return <Tag color={count === 0 ? "red" : "blue"}>{count}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Dropdown
            menu={getSongsDropdown(type, record)}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <Button icon={<EyeOutlined />} size="small">
              View <DownOutlined />
            </Button>
          </Dropdown>

          {(isAdmin() || isModerator()) && (
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(type, record)}
            >
              Edit
            </Button>
          )}

          {isAdmin() && (
            <Popconfirm
              title={`Delete this ${type}?`}
              description="Associated songs will be moved to undefined/hidden."
              okText="Yes"
              نشان
              cancelText="No"
              onConfirm={() => deleteItem(type, record)}
            >
              <Button icon={<DeleteOutlined />} size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const availableSongs = useMemo(() => {
    return (songs || []).filter((s) => !s?.isHidden);
  }, [songs]);

  /** ---------- Tabs ---------- */
  const tabItems = [
    {
      key: "genres",
      label: "Genres",
      children: (
        <Card>
          {isAdmin() && (
            <div className="mb-4 flex justify-end">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal("genre")}>
                Add Genre
              </Button>
            </div>
          )}
          <Table
            columns={getColumns("genre")}
            dataSource={genres}
            rowKey={(r) => r._id}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 700 }}
            bordered
          />
        </Card>
      ),
    },
    {
      key: "albums",
      label: "Albums",
      children: (
        <Card>
          {isAdmin() && (
            <div className="mb-4 flex justify-end">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal("album")}>
                Add Album
              </Button>
            </div>
          )}
          <Table
            columns={getColumns("album")}
            dataSource={albums}
            rowKey={(r) => r._id}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 700 }}
            bordered
          />
        </Card>
      ),
    },
    {
      key: "artists",
      label: "Artists",
      children: (
        <Card>
          {isAdmin() && (
            <div className="mb-4 flex justify-end">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal("artist")}>
                Add Artist
              </Button>
            </div>
          )}
          <Table
            columns={getColumns("artist")}
            dataSource={artists}
            rowKey={(r) => r._id}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 700 }}
            bordered
          />
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6">
      <style>{`
        .white-tabs .ant-tabs-tab { color: white !important; transition: all .3s ease; }
        .white-tabs .ant-tabs-tab:hover { color: #EE10B0 !important; text-shadow: 0 0 8px #EE10B0, 0 0 16px #EE10B0; transform: translateY(-2px); }
        .white-tabs .ant-tabs-tab-active,
        .white-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #EE10B0 !important; text-shadow: 0 0 10px #EE10B0, 0 0 20px #EE10B0; }
        .white-tabs .ant-tabs-ink-bar { background: linear-gradient(90deg, #EE10B0, #ff69b4) !important; box-shadow: 0 0 10px #EE10B0; height: 3px !important; }
      `}</style>

      <h2 className="text-2xl font-bold mb-2">Tags Management</h2>
      <p className="text-gray-600 mb-6">
        Manage genres, albums, and artists. Each tag must have at least 3 songs (when creating).
      </p>

      <Tabs
        defaultActiveKey="genres"
        items={tabItems}
        size="large"
        className="white-tabs"
        tabBarStyle={{ borderBottom: "1px solid rgba(255,255,255,.2)" }}
      />

      {/* Modal */}
      <Modal
        title={`${editingItem ? "Edit" : "Add"} ${modalType}`}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={closeModal}
        width={800}
        okText={editingItem ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={modalType === "artist" ? "Name" : "Title"}
            name={modalType === "artist" ? "name" : "title"}
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input />
          </Form.Item>

          {modalType === "album" && (
            <Form.Item
              label="Artist"
              name="artistId"
              rules={[{ required: true, message: "Please select an artist!" }]}
            >
              <Select placeholder="Select an artist">
                {artists.map((a) => (
                  <Option key={a._id} value={a._id}>
                    {a.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item label="Image URL" name="img">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item
            label={`Select Songs (${editingItem ? `current: ${selectedSongs.length}` : "minimum 3 required"})`}
            required={!editingItem}
          >
            <Select
              mode="multiple"
              placeholder="Select songs"
              value={selectedSongs}
              onChange={(v) => setSelectedSongs(v)}
              optionFilterProp="children"
              maxTagCount={5}
              className="w-full"
              showSearch
              filterOption={(input, option) =>
                String(option?.children || "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableSongs.map((s) => (
                <Option key={String(s._id)} value={String(s._id)}>
                  {songLabel(s)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
