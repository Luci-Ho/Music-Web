import api from "./api"; // import từ file api.js

export async function getDiscoverData() {
  try {
    const res = await api.get("/discover"); // không cần API_BASE nữa
    return res.data;
  } catch (err) {
    console.error("Discover Service Error:", err);
    throw err;
  }
}