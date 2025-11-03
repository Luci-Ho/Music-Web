import React, { Suspense }                 from 'react';
import { ToastContainer }                  from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route }                   from 'react-router-dom';
import Home                                from './pages/Homepage';
import Login                               from './pages/Login';
import SignUp                              from './pages/SignUp';
import Loading                             from './pages/Loading';
import './App.css';
import Discover                            from './pages/DiscoverPage';
import AddToPlaylist                       from './pages/AddToPlaylist';
import PlaylistDetail                      from './pages/PlaylistDetail';
import PlaylistsPage                       from './pages/PlaylistsPage';
import ArtistsPage                         from './pages/ArtistsPage';
import ArtistDetailPage                    from './pages/ArtistDetailPage';
import AlbumsPage                          from './pages/AlbumsPage';
import AlbumDetailPage                     from './pages/AlbumDetailPage';
import ProtectedRoute                      from './components/layout/ProtectedRoute';
// import AdminProtectedRoute                 from './components/layout/AdminProtectedRoute';
import ListPage                            from './pages/ListPage';
import BrowseRedirect                      from './components/layout/BrowseRedirect';
import MusicPlayer                         from './components/layout/MusicPlayer';

import { AppProvider } from './components/common/AppContext';

// lazy-load admin bundle so the main app doesn't break if admin imports have missing deps
const AdminPage = React.lazy(() => import('./Admin/pages/AdminPage'));

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
        <Route path="/Admin" element={
            <Suspense 
              fallback={<div>Loading Admin...</div>}
            >
              {/* <AdminProtectedRoute> */}
                <AdminPage />
              {/* </AdminProtectedRoute> */}
            </Suspense>
          } />
        <Route path="/:source/listpage" element={<ListPage />} />

        {/* dynamic pages for genres, moods, and artists */}
        <Route path="/genre/:id" element={<ListPage pageType={'genre'} />} />
        <Route path="/mood/:id" element={<ListPage pageType={'mood'} />} />
        <Route path="/artist/:id" element={<ArtistDetailPage />} />

        {/* redirect old /browse/:type/:id to canonical routes */}
        <Route path="/browse/:type/:id" element={<BrowseRedirect />} />

        {/* singular listpage routes (View All) mapped to ListPage with source prop */}
        <Route path="/genre/listpage" element={<ListPage source={"genres"} />} />
        <Route path="/mood/listpage" element={<ListPage source={"moods"} />} />
        <Route path="/artist/listpage" element={<ListPage source={"artists"} />} />

        {/* New pages for playlists, artists and albums */}
        <Route path="/playlist" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
        <Route path="/artist" element={<ArtistsPage />} />
        <Route path="/album" element={<AlbumsPage />} />
        <Route path="/album/:id" element={<AlbumDetailPage />} />

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
