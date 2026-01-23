import React from 'react';
import TopBar from '../layout/TopBar';
import Footer from '../layout/Footer';

/**
 * Reusable loading component for pages
 * @param {string} message - Loading message to display
 * @returns {JSX.Element}
 */
const LoadingPage = ({ message = 'Đang tải...' }) => {
  return (
    <div className="body">
      <div style={{ display: 'flex', width: '100%' }}>
        <div className="container">
          <TopBar />
          <div className="content">
            <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
              <h2>{message}</h2>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;