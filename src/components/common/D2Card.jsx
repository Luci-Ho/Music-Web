import React from 'react';
import { useEffect, useState } from 'react';
import './D2Card.css';
import SectionTitle from './SectionTitle';



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
      }, [limit]);

    return (
        <div className="w-full h-full flex flex-col mb-10">
            <div className="dcontainer">
                <SectionTitle title1={title1} title2={title2} />

                {loading && <p className="loading">Đang tải bài hát...</p>}
                {error && <p className="error">Lỗi: {error}</p>}
                {!loading && !error && (
                    <ul className="flex row-auto justify-between w-full items-center list-none p-0 m-0">
                        {datas.map((a, idx) => (
                            <li className='w-[230px]' key={a.id ?? a.title ?? idx}>
                                <D2Card title={a.title} img={a.img} />
                            </li>
                    ))}
                    <li style={{ listStyle: 'none' }}>
                        <div className="dviewall" onClick={onViewAll} role={onViewAll ? 'button' : 'link'} tabIndex={0}>
                            <div className="dvaplus">+</div>
                            <p className="dvat">View All</p>
                        </div>
                    </li>
                    </ul>
                )}
            </div>
        </div>
    );
}

export default D2CardRow;
