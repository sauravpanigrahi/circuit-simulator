import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './homepage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    components: 0,
    analysisTypes: 0,
    browserBased: 0
  });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          animateStats();
        }
      },
      { threshold: 0.5, rootMargin: '0px 0px -100px 0px' }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsAnimated]);

  const animateStats = () => {
    const stats = [
      { key: 'components', target:15 },
      { key: 'analysisTypes', target: 3 },
      { key: 'browserBased', target: 100 }
    ];

    stats.forEach(({ key, target }) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedStats(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, 30);
    });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSimulatorClick = () => {
    navigate('/simulator');
  };

  // Set dynamic CSS variables for color changes
  const headerGlassBg = headerScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.1)';
  const navLinkColor = headerScrolled ? '#333' : 'white';
  const logoTextColor = headerScrolled ? '#333' : 'white';

  return (
    <div>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      {/* Header */}
      <nav
        className={`navbar navbar-expand-lg fixed-top header-glass`}
        style={{
          '--header-glass-bg': headerGlassBg,
        }}
      >
        <div className="container">
          <a
            className="navbar-brand logo-pulse logo-text fw-bold fs-3"
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ '--logo-text-color': logoTextColor }}
          >
            CircuitSim
          </a>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <a 
                  className="nav-link nav-link-custom" 
                  href="#features" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
                  style={{ '--nav-link-custom-color': navLinkColor }}
                >
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link nav-link-custom" 
                  href="#about" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
                  style={{ '--nav-link-custom-color': navLinkColor }}
                >
                  About
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link nav-link-custom" 
                  href="#contact" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                  style={{ '--nav-link-custom-color': navLinkColor }}
                >
                  Contact
                </a>
              </li>
              <li className="nav-item ms-2">
                <button
                  type="button"
                  className="btn btn-glass text-white rounded-pill px-3"
                  onClick={handleSimulatorClick}
                  /* Any color string works: '#0dcaf0', 'rgba(0,123,255,0.6)', etc. */
                  style={{ '--nav-link-custom-color': navLinkColor }}
                >
                  Launch Simulator
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient d-flex align-items-center position-relative">
        <div className="floating-circuits">
          <div className="floating-circuit">⚡</div>
          <div className="floating-circuit">🔌</div>
          <div className="floating-circuit">🔋</div>
          <div className="floating-circuit">⚙️</div>
          <div className="floating-circuit">📊</div>
        </div>
        
        <div className="container text-center text-white position-relative" style={{ zIndex: 2 }}>
          <div className="fade-in-up">
            <h1 className="display-1 fw-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
              Design. Simulate. Analyze.
            </h1>
            <p className="lead mb-5 mx-auto" style={{ maxWidth: '600px', opacity: 0.9 }}>
              Professional circuit simulation made simple. Build electronic circuits with an intuitive 
              drag-and-drop interface, run SPICE analysis, and visualize results in real-time.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button 
                className="btn btn-gradient text-white btn-lg rounded-pill px-4"
                onClick={handleSimulatorClick}
              >
                🚀 Start Designing
              </button>
              <button 
                className="btn btn-glass text-white btn-lg rounded-pill px-4"
                onClick={() => scrollToSection('features')}
              >
                📖 Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-gradient text-white py-5" ref={statsRef}>
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-3 col-md-6 mb-4">
              <h2 className="display-4 text-info fw-bold">
                {animatedStats.components}+
              </h2>
              <p className="lead opacity-75">Electronic Components</p>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <h2 className="display-4 text-info fw-bold">
                {animatedStats.analysisTypes}
              </h2>
              <p className="lead opacity-75">Analysis Types</p>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <h2 className="display-4 text-info fw-bold">∞</h2>
              <p className="lead opacity-75">Circuit Possibilities</p>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <h2 className="display-4 text-info fw-bold">
                {animatedStats.browserBased}%
              </h2>
              <p className="lead opacity-75">Browser-Based</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light" id="features">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-dark mb-4">
              Powerful Features for Circuit Design
            </h2>
          </div>
          
          <div className="row g-4">
            {[
              {
                icon: "🎨",
                title: "Intuitive Design",
                description: "Drag and drop components onto a grid-based canvas. Connect components with simple clicks and build complex circuits effortlessly."
              },
              {
                icon: "⚡",
                title: "SPICE Simulation",
                description: "Industry-standard SPICE analysis including DC, AC, and Transient simulations. Generate netlists automatically from your circuit design."
              },
              {
                icon: "📊",
                title: "Real-time Analysis",
                description: "View voltage and current measurements in real-time. Hover over components to see live simulation data and circuit parameters."
              },
              {
                icon: "🔧",
                title: "Component Library",
                description: "Extensive library of electronic components including resistors, capacitors, inductors, voltage sources, and measurement instruments."
              },
              {
                icon: "📈",
                title: "Data Visualization",
                description: "Interactive charts and graphs to visualize simulation results. Export data and netlists for further analysis."
              },
              {
                icon: "💾",
                title: "No Installation",
                description: "Runs entirely in your browser. No software installation required. Start designing circuits immediately with any modern web browser."
              }
            ].map((feature, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="card h-100 feature-card border-0 rounded-4">
                  <div className="card-body text-center p-4">
                    <div className="display-1 mb-3">{feature.icon}</div>
                    <h4 className="card-title fw-bold mb-3">{feature.title}</h4>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4">
        <div className="container">
          <p className="mb-0">
            &copy; 2025 CircuitSim. Built for engineers, students, and circuit enthusiasts.
          </p>
        </div>
      </footer>

      {/* Bootstrap JS */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </div>
  );
};

export default HomePage; 