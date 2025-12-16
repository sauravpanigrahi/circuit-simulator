import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../elements/navbar';
import { useDarkMode } from '../elements/darkMode';
import './homepage.css';
import axios from 'axios';
import {toast} from 'react-toastify';

const SignUp = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to top on mount and prevent layout shift
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    // Prevent any scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    
    // Simulate API call (frontend only)
    try{
        const response = await axios.post('http://localhost:8000/auth/signup', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
        console.log('Signup successful:', response.data);
        console.log(formData);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userName', response.data.name);
        localStorage.setItem('userEmail', response.data.email);
        setIsLoading(false);
        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event('authStateChanged'));
        toast.success('Signup successful!');
        navigate('/');
        
    }
    catch(error){
        console.error('Signup failed:', error.response ? error.response.data : error.message);
        setIsLoading(false);
        toast.error(error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Signup failed. Please try again.');

    
  };
}

  return (
    <div className={`${isDarkMode ? 'dark-theme' : 'light-theme'} page-load`}>
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <Navbar />
      
      <div className="container" style={{ minHeight: 'calc(100vh - 76px)', paddingTop: '2rem' }}>
        <div className="row justify-content-center align-items-center">
          <div className="col-lg-5 col-md-7 col-sm-10">
            <div className="card border-0 shadow-lg" style={{ 
              background: isDarkMode ? 'var(--bg-card)' : '#fff',
              borderRadius: '15px',
              overflow: 'hidden'
            }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-2" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                    Sign Up
                  </h2>
                  <p className="text-muted">Create your account to get started.</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      style={{
                        background: isDarkMode ? 'var(--bg-tertiary)' : '#f8f9fa',
                        color: isDarkMode ? '#fff' : '#000',
                        border: `1px solid ${isDarkMode ? '#444' : '#dee2e6'}`
                      }}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      style={{
                        background: isDarkMode ? 'var(--bg-tertiary)' : '#f8f9fa',
                        color: isDarkMode ? '#fff' : '#000',
                        border: `1px solid ${isDarkMode ? '#444' : '#dee2e6'}`
                      }}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      style={{
                        background: isDarkMode ? 'var(--bg-tertiary)' : '#f8f9fa',
                        color: isDarkMode ? '#fff' : '#000',
                        border: `1px solid ${isDarkMode ? '#444' : '#dee2e6'}`
                      }}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      style={{
                        background: isDarkMode ? 'var(--bg-tertiary)' : '#f8f9fa',
                        color: isDarkMode ? '#fff' : '#000',
                        border: `1px solid ${isDarkMode ? '#444' : '#dee2e6'}`
                      }}
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">{errors.confirmPassword}</div>
                    )}
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="agreeTerms"
                      required
                    />
                    <label className="form-check-label" htmlFor="agreeTerms" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                      I agree to the Terms and Conditions
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 mb-3"
                    disabled={isLoading}
                    
                    style={{
                      backgroundColor: isDarkMode ? '#00d4ff' : '#0066cc',
                      borderColor: isDarkMode ? '#00d4ff' : '#0066cc',
                      borderRadius: '8px',
                      fontWeight: '600'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="mb-2" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                    Already have an account?{' '}
                    <Link 
                      to="/signin" 
                      style={{ 
                        color: isDarkMode ? '#00d4ff' : '#0066cc',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      Sign In
                    </Link>
                  </p>
                  <Link 
                    to="/" 
                    style={{ 
                      color: isDarkMode ? '#888' : '#666',
                      textDecoration: 'none',
                      fontSize: '0.9rem'
                    }}
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </div>
  );
};

export default SignUp;

