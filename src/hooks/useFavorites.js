// src/hooks/useFavorites.js
import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";
import favoriteService from "../services/favorite.service"; // ✅ đúng folder src/services

// ✅ normalize id (vì data của bạn có thể là string, object, hoặc populated doc)
const toId = (x) => {
  if (!x) return "";
  if (typeof x === "string" || typeof x === "number") return String(x);
  if (typeof x === "object") {
    // populated song doc
    if (x._id) return toId(x._id);
    // mongo style {$oid:"..."}
    if (x.$oid) return String(x.$oid);
  }
  return String(x);
};

export const useFavorites = () => {
  const { user, login, isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState(() =>
    Array.isArray(user?.favorites) ? user.favorites : []
  );

  const favoriteSet = useMemo(() => {
    const arr = Array.isArray(favorites) ? favorites : [];
    return new Set(arr.map(toId));
  }, [favorites]);

  // Load favorites từ backend khi login
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;

      try {
        const res = await favoriteService.getFavorites();
        // backend trả về mảng favorites (có thể populated song objects)
        const serverFavs = Array.isArray(res.data) ? res.data : [];
        setFavorites(serverFavs);

        // ✅ update user trong localStorage
        const nextUser = { ...(user || {}), favorites: serverFavs };
        login(nextUser);
        try {
          window.dispatchEvent(new Event("userUpdated"));
        } catch (_) {}
      } catch (err) {
        toast.error("❌ Không thể tải danh sách yêu thích");
      }
    };

    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const isFavorite = useCallback(
    (songId) => favoriteSet.has(toId(songId)),
    [favoriteSet]
  );

  const toggleFavorite = useCallback(
    async (songId) => {
      if (!isLoggedIn) {
        toast.error("Bạn cần đăng nhập để thêm vào yêu thích!");
        return;
      }

      const sid = toId(songId);
      const prev = Array.isArray(favorites) ? favorites : [];

      // optimistic update (store IDs only in UI set, but keep array mixed ok)
      const isFavNow = favoriteSet.has(sid);
      const optimistic = isFavNow
        ? prev.filter((f) => toId(f) !== sid)
        : [...prev, sid];

      setFavorites(optimistic);
      login({ ...(user || {}), favorites: optimistic });

      try {
        const res = await favoriteService.toggleFavorite(sid);
        // backend trả { action, favorites } và favorites là populated array :contentReference[oaicite:4]{index=4}
        const serverFavs = res.data?.favorites ?? [];
        setFavorites(serverFavs);
        login({ ...(user || {}), favorites: serverFavs });

        toast.success(res.data?.action === "added" ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích");
        try {
          window.dispatchEvent(new Event("userUpdated"));
        } catch (_) {}
      } catch (err) {
        // rollback
        setFavorites(prev);
        login({ ...(user || {}), favorites: prev });
        toast.error("Không thể cập nhật yêu thích. Vui lòng thử lại.");
      }
    },
    [favorites, favoriteSet, isLoggedIn, login, user]
  );

  return { favorites, toggleFavorite, isFavorite };
};

export default useFavorites;
