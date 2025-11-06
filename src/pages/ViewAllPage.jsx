import React, { useState, useEffect } from 'react';
import '../App.css';
import '../style/Layout.css'
import ViewAll from './List';
import Footer from '../components/layout/Footer';


const ViewAllPage = ({ source: initialSource }) => {
    // use prop `initialSource` as the initial state to avoid shadowing the prop name
    const [source, setSource] = useState(initialSource || '');

    // keep local state in sync if parent updates the `initialSource` prop
    useEffect(() => {
        setSource(initialSource || '');
    }, [initialSource]);

    return (
        <>
            <ViewAll source={source} />
            <Footer />
        </>
    );
};

export default ViewAllPage;
