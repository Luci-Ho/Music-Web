import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import PlaylistList from './PlaylistList';
import CreatePlaylistForm from './CreatePlaylistForm';

const fadeIn = {
  animation: 'fadeIn 0.3s ease-out forwards',
};

const slideIn = {
  animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
    boxSizing: 'border-box',
    ...fadeIn,
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '450px',
    maxHeight: '90vh',
    padding: '28px',
    overflowY: 'auto',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    border: '1px solid rgba(238, 16, 176, 0.3)',
    borderRadius: '20px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(238, 16, 176, 0.1)',
    backdropFilter: 'blur(25px)',
    transform: 'translateY(0)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...slideIn,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
  },
  closeButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '20px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  createToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ee10b0',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'transform 0.2s ease',
  },
};

const PlaylistPopup = ({
  songId,
  playlists,
  showCreate,
  newPlaylistName,
  setNewPlaylistName,
  onAdd,
  onCreate,
  onClose,
  toggleCreate
}) => {
  return (
    <div style={styles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-50px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Thêm vào playlist</h3>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(238, 16, 176, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            ×
          </button>
        </div>

        {/* Tạo playlist mới */}
        <div
          style={styles.createToggle}
          onClick={toggleCreate}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
        >
          <PlusOutlined style={{ fontSize: '12px' }} />
          <span>Tạo playlist mới</span>
        </div>

        {/* Form tạo mới */}
        {showCreate && (
          <CreatePlaylistForm
            songId={songId}
            newPlaylistName={newPlaylistName}
            setNewPlaylistName={setNewPlaylistName}
            onCreate={onCreate}
            onCancel={toggleCreate}
          />
        )}

        {/* Danh sách playlist */}
        <PlaylistList
          playlists={playlists}
          songId={songId}
          onAdd={onAdd}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default PlaylistPopup;
