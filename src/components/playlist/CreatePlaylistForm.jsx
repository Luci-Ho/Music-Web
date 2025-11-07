import React from 'react';

const CreatePlaylistForm = ({
  songId,
  newPlaylistName,
  setNewPlaylistName,
  onCreate,
  onCancel
}) => {
  return (
    <div className="p-4 mb-4 rounded bg-pink-50/5 border border-pink-300/30">
      <input
        type="text"
        placeholder="Nhập tên playlist..."
        value={newPlaylistName}
        onChange={(e) => setNewPlaylistName(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            onCreate(songId);
          }
        }}
        className="w-full p-3 mb-3 rounded bg-white/10 border border-pink-300 text-white text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={() => onCreate(songId)}
          className="flex-1 px-4 py-2 rounded bg-gradient-to-r from-pink-500 to-pink-400 text-white font-semibold text-sm hover:shadow-lg transition"
        >
          ✨ Tạo
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default CreatePlaylistForm;
