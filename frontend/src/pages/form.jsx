import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import './form.css';
import axios from "axios";
import { Navbar } from '../elements/navbar';
import { useDarkMode } from '../elements/darkMode';
const Form=()=>{
    const { isDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const [form,setform]=useState({
        title:'',
        content:'',
        author:'',
    })
    // const [posts, setPosts] = useState([]);
    // const [justAddedId, setJustAddedId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const back = () => navigate('/blog');
    const onchange=(e)=>{
        const{id,value}=e.target;
        setform(prevstate=>{
            return{
                ...prevstate,
                [id]:value
            }
        })
    }
    const submit = async (e) => {
      e.preventDefault();
      try{
          const response= await axios.post("https://circuit-simulator.onrender.com/blog/form",form,{
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
    return(
      <div className={`form-page ${isDarkMode ? 'dark-theme' : 'light-theme'} page-load`}>
        {/* Bootstrap CSS */}
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
          rel="stylesheet" 
        />
        <Navbar/>
        
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