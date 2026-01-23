import React, { useEffect, useState } from "react";
import "./D2Card.css";
import SectionTitle from "./SectionTitle";
import { Link } from "react-router-dom";

/* ======================
   CARD ĐƠN
====================== */
export const D2Card = ({ title = "Title", img, className = "", onClick }) => {
  return (
    <div
      className={`d2card ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="d2card-thumb">
        <img
          src={img || "/images/none.jpg"}
          alt={title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/none.jpg";
          }}
        />
        <div className="d2card-overlay" />
        <div className="d2card-title">{title}</div>
      </div>
    </div>
  );
};

/* ======================
   CARD ROW
====================== */
export const D2CardRow = ({ data = [], title1, title2, limit = 5, source = "" }) => {
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setDatas(Array.isArray(data) ? data.slice(0, limit) : []);
    } finally {
      setLoading(false);
    }
  }, [data, limit]);

  const viewAllLink =
    source === "genres"
      ? "/genre/listpage"
      : source === "moods"
      ? "/mood/listpage"
      : source === "artists"
      ? "/artist/listpage"
      : `/${source}/listpage`;

  if (loading) {
    return (
      <div className="w-full flex flex-col mb-10">
        <div className="dcontainer">
          <SectionTitle title1={title1} title2={title2} />
          <p className="loading">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col mb-10">
      <div className="dcontainer">
        <SectionTitle title1={title1} title2={title2} />

        <ul className="flex row-auto justify-between w-full items-center list-none p-0 m-0">
          {datas.map((a, idx) => {
            const id = a?._id ?? a?.id ?? a?.legacyId ?? idx;

            const image = a.media?.image || a.img || a.image || null;

            const target =
              source === "genres"
                ? `/genre/${id}`
                : source === "moods"
                ? `/mood/${id}`
                : source === "artists"
                ? `/artist/${id}`
                : `/${source}/${id}`;

            return (
              <li className="w-[230px]" key={String(id)}>
                <Link to={target} style={{ textDecoration: "none" }}>
                  <D2Card title={a.name ?? a.title} img={image} />
                </Link>
              </li>
            );
          })}

          {/* VIEW ALL */}
          <li style={{ listStyle: "none" }}>
            <Link to={viewAllLink} className="dviewall" tabIndex={0}>
              <div className="dvaplus">+</div>
              <p className="dvat">View All</p>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default D2CardRow;
