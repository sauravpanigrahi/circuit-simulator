import { Suspense, lazy } from 'react';
import { ContextProvider } from './contextApi/MyContext';
import { DarkModeProvider } from './elements/darkMode';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Loader from './elements/loader';
import ScrollToTop from './elements/ScrollToTop';
import './elements/darkMode.css';
// Lazy imports
const CircuitCanvas = lazy(() => import('./components/CircuitCanvas'));
const HomePage = lazy(() => import('./pages/HomePage'));
const Blog = lazy(() => import('./pages/blog'));
const Form = lazy(() => import('./pages/form'));
const Use = lazy(() => import('./pages/use'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Account = lazy(() => import('./pages/account'));
const Profile = lazy(() => import('./pages/devloper'));
export default function App() {
  return (
    <DarkModeProvider>
      <ContextProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
              width: '100vw',
              position: 'fixed',
              top: 0,
              left: 0,
              backgroundColor: '#1a1a2e',
              zIndex: 9999
            }}>
              <Loader/>
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/form" element={<Form />} />
              <Route path="/use" element={<Use />} />
              <Route path="/circuit" element={<CircuitCanvas />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/account" element={<Account />} />
              <Route path="/devloper" element={<Profile />} />
            </Routes>
          </Suspense>
        </Router>

        <ToastContainer
        position="top-center"
        draggable
        theme="colored"
        toastStyle={{
          width: '500px',
          minHeight: '60px',
          color: '#fff',
          backgroundColor: '#1e293b',
          borderRadius: '12px'
        }}
      />
      </ContextProvider>
    </DarkModeProvider>
  );
}
