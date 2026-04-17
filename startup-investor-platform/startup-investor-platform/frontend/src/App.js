import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SubmitStartup = lazy(() => import('./pages/SubmitStartup'));
const SwipeMatch = lazy(() => import('./pages/SwipeMatch'));
const Comparison = lazy(() => import('./pages/Comparison'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Chat = lazy(() => import('./pages/Chat'));
const LearningHub = lazy(() => import('./pages/LearningHub'));
const Profile = lazy(() => import('./pages/Profile'));
const StartupDetail = lazy(() => import('./pages/StartupDetail'));
const Simulation = lazy(() => import('./pages/Simulation'));
const GenAI = lazy(() => import('./pages/GenAI'));

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0a0a0f' }}>
      <div style={{ width:32, height:32, border:'2px solid #6c63ff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const Loader = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0a0a0f', gap:16 }}>
    <div style={{ width:48, height:48, border:'2px solid #6c63ff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    <p style={{ color:'#a78bfa', fontFamily:'Space Mono, monospace', fontSize:13 }}>Loading VentureAI...</p>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/submit-startup" element={<ProtectedRoute roles={['founder','admin']}><SubmitStartup /></ProtectedRoute>} />
        <Route path="/match" element={<ProtectedRoute><SwipeMatch /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/chat/:roomId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/learn" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/startup/:id" element={<StartupDetail />} />
        <Route path="/simulation" element={<ProtectedRoute><Simulation /></ProtectedRoute>} />
        <Route path="/genai" element={<ProtectedRoute><GenAI /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background:'#1a1a27', color:'#f0f0f5', border:'1px solid rgba(108,99,255,0.3)' },
          duration: 3000
        }}/>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
