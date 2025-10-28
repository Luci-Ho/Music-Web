import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Homepage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Loading from './pages/Loading';
import './App.css';
import Discover from './pages/DiscoverPage';
import AddToPlaylist from './pages/AddToPlaylist';
import PlaylistDetail from './pages/PlaylistDetail';

import { AppProvider } from './components/common/AppContext';

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/loading" element={<Loading />} />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/discover" element={<Discover />} />
        
        <Route path="/playlist/add/:id" element={<AddToPlaylist />} />
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
        <Route path="/viewall" element={<ViewAllPage />} />
      </Routes>
      <MusicPlayer/>
      <ToastContainer />
    </AppProvider>
  );
}

export default App;
