// src/hooks/useFavorites.js
import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";
import favoriteService from "../services/favorite.service";

// ---------- ObjectId buffer -> hex ----------
const bufferObjToHex = (bufObj) => {
  if (!bufObj || typeof bufObj !== "object") return "";
  const keys = Object.keys(bufObj)
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  if (!keys.length) return "";
  return keys
    .map((k) => {
      const n = Number(bufObj[k]);
      if (!Number.isFinite(n)) return "00";
      return n.toString(16).padStart(2, "0");
    })
    .join("");
};

/**
 * ✅ normalizeId: trả về string id "đẹp"
 * - ưu tiên legacyId nếu có
 * - fallback _id / id / $oid
 * - handle ObjectId buffer object
 */
export const normalizeId = (x) => {
  if (!x) return "";
  if (typeof x === "string" || typeof x === "number") return String(x);

  if (typeof x === "object") {
    // nhiều backend trả song populated có legacyId
    if (x.legacyId) return String(x.legacyId);

    // mongodb ObjectId dạng { buffer: {0:..,1:..} }
    if (x.buffer && typeof x.buffer === "object") {
      const hex = bufferObjToHex(x.buffer);
      if (hex) return hex;
    }

    if (x._id) return normalizeId(x._id);
    if (x.id) return normalizeId(x.id);
    if (x.$oid) return String(x.$oid);
  }

  // fallback cuối cùng (tránh "[object Object]" càng nhiều càng tốt)
  try {
    return String(x);
  } catch {
    return "";
  }
};

/**
 * ✅ expandIds: lấy ra tất cả id có thể match
 * Ví dụ object populated có cả legacyId + _id => add cả 2 vào set
 */
const expandIds = (x) => {
  const ids = [];
  if (!x) return ids;

  if (typeof x === "string" || typeof x === "number") {
    ids.push(String(x));
    return ids;
  }

  if (typeof x === "object") {
    if (x.legacyId) ids.push(String(x.legacyId));
    if (x.id) ids.push(normalizeId(x.id));
    if (x._id) ids.push(normalizeId(x._id));
    if (x.$oid) ids.push(String(x.$oid));
    if (x.buffer) ids.push(normalizeId(x));
  }

  // unique + remove empty
  return [...new Set(ids.filter(Boolean))];
};

export const useFavorites = () => {
  const { user, login, isLoggedIn } = useAuth();

  const [favorites, setFavorites] = useState(() =>
    Array.isArray(user?.favorites) ? user.favorites : []
  );

  // Khi user thay đổi (login/logout), sync local state
  useEffect(() => {
    setFavorites(Array.isArray(user?.favorites) ? user.favorites : []);
  }, [user]);

  const favoriteSet = useMemo(() => {
    const arr = Array.isArray(favorites) ? favorites : [];
    const allKeys = arr.flatMap(expandIds); // chứa cả legacyId và _id nếu có
    return new Set(allKeys.filter(Boolean));
  }, [favorites]);

  // Load favorites từ backend khi login
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;

      try {
        const res = await favoriteService.getFavorites();

        // backend có thể trả:
        // - res.data = [] (ids) hoặc populated objects
        // - hoặc {favorites:[...]} tuỳ bạn
        const serverFavs = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.favorites)
          ? res.data.favorites
          : [];

        setFavorites(serverFavs);

        // update user trong context/localStorage
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
    (songLike) => {
      // songLike có thể là string id hoặc object
      const keys = expandIds(songLike);
      return keys.some((k) => favoriteSet.has(k));
    },
    [favoriteSet]
  );

  const toggleFavorite = useCallback(
    async (songLike) => {
      if (!isLoggedIn) {
        toast.error("Bạn cần đăng nhập để thêm vào yêu thích!");
        return;
      }

      // ✅ sid: ưu tiên legacyId nếu object, còn nếu string thì giữ nguyên
      const sid =
        (typeof songLike === "string" || typeof songLike === "number")
          ? String(songLike)
          : normalizeId(songLike);

      if (!sid) {
        toast.error("Thiếu ID bài hát hợp lệ");
        return;
      }

      const prev = Array.isArray(favorites) ? favorites : [];
      const currentlyFav = favoriteSet.has(sid);

      // optimistic update
      const optimistic = currentlyFav
        ? prev.filter((f) => !expandIds(f).includes(sid))
        : [...prev, sid];

      setFavorites(optimistic);
      login({ ...(user || {}), favorites: optimistic });

      try {
        const res = await favoriteService.toggleFavorite(sid);

        // backend có thể trả { action, favorites } hoặc array
        const serverFavs = Array.isArray(res?.data)
          ? res.data
          : (res?.data?.favorites ?? []);

        setFavorites(serverFavs);
        login({ ...(user || {}), favorites: serverFavs });

        const action = res?.data?.action;
        toast.success(
          action === "added" ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích"
        );

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
