import React from 'react';
import { useEffect, useState } from 'react';
import './D2Card.css';
import SectionTitle from './SectionTitle';
import { useNavigate, Link } from 'react-router-dom';



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

export const D2CardRow = ({ source = '', title1, title2, onViewAll, limit = 5  }) => {
    
    const [datas, setDatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

        useEffect(() => {
                fetch(`http://localhost:4000/${source}`)
                    .then((res) => {
                        if (!res.ok) throw new Error("Không thể lấy dữ liệu");
                        return res.json();
                    })
                    .then((data) => {
                        setDatas(data.slice(0, limit)); // giới hạn số bài
                        setLoading(false);
                    })
                    .catch((err) => {
                        setError(err.message);
                        setLoading(false);
                    });
            }, [limit, source]);

    return (
        <div className="w-full flex flex-col mb-10">
            <div className="dcontainer">
                <SectionTitle title1={title1} title2={title2} />

                {loading && <p className="loading">Đang tải bài hát...</p>}
                {error && <p className="error">Lỗi: {error}</p>}
                {!loading && !error && (
                    <ul className="flex row-auto justify-between w-full items-center list-none p-0 m-0">
                        {datas.map((a, idx) => {
                            const id = a.id;
                            // link to the unified browse route
                            // map collection name to canonical route
                            const target = source === 'genres' ? `/genre/${id}`
                                : source === 'moods' ? `/mood/${id}`
                                : source === 'artists' ? `/artist/${id}`
                                : `/${source}/${id}`;
                            return (
                                <li className='w-[230px]' key={a.id ?? a.title ?? idx}>
                                    <Link to={target} style={{ textDecoration: 'none' }}>
                                        <D2Card title={a.title} img={a.img} />
                                    </Link>
                                </li>
                            );
                        })}
                    <li style={{ listStyle: 'none' }}>
                        {/* View All: convert to singular path (e.g., /genre/listpage) for the list pages */}
                        {(() => {
                            const singular = source === 'genres' ? 'genre' : source === 'moods' ? 'mood' : source === 'artists' ? 'artist' : source;
                            const listPath = `/${singular}/listpage`;
                            return (
                                <Link to={listPath} className="dviewall" tabIndex={0} >
                                    <div className="dvaplus">+</div>
                                    <p className="dvat">View All</p>
                                </Link>
                            );
                        })()}
                    </li>
                    </ul>
                )}
            </div>
        </div>
    );
}

export default D2CardRow;
