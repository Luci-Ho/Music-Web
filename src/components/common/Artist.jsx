import React from 'react';
import './Artist.css';

const ArtistItem = ({ artist }) => (
    <div className="artist-item">
        <div className="artist-avatar">
            <img src={artist.img} alt={artist.name} />
        </div>
        <div className="artist-name">{artist.name}</div>
    </div>
);

const ArtistRow = ({ datas = [], onViewAll, maxItems = 6 }) => {
    const toShow = Array.isArray(datas) ? datas.slice(0, maxItems) : [];

    return (
        <div className="w-full h-full flex flex-col mb-10">
            <div className="acontainer">
                <h1 className="font-bold text-2xl text-white mb-10"> Popular <span className="text-[#ee10b0]">Artists</span></h1>
            
                <div className="artist-row"> 
                    {toShow.map((a, i) => (
                        <ArtistItem key={a.id ?? `${a.name}-${i}`} artist={a} />
                    ))}

                    <div className="aviewall" onClick={onViewAll} role={onViewAll ? 'button' : 'link'} tabIndex={0}>
                        <div className="avaplus">+</div>
                        <p className="avat">View All</p>
                    </div>
            </div>
            </div>
        </div>
    );
};

export default ArtistRow;