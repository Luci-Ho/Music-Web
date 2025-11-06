import React from 'react';
import Dashboard from '../layout/Dashboard';
import TopBar from '../layout/TopBar';
import Footer from '../layout/Footer';

/**
 * Reusable empty state component for pages
 * @param {string} title - Title to display
 * @param {string} description - Description to display
 * @param {string} buttonText - Button text
 * @param {function} onButtonClick - Button click handler
 * @param {string} buttonClassName - Button CSS classes
 * @returns {JSX.Element}
 */
const EmptyStatePage = ({ 
  title = 'Không tìm thấy dữ liệu', 
  description = 'Vui lòng thử lại sau',
  buttonText = 'Quay lại',
  onButtonClick = () => {},
  buttonClassName = 'bg-[#1db954] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors mt-4'
}) => {
  return (
    <div className="body">
      <div style={{ display: 'flex', width: '100%' }}>
        <Dashboard />
        <div className="container">
          <TopBar />
          <div className="content">
            <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
              <h2>{title}</h2>
              {description && <p>{description}</p>}
              {buttonText && (
                <button 
                  onClick={onButtonClick}
                  className={buttonClassName}
                >
                  {buttonText}
                </button>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default EmptyStatePage;