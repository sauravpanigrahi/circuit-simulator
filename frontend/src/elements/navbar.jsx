import React, { useState, useEffect } from "react";
import { useNavigate,useLocation  } from "react-router-dom";
import { Zap } from "lucide-react";
import { useDarkMode } from "./darkMode";

// -------------------- 
// Main Navbar
// -------------------- 
export const MainNavbar = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check authentication status from localStorage
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(authStatus === 'true');
    };
    
    checkAuth();
    
    // Listen for storage changes (when user signs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    // Listen for custom auth event (when user signs in/out in same tab)
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    // Dispatch custom event to update navbar
    window.dispatchEvent(new Event('authStateChanged'));
    navigate('/');
  };

  const userName = localStorage.getItem('userName') || 'User';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownElement = document.getElementById('accountDropdown');
      const dropdownMenu = event.target.closest('.dropdown');
      
      if (showAccountDropdown && dropdownMenu === null && event.target !== dropdownElement && !dropdownElement?.contains(event.target)) {
        setShowAccountDropdown(false);
      }
    };

    if (showAccountDropdown) {
      // Use setTimeout to avoid immediate closure when clicking the button
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAccountDropdown]);

  return (
    <nav className={`navbar navbar-expand-lg ${isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} ${headerScrolled ? 'shadow' : ''} fixed-top`}>
      <div className="container-fluid px-4">
        <a className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" href="/" style={{color: isDarkMode ? '#00d4ff' : '#0066cc'}}>
          <Zap size={28} fill={isDarkMode ? '#00d4ff' : '#0066cc'} />
          CircuitSim
        </a>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsNavbarExpanded(!isNavbarExpanded)}
          aria-controls="navbarMain" 
          aria-expanded={isNavbarExpanded} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isNavbarExpanded ? 'show' : ''}`} id="navbarMain">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a 
                className="nav-link px-3" 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('features');
                  setIsNavbarExpanded(false);
                }}
              >
                Features
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link px-3" 
                href="/blog" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/blog');
                  setIsNavbarExpanded(false);
                }}
              >
                Blog
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link px-3" 
                href="#about" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('about');
                  setIsNavbarExpanded(false);
                }}
              >
                About
              </a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            <button 
              className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} btn-sm`}
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            
            {/* Account Dropdown */}
            <div className="dropdown" style={{ position: 'relative' }}>
              <button 
                className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} dropdown-toggle`}
                type="button"
                id="accountDropdown"
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                aria-expanded={showAccountDropdown}
                style={{ minWidth: '100px' }}
              >
                Account
              </button>
              {showAccountDropdown && (
                <ul 
                  className={`dropdown-menu dropdown-menu-end show ${isDarkMode ? 'dropdown-menu-dark' : ''}`}
                  aria-labelledby="accountDropdown"
                  style={{
                    minWidth: '180px',
                    marginTop: '8px',
                    display: 'block',
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    zIndex: 1000,
                    backgroundColor: isDarkMode ? '#212529' : '#fff',
                    border: `1px solid ${isDarkMode ? '#444' : '#dee2e6'}`,
                    borderRadius: '0.375rem',
                    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
                  }}
                >
                {!isAuthenticated ? (
                  <>
                    <li>
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          setShowAccountDropdown(false);
                          navigate('/signin');
                        }}
                        style={{ cursor: 'pointer', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', border: 'none', background: 'transparent', color: isDarkMode ? '#fff' : '#212529' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = isDarkMode ? '#2c3034' : '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Sign In
                      </button>
                    </li>
                    <li>
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          setShowAccountDropdown(false);
                          navigate('/signup');
                        }}
                        style={{ cursor: 'pointer', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', border: 'none', background: 'transparent', color: isDarkMode ? '#fff' : '#212529' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = isDarkMode ? '#2c3034' : '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Sign Up
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <h6 className="dropdown-header" style={{ padding: '0.5rem 1rem', margin: 0, fontSize: '0.875rem', fontWeight: 600, color: isDarkMode ? '#6c757d' : '#6c757d' }}>
                        {userName}
                      </h6>
                    </li>
                    <li>
                      <hr className="dropdown-divider" style={{ margin: '0.5rem 0', borderTop: `1px solid ${isDarkMode ? '#444' : '#dee2e6'}` }} />
                    </li>
                    <li>
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          setShowAccountDropdown(false);
                          navigate('/account');
                        }}
                        style={{ cursor: 'pointer', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', border: 'none', background: 'transparent', color: isDarkMode ? '#fff' : '#212529' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = isDarkMode ? '#2c3034' : '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        My Account
                      </button>
                    </li>
                    <li>
                      <button 
                        className="dropdown-item text-danger"
                        onClick={() => {
                          setShowAccountDropdown(false);
                          handleLogout();
                        }}
                        style={{ cursor: 'pointer', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', border: 'none', background: 'transparent', color: '#dc3545' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = isDarkMode ? '#2c3034' : '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Logout
                      </button>
                    </li>
                  </>
                )}
                </ul>
              )}
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => {
                navigate('/circuit');
                setIsNavbarExpanded(false);
              }}
              style={{
                backgroundColor: isDarkMode ? '#00d4ff' : '#0066cc',
                borderColor: isDarkMode ? '#00d4ff' : '#0066cc'
              }}
            >
              Launch Simulator
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// -------------------- 
// Secondary Navbar
// -------------------- 
export const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
  const back=()=>{
    window.history.back()
}

  return (
    <>
       <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />

    
    <nav className={`navbar navbar-expand-lg ${isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} shadow-sm`}>
      <div className="container-fluid px-4">
        <a className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" href="/" style={{color: isDarkMode ? '#00d4ff' : '#0066cc'}}>
          <Zap size={28} fill={isDarkMode ? '#00d4ff' : '#0066cc'} />
          CircuitSim
        </a>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsNavbarExpanded(!isNavbarExpanded)}
          aria-controls="navbarSecondary" 
          aria-expanded={isNavbarExpanded} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isNavbarExpanded ? 'show' : ''}`} id="navbarSecondary">
          <div className="ms-auto d-flex align-items-center gap-2">
            <button 
              className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} btn-sm`}
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            {
              pathname === '/circuit' && (
                <button 
                  className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} btn-md`}
                  onClick={() => {
                    navigate('/ai-analysis');
                    setIsNavbarExpanded(false);
                  }}
                  disabled
                >
                  Ai analysis
                  </button>
                )
              }
             {pathname!=='/use' && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                navigate('/use');
                setIsNavbarExpanded(false);
              }}
              style={{
                backgroundColor: isDarkMode ? '#00d4ff' : '#0066cc',
                borderColor: isDarkMode ? '#00d4ff' : '#0066cc'
              }}
            >
              How to use
            </button>)}
            <button className="btn glass-btn border rounded px-3" onClick={() => {
              back();
              setIsNavbarExpanded(false);
            }}>
                <i className="fas fa-arrow-left me-2"></i>Back to Home
            </button>
          </div>
        </div>
      </div>
    </nav>
    </>
    
  );
};