import React, { useState } from "react";
import { Modal, Form, Input, Select, AutoComplete, message, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import client from "../api/client"; // ✅ axios client chung

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUD_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || "melody/audio";

export default function AddSongModal({
  visible,
  onCancel,
  onSubmit,     // ✅ bắt buộc: parent sẽ POST /songs
  onSuccess,
  artists = [],
  genres = [],
  loading = false,
  suggestions = { artists: [], albums: [], genres: [] },
}) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // MP3 state
  const [audioFile, setAudioFile] = useState(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

  const validateArtistName = (name) => {
    if (!name || typeof name !== "string") return null;
    const cleaned = name.trim().replace(/[<>"/\\|?*:]/g, "");
    if (cleaned.length < 1 || cleaned.length > 100) return null;
    return cleaned;
  };

  // ✅ Create Artist via backend: POST /api/artists
  async function createArtist(name) {
    const res = await client.post("/artists", {
      name,
      img: "https://via.placeholder.com/150?text=New+Artist",
    });
    return res.data;
  }

  async function findOrCreatePrimaryArtistId(rawName) {
    const name = validateArtistName(rawName);
    if (!name) return null;

    const existing = (artists || []).find(
      (a) => (a?.name || "").toLowerCase() === name.toLowerCase()
    );
    if (existing?._id) return existing._id;

    const created = await createArtist(name);
    if (!created?._id) throw new Error("Artist created but missing _id");
    message.success(`Created new artist: ${name}`);
    return created._id;
  }

  // ✅ Upload MP3 to Cloudinary (Unsigned preset)
  async function uploadAudioToCloudinary(file) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error("Missing Cloudinary env: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET");
    }

    // audio -> dùng video/upload
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    fd.append("folder", CLOUD_FOLDER);

    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    if (!data?.secure_url) throw new Error("Cloudinary upload ok but missing secure_url");
    return data.secure_url;
  }

  async function handleUploadAudio() {
    if (!audioFile) {
      message.warning("Please choose an MP3 file first.");
      return;
    }
    try {
      setAudioUploading(true);
      const url = await uploadAudioToCloudinary(audioFile);
      setAudioUrl(url);
      message.success("MP3 uploaded successfully!");
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Upload MP3 failed");
    } finally {
      setAudioUploading(false);
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      const title = values.title?.trim();
      if (!title) throw new Error("Missing title");

      // Primary artist
      const artistNames = Array.isArray(values.artists) ? values.artists : [values.artists];
      const primaryArtistName = artistNames?.[0];
      const artistId = await findOrCreatePrimaryArtistId(primaryArtistName);
      if (!artistId) throw new Error("Invalid artist name");

      // Primary genre (optional nếu BE cho phép null, nhưng UI đang required)
      const selectedGenres = Array.isArray(values.genres) ? values.genres : [values.genres];
      const primaryGenreTitle = selectedGenres?.[0] || null;

      const genreDoc = (genres || []).find((g) => (g?.title || g?.name) === primaryGenreTitle);
      const genreId = genreDoc?._id || null;

      // Album: hiện bạn đang để text -> BE cần ObjectId, tạm null
      const albumId = null;

      // nếu muốn bắt buộc phải upload mp3 trước khi add:
      // if (!audioUrl) throw new Error("Please upload an MP3 first.");

      // ✅ Payload đúng schema BE
      const payload = {
        title,
        artistId,
        albumId,
        genreId,
        moodId: null,

        releaseDate: new Date(),
        duration: "3:30",
        lyrics: "",

        media: {
          image: "https://via.placeholder.com/300?text=New+Song",
          audioUrl: audioUrl || "",
          videoUrl: "",
          videoThumbnail: "",
        },

        isActive: true,
        isFeatured: false,
        viewCount: 0,
      };

      if (!onSubmit) throw new Error("Missing onSubmit prop in AddSongModal");

      await onSubmit(payload);

      message.success(`Added song "${title}"`);
      form.resetFields();
      setAudioFile(null);
      setAudioUrl("");
      onSuccess?.();
      onCancel?.();
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Failed to add song");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAudioFile(null);
    setAudioUrl("");
    onCancel?.();
  };

  return (
    <Modal
      title="Add New Song"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={650}
      confirmLoading={submitting}
      okText="Add Song"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: "Please enter song title!" },
            { min: 1, max: 100, message: "Title must be between 1 and 100 characters" },
          ]}
        >
          <Input placeholder="Enter song title" disabled={submitting} />
        </Form.Item>

        <Form.Item
          label="Artist (primary)"
          name="artists"
          rules={[{ required: true, message: "Please select at least one artist!" }]}
          extra="First artist will be used as primary (artistId). New artist will be created if not exists."
        >
          <Select mode="tags" placeholder="Enter or select artists" disabled={submitting} tokenSeparators={[","]}>
            {(suggestions?.artists || []).map((a) => (
              <Select.Option key={a._id || a.value} value={a.value || a.name}>
                {a.label || a.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Album (optional text)"
          name="album"
          rules={[{ max: 100, message: "Album name must be less than 100 characters" }]}
          extra="Backend expects albumId(ObjectId). Current UI sends albumId = null."
        >
          <AutoComplete
            placeholder="Enter or select album name (optional)"
            disabled={submitting}
            options={suggestions?.albums || []}
            filterOption={(inputValue, option) =>
              (option?.label || "").toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Genre"
          name="genres"
          rules={[{ required: true, message: "Please select at least one genre!" }]}
        >
          <Select mode="multiple" placeholder="Select genres" disabled={submitting || loading}>
            {(suggestions?.genres || []).map((g) => (
              <Select.Option key={g._id || g.value} value={g.value || g.title}>
                {g.label || g.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* MP3 Upload */}
        <Form.Item
          label="MP3 File (upload to Cloudinary)"
          extra="Using Cloudinary unsigned upload preset (frontend upload)."
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Upload
              beforeUpload={(file) => {
                const isMp3 = file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3");
                if (!isMp3) {
                  message.error("Only MP3 files are allowed!");
                  return Upload.LIST_IGNORE;
                }
                setAudioFile(file);
                setAudioUrl("");
                return false;
              }}
              maxCount={1}
              showUploadList={{ showRemoveIcon: true }}
              onRemove={() => {
                setAudioFile(null);
                setAudioUrl("");
              }}
            >
              <Button icon={<UploadOutlined />} disabled={submitting}>
                Choose MP3
              </Button>
            </Upload>

            <Button
              type="primary"
              onClick={handleUploadAudio}
              loading={audioUploading}
              disabled={!audioFile || submitting}
            >
              Upload MP3
            </Button>
          </div>

          {audioUrl ? (
            <div style={{ marginTop: 8 }}>
              ✅ Uploaded URL:{" "}
              <a href={audioUrl} target="_blank" rel="noreferrer">
                {audioUrl}
              </a>
            </div>
          ) : (
            <div style={{ marginTop: 8, color: "#999" }}>
              {audioFile ? `Selected: ${audioFile.name}` : "No MP3 selected yet."}
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
