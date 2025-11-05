import React from 'react';
import Dashboard from '../components/layout/Dashboard';
import Footer from '../components/layout/Footer';
import FilteredSongsTable from '../components/common/FilteredSongsTable';
import '../App.css';
import '../style/Layout.css';

const AllSongsPage = () => {
    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div className='container'>
                    <FilteredSongsTable 
                        filterType={'all'} 
                        title={'All Songs'} 
                    />
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default AllSongsPage;