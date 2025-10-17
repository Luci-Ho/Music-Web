import React from 'react';
import './D2Card.css';

const D2Card = ({ title = 'Title', img, className = '', onClick }) => {
	return (
		<div className={`d2card ${className}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
			<div className="d2card-thumb">
				<img src={img} alt={title} />
				<div className="d2card-overlay" />
				<div className="d2card-title">{title}</div>
			</div>
		</div>
	);
};

export default D2Card;
