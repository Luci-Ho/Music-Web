import React from 'react';
import './D2Card.css';

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

export const D2CardRow = ({ datas = [], title1, title2, onViewAll }) => {
    return (
        <div className="w-full h-full flex flex-col">
                <div className="dcontainer">
                    <h1 className="font-bold text-2xl text-white mb-10">{title1} <span className="text-[#ee10b0]">{title2}</span></h1>
                    <ul className="flex row-auto justify-between w-full items-center list-none p-0 m-0"> 
                        {datas.map((data, idx) => (
                            <li className='w-[230px]' key={data.id ?? data.title ?? idx}>
                                <D2Card title={data.title} img={data.img} />
                            </li>
                        ))}
                        <div className="dviewall" onClick={onViewAll} role={onViewAll ? 'button' : 'link'} tabIndex={0}>
                            <div className="dvaplus">+</div>
                            <p className="dvat">View All</p>
                        </div>
                    </ul>
                </div>
            </div>
    );
}

export default D2CardRow;