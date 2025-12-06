import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Navbar } from '../elements/navbar';
import { useDarkMode } from '../elements/darkMode';

const Blog = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const form = () => {
    navigate('/form');
  };

  // Fetch posts from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://circuit-simulator.onrender.com/blog/form");
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete blog post
  const handleDelete = async (postId, e) => {
    e.stopPropagation(); // Prevent any parent click events
    
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setDeleting(postId);
      await axios.delete(`https://circuit-simulator.onrender.com/blog/${postId}`);
      toast.success("Post deleted successfully");
      // Refresh the posts list
      await fetchData();
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  };

  const formattedDate = (iso) => {
    try {
      return new Date(iso).toLocaleString([], {
        year: 'numeric', 
        month: 'short', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div 
      className={`${isDarkMode ? 'dark-theme' : 'light-theme'} theme-transition`}
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <Navbar />
      
      <main style={{ paddingTop: '5px', minHeight: '100vh' }}>
        <div className="container py-2" style={{ maxWidth: '1200px' }}>
          
          {/* Hero Section */}
          <div 
            className="text-center mb-5 p-5 rounded-bottom"
            style={{
              background: `linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)`,
              borderRadius: '0 0 2rem 2rem'
            }}
          >
            <h1 
              className="display-3 fw-bold mb-3"
              style={{
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Engineering <span style={{ color: 'var(--primary-color)' }}>Insights</span>
            </h1>
            <p 
              className="lead mx-auto"
              style={{ 
                color: 'var(--text-secondary)',
                maxWidth: '600px'
              }}
            >
              Discover the latest in circuit simulation, tutorials, and engineering excellence
            </p>
          </div>

          {/* Add Post Card */}
          <div 
            className="card mb-5 border-2 border-dashed"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={form}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-color)';
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                form();
              }
            }}
            aria-label="Add new blog post"
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-center gap-4">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                    color: 'white',
                    fontSize: '1.5rem',
                    boxShadow: 'var(--glow-primary)'
                  }}
                >
                  <i className="bi bi-plus-lg"></i>
                </div>
                <div className="text-start">
                  <h5 className="mb-1 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    Add Your Content
                  </h5>
                  <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
                    Create a new post and contribute to the engineering community
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Posts Section */}
          <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
            <span 
              className="badge px-3 py-2 rounded-pill d-flex align-items-center gap-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              <i className="bi bi-journal-text"></i>
              <span>{posts.length} {posts.length === 1 ? 'Post' : 'Posts'}</span>
            </span>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-5">
              <div className="mb-4">
                <i 
                  className="bi bi-journal-text"
                  style={{ 
                    fontSize: '5rem',
                    color: 'var(--text-muted)',
                    opacity: 0.5
                  }}
                ></i>
              </div>
              <h3 className="mb-2" style={{ color: 'var(--text-secondary)' }}>No posts yet</h3>
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                Be the first to share something amazing!
              </p>
              <button 
                className="btn btn-primary px-4 py-2 rounded"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  border: 'none',
                  fontWeight: 600
                }}
                onClick={form}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Create First Post
              </button>
            </div>
          ) : (
            /* Posts Grid */
            <div className="row g-4">
              {posts.map((post, index) => (
                <div key={post._id} className="col-12  col-lg-12">
                  <article 
                    className="card h-100 border-0 shadow-sm position-relative"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <div 
                      className="position-absolute top-0 start-0"
                      style={{
                        width: '4px',
                        height: '100%',
                        background: 'linear-gradient(180deg, var(--primary-color), var(--secondary-color))',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = 1;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = 0;
                      }}
                    ></div>
                    <div className="card-body d-flex flex-column p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                        <h5 
                          className="card-title fw-bold mb-0 flex-grow-1"
                          style={{ 
                            color: 'var(--text-primary)',
                            fontSize: '1.5rem',
                            lineHeight: 1.3
                          }}
                        >
                          {post.title}
                        </h5>
                        <button
                          className="btn btn-link p-2 text-danger"
                          style={{
                            minWidth: '36px',
                            height: '36px',
                            textDecoration: 'none'
                          }}
                          onClick={(e) => handleDelete(post._id, e)}
                          disabled={deleting === post._id}
                          aria-label="Delete post"
                          title="Delete post"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {deleting === post._id ? (
                            <div className="spinner-border spinner-border-sm text-danger" role="status">
                              <span className="visually-hidden">Deleting...</span>
                            </div>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </div>
                      
                      <div 
                        className="d-flex align-items-center gap-3 mb-3 flex-wrap"
                        style={{ 
                          fontSize: '0.9rem',
                          color: 'var(--text-muted)'
                        }}
                      >
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
                      
                      <p 
                        className="card-text flex-grow-1 mb-0"
                        style={{ 
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}
                      >
                        {post.content}
                      </p>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blog;