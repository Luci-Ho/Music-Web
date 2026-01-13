// services/home.service.js
import api from "./api"; // import axios instance đã config

export async function getHomeData() {
  try {
    const res = await api.get("/home"); // baseURL đã có sẵn trong api.js
    return res.data;
  } catch (err) {
    console.error("Home Service Error:", err);
    throw err;
  }
}