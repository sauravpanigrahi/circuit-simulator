import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './homepage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    components: 0,
    analysisTypes: 0,
    browserBased: 0,
    parameterType: 0
  });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [revealedElements, setRevealedElements] = useState(new Set());

  // Dark mode toggle function
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  const handleBlogClick = () => {
    navigate('/blog');
  }

  // Apply theme to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

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

  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealedElements(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const animateStats = () => {
    const stats = [
      { key: 'components', target: 16 },
      { key: 'analysisTypes', target: 3 },
      { key: 'browserBased', target: 100 },
      { key: 'parameterType', target:3}
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

  return (
    <div className={`${isDarkMode ? 'dark-theme' : 'light-theme'} page-load`}>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />

      
      {/* Animated Sine Wave Background */}
      <div className="sine-wave-background">
        <svg className="sine-wave" viewBox="0 0 1200 400" preserveAspectRatio="none">
          <path 
            className="sine-path"
            d="M0,200 Q300,100 600,200 T1200,200"
            fill="none"
            stroke="rgba(99, 102, 241, 0.1)"
            strokeWidth="2"
          />
          <path 
            className="sine-path-delayed"
            d="M0,200 Q300,100 600,200 T1200,200"
            fill="none"
            stroke="rgba(139, 92, 246, 0.08)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Header */}
      <nav
        className={`navbar navbar-expand-lg fixed-top navbar-dark ${
          headerScrolled ? 'navbar-scrolled' : 'navbar-transparent'
        }`}
      >
        <div className="container">
          <a
            className="navbar-brand logo-pulse fw-bold fs-3 d-flex align-items-center"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <span className="logo-icon me-2"><i className="fas fa-microchip me-2"></i></span>
            <span className="logo-text">CircuitSim</span>
          </a>
          
          <button 
            className="navbar-toggler border-0" 
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
                >
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link nav-link-custom" 
                  href="#documentation" 
                  onClick={handleBlogClick}
                >
                  Blog
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link nav-link-custom" 
                  href="#about" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
                >
                  About
                </a>
              </li>
              {/* <li className="nav-item">
                <a 
                  className="nav-link nav-link-custom" 
                  href="#contact" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                >
                  Contact
                </a>
              </li> */}
              <li className="nav-item ms-2">
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm rounded-pill"
                  onClick={toggleDarkMode}
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDarkMode ? "☀️" : "🌙"}
                </button>
              </li>
              <li className="nav-item ms-2">
                <button
                  type="button"
                  className="btn btn-primary btn-glow shimmer rounded-pill px-4"
                  onClick={handleSimulatorClick}
                >
                  Launch Simulator
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section d-flex align-items-center position-relative min-vh-100">
        <div className="floating-elements">
          <div className="floating-element">⚡</div>
          <div className="floating-element">🔌</div>
          <div className="floating-element">🔋</div>
          <div className="floating-element">⚙️</div>
          <div className="floating-element">📊</div>
          <div className="floating-element">💡</div>
        </div>
        
        <div className="container text-center position-relative" style={{ zIndex: 2 }}>
          <div className="fade-in-up">
            <h1 className="display-1 fw-bold mb-4 text-gradient">
              Design. Simulate. Analyze.
            </h1>
            <p className="lead mb-5 mx-auto text-light opacity-75" style={{ maxWidth: '600px' }}>
              Professional circuit simulation made simple. Build electronic circuits with an intuitive 
              drag-and-drop interface, run SPICE analysis, and visualize results in real-time.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button 
                className="btn btn-primary btn-glow shimmer btn-lg rounded-pill px-4"
                onClick={handleSimulatorClick}
              >
                🚀 Start Designing
              </button>
              <button 
                className="btn btn-outline-light shimmer btn-lg rounded-pill px-4"
                onClick={() => scrollToSection('features')}
              >
                📖 Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5" ref={statsRef}>
        <div className="container">
          <div className="d-flex flex-wrap justify-content-center text-center">
            <div className="stat-card scroll-reveal m-3 flex-fill" id="stat-1" style={{ minWidth: '200px', maxWidth: '220px' }}>
              <h2 className="display-4 text-primary fw-bold mb-2">{animatedStats.components}+</h2>
              <p className="lead text-light opacity-75">Electronic Components</p>
            </div>

            <div className="stat-card scroll-reveal m-3 flex-fill" id="stat-2" style={{ minWidth: '200px', maxWidth: '220px' }}>
              <h2 className="display-4 text-primary fw-bold mb-2">{animatedStats.analysisTypes}</h2>
              <p className="lead text-light opacity-75">Analysis Types</p>
            </div>

            <div className="stat-card scroll-reveal m-3 flex-fill" id="stat-3" style={{ minWidth: '200px', maxWidth: '220px' }}>
              <h2 className="display-4 text-primary fw-bold mb-2">∞</h2>
              <p className="lead text-light opacity-75">Circuit Possibilities</p>
            </div>

            <div className="stat-card scroll-reveal m-3 flex-fill" id="stat-4" style={{ minWidth: '200px', maxWidth: '220px' }}>
              <h2 className="display-4 text-primary fw-bold mb-2">{animatedStats.browserBased}%</h2>
              <p className="lead text-light opacity-75">Browser-Based</p>
            </div>

            <div className="stat-card scroll-reveal m-3 flex-fill" id="stat-5" style={{ minWidth: '200px', maxWidth: '220px' }}>
              <h2 className="display-4 text-primary fw-bold mb-2">{animatedStats.parameterType}</h2>
              <p className="lead text-light opacity-75">Parameter Types</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5" id="features">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-light mb-4 scroll-reveal" id="features-title">
              Powerful Features for Circuit Design
            </h2>
            <p className="lead text-light opacity-75 scroll-reveal" id="features-subtitle">
              Everything you need to design and analyze electronic circuits
            </p>
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
                <div className={`feature-card h-100 border-0 rounded-4 scroll-reveal`} id={`feature-${index}`}>
                  <div className="card-body text-center p-4">
                    <div className="feature-icon mb-3">{feature.icon}</div>
                    <h4 className="card-title fw-bold mb-3 text-light">{feature.title}</h4>
                    <p className="card-text text-light opacity-75">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-5" id="about">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4">
              <div className="about-content scroll-reveal" id="about-content">
                <h2 className="display-5 fw-bold text-light mb-4">
                  Built for Engineers and Students
                </h2>
                <p className="lead text-light opacity-75 mb-4">
                  CircuitSim provides a comprehensive platform for electronic circuit design and analysis. 
                  Whether you're a student learning electronics or a professional engineer, our intuitive 
                  interface makes circuit simulation accessible to everyone.
                </p>
                <div className="d-flex gap-3">
                  <button 
                    className="btn btn-primary btn-glow shimmer rounded-pill px-4"
                    onClick={handleSimulatorClick}
                  >
                    Try It Now
                  </button>
                  <button 
                    className="btn btn-outline-light shimmer rounded-pill px-4"
                    onClick={() => scrollToSection('contact')}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-visual scroll-reveal" id="about-visual">
                <div className="circuit-preview">
                  <div className="circuit-grid">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="circuit-node"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      {/*<section className="contact-section py-5" id="contact">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-light mb-4 scroll-reveal" id="contact-title">
              Get in Touch
            </h2>
            <p className="lead text-light opacity-75 scroll-reveal" id="contact-subtitle">
              Have questions or suggestions? We'd love to hear from you.
            </p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="contact-card scroll-reveal" id="contact-card">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="contact-info">
                      <h4 className="text-light mb-3">Contact Information</h4>
                      <p className="text-light opacity-75 mb-2">
                        <i className="bi bi-envelope me-2"></i>
                        info@circuitsim.com
                      </p>
                      <p className="text-light opacity-75 mb-2">
                        <i className="bi bi-github me-2"></i>
                        github.com/sauravpanigrahi/circuit-simulator
                      </p>
                      <p className="text-light opacity-75">
                        <i className="bi bi-globe me-2"></i>
                        circuit-simulator-51410.web.app
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="contact-form">
                      <h4 className="text-light mb-3">Send us a Message</h4>
                      <form>
                        <div className="mb-3">
                          <input type="email" className="form-control form-control-dark" placeholder="Your email" />
                        </div>
                        <div className="mb-3">
                          <textarea className="form-control form-control-dark" rows="3" placeholder="Your message"></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary btn-glow shimmer rounded-pill px-4">
                          Send Message
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="footer-section text-center py-4">
        <div className="container">
          <p className="mb-0 text-light opacity-75">
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