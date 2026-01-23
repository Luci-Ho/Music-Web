import React from "react";

const EmptyStateModal = ({
  open,
  title = "Không tìm thấy dữ liệu",
  description = "Vui lòng thử lại sau",
  buttonText = "Quay lại",
  onClose = () => {},
}) => {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 92vw)",
          borderRadius: 16,
          padding: 22,
          background:
            "linear-gradient(135deg, rgba(102,126,234,0.95) 0%, rgba(118,75,162,0.95) 50%, rgba(240,147,251,0.95) 100%)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 42, marginBottom: 6 }}>🙇‍♂️</div>
        <h2 style={{ margin: "6px 0 8px", fontSize: 20, fontWeight: 800 }}>
          {title}
        </h2>
        {description && (
          <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
            {description}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
          <button
            onClick={onClose}
            className="bg-[#1db954] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors"
            style={{ border: "none", cursor: "pointer" }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateModal;
