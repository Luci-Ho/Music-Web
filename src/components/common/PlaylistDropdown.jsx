import React, { useEffect, useRef } from 'react';

const PlaylistDropdown = ({
  songId,
  onClose,
  children,
  offset = { top: 200, left: -200 }
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const dropdown = dropdownRef.current;
    const button = document.querySelector(`[data-song-id="${songId}"]`);

    if (dropdown && button) {
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 280;
      const maxDropdownHeight = 400;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top = rect.bottom + offset.top;
      let left = rect.left + offset.left;

      const actualHeight = Math.min(
        maxDropdownHeight,
        Math.max(spaceBelow, spaceAbove) - 40
      );

      const margin = 16;
      top = Math.max(margin, Math.min(top, viewportHeight - actualHeight - margin));
      left = Math.max(margin, Math.min(left, viewportWidth - dropdownWidth - margin));

      dropdown.style.top = `${top}px`;
      dropdown.style.left = `${left}px`;
      dropdown.style.maxHeight = `${actualHeight}px`;
    }
  }, [songId, offset]);

  return (
    <>
      {/* Overlay to close dropdown */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 998
        }}
        onClick={onClose}
      />

      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '1px solid rgba(238, 16, 176, 0.3)',
          borderRadius: '12px',
          minWidth: '280px',
          maxHeight: '400px',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(238, 16, 176, 0.1)',
          zIndex: 9999,
          backdropFilter: 'blur(20px)',
          padding: '12px 0'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '0 16px 12px 16px',
            borderBottom: '1px solid rgba(238, 16, 176, 0.2)'
          }}
        >
          <h4
            style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              margin: 0,
              textAlign: 'center'
            }}
          >
            🎵 Thêm vào playlist
          </h4>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </>
  );
};

export default PlaylistDropdown;
