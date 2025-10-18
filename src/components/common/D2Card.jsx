import React from 'react';
import './D2Card.css';
import SectionTitle from './SectionTitle';
import useResponsiveCount from '../../hooks/useResponsiveCount';

export const D2Card = ({ title = 'Title', img, className = '', onClick }) => {
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

export const D2CardRow = ({ datas, title1, title2, onViewAll, maxItems }) => {
    // calculate how many 230px cards fit (230 + gap)
    const responsive = useResponsiveCount({ cardWidth: 230, gap: 20, min: 1, max: 8, containerSelector: '.dcontainer', cardSelector: '.d2card' });
    const effectiveMax = typeof maxItems === 'number' ? maxItems : responsive;
    const toShow = Array.isArray(datas) ? datas.slice(0, effectiveMax) : [];

    return (
        <div className="w-full h-full flex flex-col">
                <div className="dcontainer">
                    <SectionTitle title1={title1} title2={title2} />
                    <ul className="flex row-auto justify-between w-full items-center list-none p-0 m-0"> 
                        {toShow.map((data, idx) => (
                            <li className='w-[230px]' key={data.id ?? data.title ?? idx}>
                                <D2Card title={data.title} img={data.img} />
                            </li>
                        ))}
                        <li style={{ listStyle: 'none' }}>
                            <div className="dviewall" onClick={onViewAll} role={onViewAll ? 'button' : 'link'} tabIndex={0}>
                                <div className="dvaplus">+</div>
                                <p className="dvat">View All</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
    );
}

export default D2CardRow;
