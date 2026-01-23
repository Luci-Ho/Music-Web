// ... giữ nguyên các import

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// ✅ helper: lấy array từ API (array trực tiếp hoặc {data: []})
const extractArray = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  return [];
};

// ✅ (File bạn đã có normalizeKey/getStableKey rồi, dùng lại)
const bufferObjToHex = (bufObj) => {
  if (!bufObj || typeof bufObj !== "object") return "";
  const keys = Object.keys(bufObj)
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  if (!keys.length) return "";
  return keys
    .map((k) => Number(bufObj[k]).toString(16).padStart(2, "0"))
    .join("");
};

const normalizeKey = (x) => {
  if (!x) return "";
  if (typeof x === "string" || typeof x === "number") return String(x);

  if (typeof x === "object") {
    if (x.legacyId) return String(x.legacyId);
    if (x._id) return normalizeKey(x._id);
    if (x.id) return normalizeKey(x.id);
    if (x.$oid) return String(x.$oid);
    if (x.buffer) {
      const hex = bufferObjToHex(x.buffer);
      if (hex) return hex;
    }
  }
  return "";
};

const getStableKey = (item, fallbackIndex) =>
  normalizeKey(item?.legacyId) ||
  normalizeKey(item?._id) ||
  normalizeKey(item?.id) ||
  `row-${fallbackIndex}`;

// ... VideoCard / GenreCard / MoodCard giữ nguyên

const ViewAllPage = ({ pageType = 'videos' }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPageConfig = () => {
    switch (pageType) {
      case 'genres':
        return { endpoint: 'genres', title: 'Tất cả Thể loại', itemName: 'thể loại' };
      case 'moods':
        return { endpoint: 'moods', title: 'Tất cả Tâm trạng', itemName: 'tâm trạng' };
      default:
        return { endpoint: 'videos', title: 'Tất cả Videos', itemName: 'videos' };
    }
  };

  const config = getPageConfig();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/${config.endpoint}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`Không thể tải ${config.itemName} (${res.status}) ${body}`);
        }
        return res.json();
      })
      .then((json) => {
        if (!alive) return;
        setData(extractArray(json)); // ✅ FIX: nhận {data: []} cũng được
        setLoading(false);
      })
      .catch((err) => {
        console.error('ViewAllPage fetch error:', err);
        if (!alive) return;
        setError(err.message || 'Lỗi không xác định');
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [pageType]); // ok

  const handleItemClick = (item, id) => {
    const stableId = id || getStableKey(item, 0);
    if (!stableId) return;

    switch (pageType) {
      case 'genres':
        navigate(`/genre/${stableId}`, { state: { genre: item } });
        break;
      case 'moods':
        navigate(`/mood/${stableId}`, { state: { mood: item } });
        break;
      default:
        navigate(`/video/${stableId}`, { state: { video: item } });
        break;
    }
  };

  const renderCard = (item, idx) => {
    const key = getStableKey(item, idx); // ✅ FIX: key luôn là string ổn định

    switch (pageType) {
      case 'genres':
        return (
          <GenreCard
            key={key}
            genre={item}
            onClick={() => handleItemClick(item, key)}
          />
        );
      case 'moods':
        return (
          <MoodCard
            key={key}
            mood={item}
            onClick={() => handleItemClick(item, key)}
          />
        );
      default:
        return (
          <VideoCard
            key={key}
            video={item}
            onClick={() => handleItemClick(item, key)}
          />
        );
    }
  };

  // ... loading/error UI giữ nguyên

  return (
    <>
      <TopBar />
      <div className="content" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', minHeight: '100vh' }}>
        <div className="bluebox">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-white text-3xl font-bold">{config.title}</h1>
              <p className="text-gray-300">{data.length} {config.itemName}</p>
            </div>

            {/* ✅ FIX: map phải truyền idx để tạo key fallback */}
            <div className="video-all-grid">
              {data.map((item, idx) => renderCard(item, idx))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewAllPage;
