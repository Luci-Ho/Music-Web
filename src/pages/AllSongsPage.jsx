import React from 'react';
import Footer from '../components/layout/Footer';
import FilteredSongsTable from '../components/common/FilteredSongsTable';
import '../App.css';
import '../style/Layout.css';

const AllSongsPage = () => {
    return (
        <>
            <FilteredSongsTable 
                filterType={'all'} 
                title={'All Songs'} 
            />
            <Footer />
        </>
    );
};

export default AllSongsPage;