import client from "./client";

const unwrapList = (payload) => {
  // payload có thể là: Array | {data:Array} | {meta, data:Array} | {songs:Array}
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.songs)) return payload.songs;
  return [];
};

const unwrapOne = (payload) => {
  if (!payload) return null;
  // nếu BE trả {data: {...}}
  if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) return payload.data;
  return payload;
};

export const adminGetSongs = async (params) => {
  const res = await client.get("/songs", { params });
  return unwrapList(res.data);
};

export const adminGetSongById = async (id) => {
  const res = await client.get(`/songs/${id}`);
  return unwrapOne(res.data);
};

// ⚠️ Chỉ dùng được nếu BE đã mở POST /api/songs
export const adminCreateSong = async (payload) => {
  const res = await client.post("/songs", payload);
  return unwrapOne(res.data);
};

// ⚠️ Backend của bạn đang dùng PATCH (controller updateSong) -> dùng patch
export const adminUpdateSong = async (id, payload) => {
  const res = await client.patch(`/songs/${id}`, payload);
  return unwrapOne(res.data);
};

export const adminDeleteSong = async (id) => {
  const res = await client.delete(`/songs/${id}`);
  return res.data;
};
