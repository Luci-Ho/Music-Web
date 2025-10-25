import React from 'react';
import './Artist.css';
import SectionTitle from './SectionTitle';
import useResponsiveCount from '../../hooks/useResponsiveCount';

const ArtistItem = ({ artist }) => (
    <div className="artist-item">
        <div className="artist-avatar">
            <img src={artist.img} alt={artist.name} />
        </div>
        <div className="artist-name">{artist.name}</div>
    </div>
);

const ArtistRow = ({ datas,  maxItems }) => {
    // cardWidth should match .artist-item width; gap should match .artist-row gap
    const responsive = useResponsiveCount({ cardWidth: 130, gap: 20, min: 2, max: 5, containerSelector: '.acontainer .artist-row', cardSelector: '.artist-item' });
    const effectiveMax = typeof maxItems === 'number' ? maxItems : responsive;
    const toShow = Array.isArray(datas) ? datas.slice(0, effectiveMax) : [];

    return (
        <div className="w-full h-full flex flex-col mb-10">
            <div className="acontainer">
                <SectionTitle title1={"Popular"} title2={"Artists"} />
                <div className="artist-row"> 
                    {toShow.map((a, i) => (
                        <ArtistItem artist={a} key={a.id ?? `${a.name}-${i}`} />
                    ))}

                    <div className="aviewall" tabIndex={0}>
                        <div className="avaplus">+</div>
                        <p className="avat">View All</p>
                    </div>
            </div>
            </div>
        </div>
    );
};

export default ArtistRow;
