import React from 'react';

const SectionTitle = ({ title1, title2}) => {
  return (
    <h1 className="font-bold text-2xl text-white mb-24 "  >
      {title1} <span className={`text-[#ee10b0]`}>{title2}</span>
    </h1>
  );
};

export default SectionTitle;