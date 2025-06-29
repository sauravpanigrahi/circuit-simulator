// import './App.css';
import CircuitCanvas from './components/CircuitCanvas';
import { ContextProvider } from './contextApi/MyContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/simulator" element={<CircuitCanvas />} />
        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;
