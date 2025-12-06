import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './homepage.css';
import { MainNavbar,Navbar } from '../elements/navbar';
import { useDarkMode } from '../elements/darkMode';
const HomePage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [animatedStats, setAnimatedStats] = useState({
    components: 0,
    analysisTypes: 0,
    browserBased: 0,
    parameterType: 0
  });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [revealedElements, setRevealedElements] = useState(new Set());
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
            entry.target.classList.add('revealed');
            setRevealedElements(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    // Fallback: reveal all elements after 2 seconds if they haven't been revealed
    const fallbackTimer = setTimeout(() => {
      elements.forEach(el => {
        if (!el.classList.contains('revealed')) {
          el.classList.add('revealed');
        }
      });
    }, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
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
    navigate('/circuit');
  };

  return (
    <div className={`${isDarkMode ? 'dark-theme' : 'light-theme'} page-load`}>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />

      
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
      <MainNavbar/>

      {/* Hero Section */}
      <section className="d-flex align-items-center position-relative min-vh-100 bg-gradient" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
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
                className="btn btn-primary btn-lg rounded-pill px-4 shadow"
                onClick={handleSimulatorClick}
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🚀 Start Designing
              </button>
              {/* <button 
                className="btn btn-outline-light btn-lg rounded-pill px-4 shadow color-black"
                onClick={() => scrollToSection('features')}
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                📖 Learn More
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5" ref={statsRef} style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>
        <div className="container">
          <div className="row g-4 justify-content-center text-center">
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="card border-0 shadow-lg scroll-reveal h-100" id="stat-1" style={{ 
                background: 'var(--bg-card)', 
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div className="card-body p-4">
                  <h2 className="display-4 text-primary fw-bold mb-2">{animatedStats.components}+</h2>
                  <p className="lead text-light opacity-75 mb-0">Electronic Components</p>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="card border-0 shadow-lg scroll-reveal h-100" id="stat-2" style={{ 
                background: 'var(--bg-card)', 
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div className="card-body p-4">
                  <h2 className="display-4 text-primary fw-bold mb-2">{animatedStats.analysisTypes}</h2>
                  <p className="lead text-light opacity-75 mb-0">Analysis Types</p>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="card border-0 shadow-lg scroll-reveal h-100" id="stat-3" style={{ 
                background: 'var(--bg-card)', 
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div className="card-body p-4">
                  <h2 className="display-4 text-primary fw-bold mb-2">∞</h2>
                  <p className="lead text-light opacity-75 mb-0">Circuit Possibilities</p>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="card border-0 shadow-lg scroll-reveal h-100" id="stat-4" style={{ 
                background: 'var(--bg-card)', 
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div className="card-body p-4">
                  <h2 className="display-4 text-primary fw-bold mb-2">{animatedStats.browserBased}%</h2>
                  <p className="lead text-light opacity-75 mb-0">Browser-Based</p>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="card border-0 shadow-lg scroll-reveal h-100" id="stat-5" style={{ 
                background: 'var(--bg-card)', 
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div className="card-body p-4">
                  <h2 className="display-4 text-primary fw-bold mb-2">{animatedStats.parameterType}</h2>
                  <p className="lead text-light opacity-75 mb-0">Parameter Types</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5" id="features" style={{ background: 'var(--bg-primary)' }}>
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
                <div className="card h-100 border-0 shadow-lg scroll-reveal" id={`feature-${index}`} style={{ 
                  background: 'var(--bg-card)', 
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div className="card-body text-center p-4">
                    <div className="mb-3" style={{ fontSize: '3rem', transition: 'all 0.3s ease' }}>{feature.icon}</div>
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
      <section className="py-5" id="about" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4">
              <div className="scroll-reveal" id="about-content">
                <h2 className="display-5 fw-bold text-light mb-4">
                  Built for Engineers and Students
                </h2>
                <p className="lead text-light opacity-75 mb-4">
                  CircuitSim provides a comprehensive platform for electronic circuit design and analysis. 
                  Whether you're a student learning electronics or a professional engineer, our intuitive 
                  interface makes circuit simulation accessible to everyone.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <button 
                    className="btn btn-primary rounded-pill px-4 shadow"
                    onClick={handleSimulatorClick}
                    style={{ transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Try It Now
                  </button>
                  {/* <button 
                    className="btn btn-outline-light rounded-pill px-4 shadow"
                    onClick={() => scrollToSection('use-cases')}
                    style={{ transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Learn More
                  </button> */}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="scroll-reveal" id="about-visual">
                <div className="card border-0 shadow-lg" style={{ background: 'var(--bg-card)', padding: '2rem' }}>
                  <div className="d-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
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

      {/* Use Cases Section */}
      <section className="py-5" id="use-cases" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-light mb-4 scroll-reveal">
              Perfect for Every Use Case
            </h2>
            <p className="lead text-light opacity-75 scroll-reveal">
              From education to professional development, CircuitSim adapts to your needs
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-lg h-100 scroll-reveal" style={{ 
                background: 'var(--bg-card)', 
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body p-4">
                  <div className="mb-3" style={{ fontSize: '2.5rem' }}>🎓</div>
                  <h4 className="card-title fw-bold text-light mb-3">Education</h4>
                  <p className="card-text text-light opacity-75">
                    Perfect for students learning electronics fundamentals. Visualize circuit behavior 
                    and understand how components interact in real-time.
                  </p>
                  <ul className="list-unstyled text-light opacity-75 mt-3">
                    <li className="mb-2">✓ Circuit theory courses</li>
                    <li className="mb-2">✓ Lab assignments</li>
                    <li className="mb-2">✓ Interactive learning</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-lg h-100 scroll-reveal" style={{ 
                background: 'var(--bg-card)', 
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body p-4">
                  <div className="mb-3" style={{ fontSize: '2.5rem' }}>🔬</div>
                  <h4 className="card-title fw-bold text-light mb-3">Research & Development</h4>
                  <p className="card-text text-light opacity-75">
                    Prototype and test circuit designs before physical implementation. Validate concepts 
                    quickly with accurate SPICE simulations.
                  </p>
                  <ul className="list-unstyled text-light opacity-75 mt-3">
                    <li className="mb-2">✓ Rapid prototyping</li>
                    <li className="mb-2">✓ Design validation</li>
                    <li className="mb-2">✓ Parameter optimization</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-lg h-100 scroll-reveal" style={{ 
                background: 'var(--bg-card)', 
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body p-4">
                  <div className="mb-3" style={{ fontSize: '2.5rem' }}>💼</div>
                  <h4 className="card-title fw-bold text-light mb-3">Professional Engineering</h4>
                  <p className="card-text text-light opacity-75">
                    Industry-standard SPICE analysis for professional circuit design. Export netlists 
                    and simulation data for integration with existing workflows.
                  </p>
                  <ul className="list-unstyled text-light opacity-75 mt-3">
                    <li className="mb-2">✓ SPICE compatibility</li>
                    <li className="mb-2">✓ Netlist export</li>
                    <li className="mb-2">✓ Professional tools</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="scroll-reveal">
                <h2 className="display-5 fw-bold text-light mb-4">
                  Get Started in Minutes
                </h2>
                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 bg-transparent text-light mb-3" style={{ paddingLeft: 0 }}>
                    <div className="d-flex align-items-start">
                      <span className="badge bg-primary rounded-circle me-3 mt-1" style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                      <div>
                        <h5 className="mb-1">Create Your Account</h5>
                        <p className="mb-0 opacity-75">Sign up for free and access all features instantly</p>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item border-0 bg-transparent text-light mb-3" style={{ paddingLeft: 0 }}>
                    <div className="d-flex align-items-start">
                      <span className="badge bg-primary rounded-circle me-3 mt-1" style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                      <div>
                        <h5 className="mb-1">Design Your Circuit</h5>
                        <p className="mb-0 opacity-75">Drag and drop components onto the canvas</p>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item border-0 bg-transparent text-light mb-3" style={{ paddingLeft: 0 }}>
                    <div className="d-flex align-items-start">
                      <span className="badge bg-primary rounded-circle me-3 mt-1" style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                      <div>
                        <h5 className="mb-1">Run Simulation</h5>
                        <p className="mb-0 opacity-75">Choose analysis type and visualize results</p>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item border-0 bg-transparent text-light" style={{ paddingLeft: 0 }}>
                    <div className="d-flex align-items-start">
                      <span className="badge bg-primary rounded-circle me-3 mt-1" style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                      <div>
                        <h5 className="mb-1">Export & Share</h5>
                        <p className="mb-0 opacity-75">Save your designs and export netlists</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    className="btn btn-primary btn-lg rounded-pill px-4 shadow"
                    onClick={handleSimulatorClick}
                    style={{ transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Start Your First Circuit →
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg scroll-reveal" style={{ background: 'var(--bg-card)' }}>
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold text-light mb-3">Quick Tips</h5>
                  <div className="accordion" id="tipsAccordion">
                    <div className="accordion-item border-0 mb-2" style={{ background: 'var(--bg-tertiary)' }}>
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed text-light" type="button" data-bs-toggle="collapse" data-bs-target="#tip1" style={{ background: 'var(--bg-tertiary)' }}>
                          Keyboard Shortcuts
                        </button>
                      </h2>
                      <div id="tip1" className="accordion-collapse collapse" data-bs-parent="#tipsAccordion">
                        <div className="accordion-body text-light opacity-75">
                          Use <kbd>Ctrl+Z</kbd> to undo, <kbd>Ctrl+Y</kbd> to redo, and <kbd>Delete</kbd> to remove selected components.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item border-0 mb-2" style={{ background: 'var(--bg-tertiary)' }}>
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed text-light" type="button" data-bs-toggle="collapse" data-bs-target="#tip2" style={{ background: 'var(--bg-tertiary)' }}>
                          Component Connections
                        </button>
                      </h2>
                      <div id="tip2" className="accordion-collapse collapse" data-bs-parent="#tipsAccordion">
                        <div className="accordion-body text-light opacity-75">
                          Click on component terminals to connect them. The connection will be highlighted when valid.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item border-0" style={{ background: 'var(--bg-tertiary)' }}>
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed text-light" type="button" data-bs-toggle="collapse" data-bs-target="#tip3" style={{ background: 'var(--bg-tertiary)' }}>
                          Simulation Settings
                        </button>
                      </h2>
                      <div id="tip3" className="accordion-collapse collapse" data-bs-parent="#tipsAccordion">
                        <div className="accordion-body text-light opacity-75">
                          Adjust simulation parameters in the settings panel. DC analysis is instant, while AC and Transient may take longer for complex circuits.
                        </div>
                      </div>
                    </div>
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
      <footer className="text-center py-4" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="row mb-3">
            <div className="col-md-4 mb-3 mb-md-0">
              <h5 className="text-light mb-3">CircuitSim</h5>
              <p className="text-light opacity-75 small">
                Professional circuit simulation made simple. Build, analyze, and visualize electronic circuits in your browser.
              </p>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <h5 className="text-light mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li><a href="#features" className="text-light opacity-75 text-decoration-none" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
                <li><a href="#about" className="text-light opacity-75 text-decoration-none" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a></li>
                <li><a href="#use-cases" className="text-light opacity-75 text-decoration-none" onClick={(e) => { e.preventDefault(); scrollToSection('use-cases'); }}>Use Cases</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5 className="text-light mb-3">Resources</h5>
              <ul className="list-unstyled">
                <li><a href="/circuit" className="text-light opacity-75 text-decoration-none">Simulator</a></li>
                <li><a href="/blog" className="text-light opacity-75 text-decoration-none">Blog</a></li>
                <li><a href="https://github.com/sauravpanigrahi/circuit-simulator" className="text-light opacity-75 text-decoration-none" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              </ul>
            </div>
          </div>
          <hr className="my-3" style={{ borderColor: 'var(--border-color)' }} />
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