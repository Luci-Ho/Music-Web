import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";
import favoriteService from "../services/favorite.service";

export const normalizeId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return String(v._id || v.id || v.legacyId || "");
  return String(v);
};

const useFavorites = () => {
  const { user, login, isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState([]);

  const hydrateFromUser = useCallback((u) => {
    const fav = Array.isArray(u?.favorites) ? u.favorites : [];
    setFavorites(fav);
  }, []);

  // init favorites từ user local trước
  useEffect(() => {
    hydrateFromUser(user);
  }, [user, hydrateFromUser]);

  // load favorites từ backend khi đã login
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await favoriteService.getFavorites();
        const favArr = Array.isArray(res.data) ? res.data : [];
        setFavorites(favArr);

        // update user local (giữ nguyên fields khác)
        const updatedUser = { ...(user || {}), favorites: favArr };
        login(updatedUser);

        try {
          window.dispatchEvent(new Event("userUpdated"));
        } catch {}
      } catch (err) {
        toast.error("❌ Không thể tải danh sách yêu thích");
      }
    };

    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const isFavorite = (songId) => {
    const sid = String(songId);
    return favorites.some((fav) => toId(fav) === sid);
  };

  const toggleFavorite = async (songId) => {
    if (!isLoggedIn) {
      toast.error("Bạn cần đăng nhập để thêm vào yêu thích!");
      return;
    }

    const sid = String(songId);
    const prev = favorites;

    // optimistic
    const next = isFavorite(sid)
      ? prev.filter((fav) => toId(fav) !== sid)
      : [...prev, sid];

    setFavorites(next);
    login({ ...(user || {}), favorites: next });
    try {
      window.dispatchEvent(new Event("userUpdated"));
    } catch {}

    try {
      const res = await favoriteService.toggleFavorite(sid);
      const serverFavorites = Array.isArray(res.data?.favorites)
        ? res.data.favorites
        : [];

      setFavorites(serverFavorites);
      login({ ...(user || {}), favorites: serverFavorites });
      try {
        window.dispatchEvent(new Event("userUpdated"));
      } catch {}

      toast.success(
        res.data?.action === "added"
          ? "Đã thêm vào yêu thích"
          : "Đã xóa khỏi yêu thích"
      );
    } catch (err) {
      // rollback
      setFavorites(prev);
      login({ ...(user || {}), favorites: prev });
      try {
        window.dispatchEvent(new Event("userUpdated"));
      } catch {}

      toast.error("Không thể cập nhật yêu thích. Vui lòng thử lại.");
    }
  };

  return { favorites, toggleFavorite, isFavorite };
};

export default useFavorites;
