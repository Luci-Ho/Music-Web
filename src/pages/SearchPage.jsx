import React from 'react';
import { useLocation } from 'react-router-dom';
import Dashboard from '../components/layout/Dashboard';
import Footer from '../components/layout/Footer';
import FilteredSongsTable from '../components/common/FilteredSongsTable';
import SectionTitle from '../components/common/SectionTitle';


const SearchPage = () => {
    const location = useLocation();
    const keyword = new URLSearchParams(location.search).get('keyword')?.toLowerCase() || '';

    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div className="container">

                    <FilteredSongsTable
                        filterType="search"
                        filterId={keyword}
                        title={<SectionTitle title1="Search results for" title2={`${keyword}`} />}
                    />

                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
