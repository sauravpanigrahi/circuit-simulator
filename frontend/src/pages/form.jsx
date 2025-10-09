import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import './form.css';
import axios from "axios";

const THEME_STORAGE_KEY = 'csim_theme';
const POSTS_STORAGE_KEY = 'csim_blog_posts';
const Form=()=>{
    const [isDarkMode, setIsDarkMode] = useState(true);
    const navigate = useNavigate();
    const toggleDarkMode = () => setIsDarkMode((d) => !d);
    const [form,setform]=useState({
        title:'',
        content:'',
        author:'',
        
    })
    // const [posts, setPosts] = useState([]);
    // const [justAddedId, setJustAddedId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

   
    const back = () => navigate('/blog');

    // Initialize theme from localStorage
    useEffect(() => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const prefersDark = !savedTheme || savedTheme === 'dark';
      setIsDarkMode(prefersDark);
    }, []);

    // Apply theme to body
    useEffect(() => {
      if (isDarkMode) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        localStorage.setItem(THEME_STORAGE_KEY, 'light');
      }
    }, [isDarkMode]);
    const onchange=(e)=>{
        const{id,value}=e.target;
        setform(prevstate=>{
            return{
                ...prevstate,
                [id]:value

            }
        })
    }
    // const isSubmitDisabled = useMemo(() => {
    //     return title.trim().length === 0 || content.trim().length === 0;
    //   }, [title, content]);
    
      const submit = async (e) => {
        e.preventDefault();
        try{
            const response= await axios.post("http://127.0.0.1:8000/blog/form",form,{
                withCredentials: true

            })
            setform({ title: '', content: '', author: '' }); 
            toast.success("Blog Posted")
            navigate("/blog")
            console.log(form)
        }catch(err){
            console.log(err)
            toast.error("Blog Not Posted")
        }

      }

    // const handleKeyDown = (e) => {
    //   if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    //     e.preventDefault();
    //     // Let form onSubmit handle validation and submission
    //     const formEl = e.currentTarget.closest('form');
    //     if (formEl) formEl.requestSubmit();
    //   }
    // };

    return(
      <div className={`form-page ${isDarkMode ? 'dark-theme' : 'light-theme'} page-load`}>
        {/* Bootstrap CSS */}
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
          rel="stylesheet" 
        />
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
                <button className="back-btn" onClick={back}>⬅ Back to Blog</button>
              </div>
            </div>
          </div>
        </header>
        
        <section className="blog-form-section row ">
        <div className={`container col-8 style ${isDarkMode ? "dark-shadow" : "light-shadow"}`}>
          <div className="blog-form card-like form-shell">
            <div className="d-flex justify-content-between align-items-center mb-3 " style={{color: isDarkMode ? "white" : "black"}}>
              <h2 className="m-0">Add a Blog Post</h2>
              
            </div>

            <form  className="form-grid" onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="title" className="form-label field-label" style={{color: isDarkMode ? "white" : "black"}}>Blog Title</label>
                <input
                  id="title"
                  type="text"
                  className="form-control form-control-dark"
                  placeholder="Enter a descriptive title"
                  value={form.title}
                  onChange={onchange}
                />
                {/* <div className="char-count">{form.title.length} characters</div> */}
              </div>

              <div className="form-group">
                <label htmlFor="content" className="form-label field-label" style={{color: isDarkMode ? "white" : "black"}}>Blog Content</label>
                <textarea
                  id="content"
                  rows={8}
                  className="form-control form-control-dark"
                  placeholder="Write your post..."
                  value={form.content}
                  onChange={onchange}
                />
                {/* <div className="char-count">{form.content.length} characters</div> */}
              </div>

              <div className="form-group">
                <label htmlFor="author" className="form-label field-label" style={{color: isDarkMode ? "white" : "black"}}>Author Name</label>
                <input
                  id="author"
                  type="text"
                  className="form-control form-control-dark"
                  placeholder="Your name"
                  value={form.author}
                  onChange={onchange}
                />
              </div>

              <div className="submit-row d-flex justify-content-between align-items-center">
                <button 
                  type="submit"
                  className="btn btn-primary btn-glow rounded-pill px-4"
                >
                  Post
                </button>
                {showSuccess && (
                <div className="submit-success" role="status" aria-live="polite">
                  <span className="me-2" style={{color: isDarkMode ? "white" : "black"}}>✅</span> Posted!
                </div>
              )}
              </div>
            </form>
          </div>
        </div>
        </section>
      </div>
    )
}
export default Form;