import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
// import "./blog.css";
const THEME_STORAGE_KEY = 'csim_theme';


const Blog = () => {
  // In your actual code, you would use: const navigate = useNavigate();
  const navigate= useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [posts, setPosts] = useState([]);

  const back = () => {
    navigate('/');
  };

  const form = () => {
    navigate('/blog/form');
  };
  const use = () => {
    navigate('/use');
  };
  // Initialize theme from localStorage
  useEffect(() => {
    // In your actual code, uncomment the next two lines:
    // const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    // const prefersDark = !savedTheme || savedTheme === 'dark';
    const prefersDark = true; // Simulated for demo
    setIsDarkMode(prefersDark);
  }, []);

  // Apply theme to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      document.body.setAttribute('data-bs-theme', 'dark');
      // In your actual code, uncomment: localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      document.body.setAttribute('data-bs-theme', 'light');
      // In your actual code, uncomment: localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((d) => !d);

  // Fetch posts from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/blog/form");
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchData();
  }, []);

  const formattedDate = (iso) => {
    try {
      return new Date(iso).toLocaleString([], {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />
                  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />



      <div className="theme-transition">
        {/* Enhanced Header */}
        <header className="blog-header">
          <div>
            <div className="circuit-navbar">
              <span className="navbar-brand logo-pulse logo-text fw-bold fs-3"><i className="fas fa-microchip me-2"></i>CircuitSim</span>
              <div className="navbar-controls d-flex align-items-center gap-3">
                <button 
                  className="btn btn-outline-primary btn-sm rounded-pill"
                  onClick={toggleDarkMode}
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDarkMode ? "☀️" : "🌙"}
                </button>
                <button className="back-btn" onClick={back}>⬅ Back to Home</button>
                <button className="btn back-btn btn-primary px-4 py-2  rounded fw-semibold" onClick={use}>
                    How to use
                  </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container-fluid py-5 mt-5">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
              
              {/* Hero Section */}
              <div className="text-center mb-5 fade-in">
                <div className="d-flex justify-content-center align-items-center mb-3 gap-3">
                  <h2 className="display-5 fw-bold m-0">
                    Engineering <span className="logo-gradient">Insights</span>
                  </h2>
                 
                </div>

                <p className="lead text-muted mb-4">
                  Discover the latest in circuit simulation, tutorials, and engineering excellence
                </p>
              </div>


              {/* Add Post Card */}
              <div className="row justify-content-center mb-5">
                <div className="col-12 col-lg-8">
                  <div 
                    className="card add-post-card theme-transition cursor-pointer"
                    role="button"
                    onClick={form}
                  >
                    <div className="card-body text-center py-4">
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                          <i className="bi bi-plus-circle-fill text-primary fs-3"></i>
                        </div>
                        <div className="text-start">
                          <h5 className="mb-1 fw-semibold">Add your content</h5>
                          <p className="text-muted mb-0 small">
                            Create a new post and contribute to the engineering community
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts Section */}
              <section className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="posts-header fw-bold mb-3">Latest Posts</h3>
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">
                      <i className="bi bi-collection me-1"></i>
                      {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                    </span>
                  </div>
                </div>

                {/* Posts Grid */}
                {posts.length === 0 ? (
                  <div className="text-center py-5 fade-in">
                    <div className="mb-4">
                      <i className="bi bi-journal-text text-muted" style={{fontSize: '4rem'}}></i>
                    </div>
                    <h4 className="text-muted mb-2">No posts yet</h4>
                    <p className="text-muted">Be the first to share something amazing!</p>
                    <button 
                      className="btn btn-primary rounded-pill px-4 mt-3"
                      onClick={form}
                    >
                      <i className="bi bi-plus-lg me-2"></i>
                      Create First Post
                    </button>
                  </div>
                ) : (
                  <div className="row g-4">
                    {posts.map((post, index) => (
                      <div key={index} className={`col-12 col-md-6 col-lg-12 stagger-animation stagger-${(index % 5) + 1}`}>

                        <article className="card h-100 card-hover theme-transition border-0 shadow-sm">
                          <div className="card-body d-flex flex-column p-4">
                            {/* Post Title */}
                            <h5 className="card-title fw-bold mb-3 lh-sm">
                              {post.title}
                            </h5>
                            
                            {/* Post Meta */}
                            <div className="d-flex align-items-center gap-3 mb-3 post-meta text-muted">
                              <div className="d-flex align-items-center gap-1">
                                <i className="bi bi-person-circle"></i>
                                <span>{post.author || 'Anonymous'}</span>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <i className="bi bi-calendar3"></i>
                                <time dateTime={post.date}>
                                  {formattedDate(post.date)}
                                </time>
                              </div>
                            </div>
                            
                            {/* Post Content Preview */}
                            <p className="card-text post-content text-muted flex-grow-1" 
                               style={{whiteSpace: 'pre-wrap'}}>
                              {post.content}
                            </p>
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Bootstrap JS */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </>
  );
};

export default Blog;