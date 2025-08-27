// import './App.css';
import CircuitCanvas from './components/CircuitCanvas';
import { ContextProvider } from './contextApi/MyContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Blog from './pages/blog';
import Form from './pages/form'
import Use from './pages/use'
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <ContextProvider>
      <Router>
      <ToastContainer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/simulator" element={<CircuitCanvas />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/form" element={<Form />} />
          <Route path="/use" element={<Use />} />

        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;
