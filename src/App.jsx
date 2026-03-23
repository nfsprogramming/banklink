import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser); // Immediately set user 
      
      if (currentUser) {
        try {
          // Set a 4-second timeout for the role fetch
          const fetchRole = async () => {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            return userDoc.exists() ? (userDoc.data()?.role || 'user') : 'user';
          };
          
          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout fetching role')), 4000)
          );
          
          const role = await Promise.race([fetchRole(), timeout]);
          setUserRole(role);
        } catch (error) {
          console.warn('Firestore fallback triggered:', error.message);
          setUserRole('user'); // Fallback immediately
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || (user && userRole === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 flex-col gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-xl shadow-primary-500/20 animate-bounce">
          <span className="text-xl font-bold">B</span>
        </div>
        <p className="text-sm text-slate-500 font-medium">Connecting to BankLink secure servers...</p>
      </div>
    );
  }



  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Navbar currentUser={user} userRole={userRole} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={user ? (userRole === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/dashboard" element={user && userRole === 'user' ? <Dashboard user={user} /> : (user ? <Navigate to="/" /> : <Navigate to="/login" />)} />
            <Route path="/admin" element={user && userRole === 'admin' ? <AdminPanel user={user} /> : (user ? <Navigate to="/" /> : <Navigate to="/login" />)} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
