import React from 'react';
import SectionTitle from './SectionTitle';
import './CardGrid.css';

const CardGrid = ({ title, title1, items, renderItem }) => {
  return (
    <section className="section-grid">
      <SectionTitle title={title} title1={title1} />
      <div className="section-grid-container">
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </section>
  );
};

export default CardGrid;
