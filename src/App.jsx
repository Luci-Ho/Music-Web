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
import ProtectedRoute from './components/layout/ProtectedRoute';
import ListPage from './pages/ListPage';
import BrowseRedirect from './components/layout/BrowseRedirect';
import MusicPlayer from './components/layout/MusicPlayer';

import { AppProvider } from './components/common/AppContext';
import { source } from 'framer-motion/client';

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
        
        <Route path="/:source/listpage" element={<ListPage />} />

        {/* dynamic pages for genres, moods, and artists */}
        <Route path="/genre/:id" element={<ListPage pageType={'genre'} />} />
        <Route path="/mood/:id" element={<ListPage pageType={'mood'} />} />
        <Route path="/artist/:id" element={<ListPage pageType={'artist'} />} />

        {/* redirect old /browse/:type/:id to canonical routes */}
        <Route path="/browse/:type/:id" element={<BrowseRedirect />} />

        {/* singular listpage routes (View All) mapped to ListPage with source prop */}
        <Route path="/genre/listpage" element={<ListPage source={"genres"} />} />
        <Route path="/mood/listpage" element={<ListPage source={"moods"} />} />
        <Route path="/artist/listpage" element={<ListPage source={"artists"} />} />

        <Route path="/playlist/add/:id" element={<ProtectedRoute>   <AddToPlaylist />                     </ProtectedRoute>} />
        <Route path="/playlist/:id"     element={<ProtectedRoute>   <PlaylistDetail />                    </ProtectedRoute>} />
        <Route path="/favorites"        element={<ProtectedRoute>   <ListPage pageType={'favorites'} />   </ProtectedRoute>} />

      </Routes>
      <MusicPlayer />
      <ToastContainer />
    </AppProvider>
  );
}

export default App;
