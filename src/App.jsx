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
import SongPlayer from './pages/SongPlayerPage';
import AddToPlaylist from './pages/AddToPlaylist';
import PlaylistDetail from './pages/PlaylistDetail';


function App() {
  return (
    <>
      <Routes>
        <Route path="/loading" element={<Loading />} />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/song/:id" element={<SongPlayer />} />
        <Route path="/playlist/add/:id" element={<AddToPlaylist />} />
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
