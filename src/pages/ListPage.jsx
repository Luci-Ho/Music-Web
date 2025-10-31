import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Dashboard from '../components/layout/Dashboard';
import '../App.css';
import '../style/Layout.css'
import Footer from '../components/layout/Footer';
import FilteredSongsTable from '../components/common/FilteredSongsTable';
import data from '../routes/db.json';


const ListPage = ({ source: propSource, pageType }) => {
    // Read params for different route types
    const params = useParams();
    const initialSource = propSource || params.source || '';
    const detailId = params.id || params["id"];
    const browseType = params.type; // from /browse/:type/:id

    // use prop `initialSource` as the initial state to avoid shadowing the prop name
    const [source, setSource] = useState(initialSource || '');

    // keep local state in sync if parent updates the `initialSource` prop or URL param changes
    useEffect(() => {
        setSource(initialSource || '');
    }, [initialSource]);

    // If this page was invoked as a detail page (e.g., /genre/:id or /browse/:type/:id)
    const effectiveType = pageType || (browseType === 'genres' ? 'genre' : browseType === 'moods' ? 'mood' : browseType === 'artists' ? 'artist' : undefined);
    const effectiveId = detailId;

    // If this is a favorites page, render the filtered table using the user's favorites
    if (effectiveType === 'favorites') {
        return (
            <div className="body">
                <div style={{ display: 'flex', width: '100%' }}>
                    <Dashboard />
                    <div className='container'>
                        <FilteredSongsTable filterType={'favorites'} title={'Your'} />
                        <Footer />
                    </div>
                </div>
            </div>
        );
    }

    if (effectiveType && effectiveId) {
        // derive a title from data when possible
        let title = '';
        if (effectiveType === 'genre') title = (data.genres.find(g => g.id === effectiveId) || {}).title || '';
        if (effectiveType === 'mood') title = (data.moods.find(m => m.id === effectiveId) || {}).title || '';
        if (effectiveType === 'artist') title = (data.artists.find(a => a.id === effectiveId) || {}).name || '';

        return (
            <div className="body">
                <div style={{ display: 'flex', width: '100%' }}>
                    <Dashboard />
                    <div className='container'>
                        <FilteredSongsTable filterType={effectiveType} filterId={effectiveId} title={title} />
                        <Footer />
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise render the listpage as before
    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div className='container'>
                    <List source={source} />
                    <Footer />
                </div>
                
            </div>
            
        </div>
    );
};

export default ListPage;
