import client from "./client";

const unwrapList = (payload) => {
  // Case 1: Array trực tiếp
  if (Array.isArray(payload)) return payload;

  // Case 2: { data: Array }
  if (Array.isArray(payload?.data)) return payload.data;

  // Case 3: { meta, data: Array }
  if (Array.isArray(payload?.data)) return payload.data;

  // Case 4: { meta, data: { data: Array } }
  if (Array.isArray(payload?.data?.data)) return payload.data.data;

  // Case 5: { data: { users: Array } } hoặc { users: Array }
  if (Array.isArray(payload?.data?.users)) return payload.data.users;
  if (Array.isArray(payload?.users)) return payload.users;

  // Case 6: { data: { items: Array } } hoặc { items: Array }
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
};

const unwrapOne = (payload) => {
  if (!payload) return null;
  if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) return payload.data;
  return payload;
};

export const adminGetUsers = async (params) => {
  const res = await client.get("/users", { params });
  return unwrapList(res.data);
};

export const adminUpdateUser = async (id, payload) => {
  const res = await client.patch(`/users/${id}`, payload);
  return unwrapOne(res.data);
};

export const adminDeleteUser = async (id) => {
  const res = await client.delete(`/users/${id}`);
  return res.data;
};
