import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './use.css';
const THEME_STORAGE_KEY = 'csim_theme';

const Use = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate=useNavigate();
    const simulate = () => {
      navigate("/simulator")
    };
    const back=()=>{
        window.history.back()
    }

    // Initialize theme
    useEffect(() => {
      const prefersDark = true; // Simulated for demo
      setIsDarkMode(prefersDark);
    }, []);
  
    // Apply theme to body
    useEffect(() => {
      if (isDarkMode) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        document.body.setAttribute('data-bs-theme', 'dark');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        document.body.setAttribute('data-bs-theme', 'light');
      }
    }, [isDarkMode]);
  
    const toggleDarkMode = () => setIsDarkMode((d) => !d);

    return (
        <>
            <link
                href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
                rel="stylesheet"
            />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />

            <div className="theme-transition">
                {/* Hero Welcome Section */}
                <section className="hero-welcome d-flex flex-column">
                    <nav className="navbar glass-nav">
                        <div className="container">
                        <span className="navbar-brand brand-logo" style={{cursor:"pointer"}}>
                            <i className="fas fa-microchip me-2"></i>CircuitSim
                            </span>

                            <div className="d-flex align-items-center gap-3  p-3 ">
                
                            <button 
                                className="btn theme-btn border rounded px-3"
                                onClick={toggleDarkMode}
                                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {isDarkMode ? "☀️" : "🌙"}
                            </button>

                            <button className="btn glass-btn border rounded px-3" onClick={back}>
                                <i className="fas fa-arrow-left me-2"></i>Back to Home
                            </button>
                            </div>


                        </div>
                    </nav>
                    
                    <div className="container flex-grow-1 d-flex align-items-center">
                        <div className="row w-100">
                            <div className="col-lg-8 mx-auto text-center">
                                <h3 className="display-3 fw-bold mb-4">
                                    Welcome to CircuitSim!
                                </h3>
                                <p className="lead fs-3 mb-5">
                                    Your first time here? Let's get you started with circuit simulation in just a few easy steps.
                                </p>
                                
                                <div className="welcome-card">
                                    <div className="row align-items-center">
                                        <div className="col-md-8">
                                            <h3 className="h2 mb-3">New to Circuit Design?</h3>
                                            <p className="fs-5 mb-0">
                                                Don't worry! This guide will walk you through everything you need to know 
                                                to start creating and analyzing electronic circuits like a pro.
                                            </p>
                                        </div>
                                        <div className="col-md-4">
                                            <i className="fas fa-graduation-cap" style={{fontSize: '5rem', opacity: '0.8'}}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How to Use - 3 Simple Steps */}
                <section className="step-container">
                    <div className="container">
                        <div className="text-center mb-5">
                            <h2 className="display-4 fw-bold text-primary mb-3">
                                How to Use CircuitSim
                            </h2>
                            <p className="lead text-muted fs-4">
                                Follow these 5 simple steps to create your first circuit
                            </p>
                        </div>
                        
                        <div className="row g-4">
                        <div className="col-lg-4">
  <div className="step-card text-center">
    <div className="step-number">1</div>
    {/* <i className="fas fa-mouse-pointer feature-icon text-primary"></i> */}
    <h3 className="h4 mb-3 fw-bold">Open Circuit Designer</h3>
    
    <p className="text-muted mb-4 text-justify">
      Click the <strong>"Launch Simulator"</strong> button on the homepage. 
      This opens our interactive canvas where you'll build your circuit.
    </p>
    
    <div className="alert alert-light text-justify mb-3">
      <i className="fas fa-lightbulb text-warning me-2"></i>
      <small>
        The designer opens in the same tab, so you can reference this guide anytime!
      </small>
    </div>

    <div className="alert alert-light text-justify mb-3">
      <i className="fas fa-bolt text-success me-2"></i>
      <small>
        On the <strong>right side panel</strong>, you can view detailed 
        <strong> component information</strong> and see the desired output 
        of <em>voltage</em> and <em>current</em> in either 
        <strong> normal</strong> or <strong>phasor format</strong>.
      </small>
    </div>

    <div className="alert alert-light text-justify">
      <i className="fas fa-code text-info me-2"></i>
      <small>
        In the <strong>Netlist</strong> section, you’ll find details of the 
        generated netlist, which is created when you click on 
        <strong> "Generate Netlist"</strong>.
      </small>
    </div>
  </div>
</div>

                            
<div className="col-lg-4">
  <div className="step-card text-center">
    <div className="step-number">2</div>
    {/* <i className="fas fa-puzzle-piece feature-icon text-success"></i> */}
    <h3 className="h4 mb-3 fw-bold">Build Your Circuit</h3>
    
    <p className="text-muted mb-4 text-justify">
      First, select a component from the toolbar. Then click on two nodes in the canvas — 
      the component will be placed between them.  
      <br />
      ⚠️ Note: Don’t select nodes diagonally.
    </p>

    <div className="alert alert-light text-justify mb-3">
      <i className="fas fa-magic text-success me-2"></i>
      <small>
        Double-click a component to edit its values and properties.
      </small>
    </div>

    <div className="alert alert-light text-justify">
      <i className="fas fa-cubes text-primary me-2"></i>
      <small>
        <strong>Available Components:</strong><br />
        R (Resistor), C (Capacitor), L (Inductor),  
        AC (AC Source), DC (DC Source),  
        VCVS (Voltage-Controlled Voltage Source),  
        CCCS (Current-Controlled Current Source),  
        VCCS (Voltage-Controlled Current Source),  
        CCVS (Current-Controlled Voltage Source),  
        Q<sub>npn</sub> (NPN Transistor), Q<sub>pnp</sub> (PNP Transistor),  
        M<sub>n</sub> (NMOS), M<sub>p</sub> (PMOS),  
        W (Wire), D (Diode).
      </small>
    </div>
  </div>
</div>

                            
                            <div className="col-lg-4">
                                <div className="step-card text-center">
                                    <div className="step-number">3</div>
                                    {/* <i className="fas fa-play-circle feature-icon text-info"></i> */}
                                    <h3 className="h4 mb-3 fw-bold">Working with Components</h3>
                                    
                                    <p className="text-muted mb-4 text-justify">
                                    Initially, the <strong>"Remove"</strong> button is disabled.  
                                    Once you select a component with a single click, the button becomes active.  
                                    Clicking on the remove button will delete that component from the circuit.
                                    </p>
                                    
                                    <div className="alert alert-light mb-3 text-justify">
                                    <i className="fas fa-bolt text-warning me-2"></i>
                                    <small><strong>Set Ground:</strong> Add a ground to the circuit to complete connections.</small>
                                    </div>

                                    <div className="alert alert-light">
                                    <i className="fas fa-code text-success me-2 text-justify "></i>
                                    <small><strong>Generate Netlist:</strong> Shows how the netlist is created with components connected between nodes, along with their magnitudes.</small>
                                    </div>
                                </div>
                                </div>

                                <div className="col-lg-4">
                    <div className="step-card text-center">
                        <div className="step-number">4</div>
                        {/* <i className="fas fa-play-circle feature-icon text-info"></i> */}
                        <h3 className="h4 mb-3 fw-bold">Run Simulation</h3>
                        
                        <p className="text-muted mb-4 text-justify">
                        Choose the type of simulation you want to perform — currently supported options are 
                        <strong> DC</strong>, <strong>AC</strong>, and <strong>Transient Analysis</strong>.  
                        You need to manually set the frequency for your simulation.  
                        </p>

                        <p className="text-muted mb-4 text-justify">
                        After clicking <strong>"Run Simulation"</strong>, the circuit will be processed.  
                        It may take some time before the desired output is displayed.
                        </p>

                        <div className="alert alert-light text-justify">
                        <i className="fas fa-chart-line text-info me-2"></i>
                        <small>
                            <strong>View Result:</strong> See outputs in both <em>phasor format diagrams</em> 
                            and <em>real-time plots</em> of voltage and current versus time.
                        </small>
                        </div>
                    </div>
                    </div>


                    <div className="col-lg-4">
                                <div className="step-card text-center">
                                    <div className="step-number">5</div>
                                    {/* <i className="fas fa-play-circle feature-icon text-info"></i> */}
                                    <h3 className="h4 mb-3 fw-bold">Parameter Analysis</h3>
                                    
                                    <p className="text-muted mb-4 text-justify">
                                    Choose the simulation parameter — currently supported options are 
                                    <strong> Z</strong> (Impedance) and <strong> Y</strong> (Admittance).  
                                    If your circuit includes <strong>capacitors</strong> or <strong>inductors</strong>, 
                                    you must set a frequency. For circuits with only <strong>resistors</strong>, 
                                    no frequency is required.
                                    </p>

                                    <p className="text-muted mb-4 text-justify">
                                    Define the ports for analysis:  
                                    <strong>P1N1</strong> = Port&nbsp;1 Node&nbsp;1,  
                                    <strong>P1N2</strong> = Port&nbsp;1 Node&nbsp;2,  
                                    <strong>P2N1</strong> = Port&nbsp;2 Node&nbsp;1,  
                                    <strong>P2N2</strong> = Port&nbsp;2 Node&nbsp;2.  
                                    </p>

                                    <div className="alert alert-light text-justify">
                                    <i className="fas fa-info-circle text-secondary me-2"></i>
                                    <small>
                                        Currently, results are computed but no visualization is available.
                                    </small>
                                    </div>
                                </div>
                                </div>

                                <div className="col-lg-4">
                            <div className="step-card text-center">
                                <div className="step-number">6</div>
                                {/* <i className="fas fa-adjust feature-icon text-dark"></i> */}
                                <h3 className="h4 mb-3 fw-bold">Modes & About</h3>
                                
                                <p className="text-muted mb-4 text-justify">
                                You can switch between <strong>Light Mode</strong> and <strong>Dark Mode</strong> 
                                for a more comfortable viewing experience. The toggle is available 
                                in the top-right corner of the page.
                                </p>

                                <p className="text-muted mb-4 text-justify">
  This website is an <strong>interactive circuit simulator</strong> designed to make learning and experimentation simple.  
</p>

<p className="text-muted mb-4 text-justify">
  If you find any <strong>bugs</strong> or have <strong>suggestions</strong>, feel free to reach out — we’d love your feedback!
</p>

                                <div className="alert alert-light text-justify">
                                <i className="fas fa-lightbulb text-warning me-2"></i>
                                <small>
                                    Designed for students, hobbyists, and engineers — making circuit 
                                    design simple and interactive!
                                </small>
                                </div>
                            </div>
                            </div>




                        </div>
                    </div>
                </section>

            

                {/* Website Navigation Guide */}
                <section className="navigation-guide">
                    <div className="container">
                        <div className="text-center mb-5">
                            <h2 className="display-4 fw-bold text-primary mb-3">
                                Navigating the Website
                            </h2>
                            <p className="lead text-muted">
                                Here's what you'll find on our homepage
                            </p>
                        </div>
                        
                        <div className="row g-4">
                            <div className="col-lg-3 col-md-6">
                                <div className="nav-item-card text-center">
                                    <i className="fas fa-tools fs-1 text-primary mb-3"></i>
                                    <h5 className="fw-bold mb-3">Circuit Designer</h5>
                                    <p className="text-muted small">
                                        The main tool where you'll create and simulate circuits. 
                                        This is where the magic happens!
                                    </p>
                                </div>
                            </div>
                            
                            <div className="col-lg-3 col-md-6">
                                <div className="nav-item-card text-center">
                                    <i className="fas fa-book fs-1 text-success mb-3"></i>
                                    <h5 className="fw-bold mb-3">How to Use</h5>
                                    <p className="text-muted small">
                                        This guide you're reading now! Always available 
                                        when you need help getting started.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="col-lg-3 col-md-6">
                                <div className="nav-item-card text-center">
                                    <i className="fas fa-lightbulb fs-1 text-warning mb-3"></i>
                                    <h5 className="fw-bold mb-3">Example Circuits</h5>
                                    <p className="text-muted small">
                                        Pre-built circuits to inspire you and show 
                                        what's possible with CircuitSim.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="col-lg-3 col-md-6">
                                <div className="nav-item-card text-center">
                                    <i className="fas fa-cog fs-1 text-info mb-3"></i>
                                    <h5 className="fw-bold mb-3">Settings</h5>
                                    <p className="text-muted small">
                                        Customize your experience with themes, 
                                        preferences, and simulation options.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

               
               
                {/* Call to Action */}
                <section className="cta-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 mx-auto">
                                <h2 className="display-3 fw-bold mb-4">Ready to Get Started?</h2>
                                <p className="lead fs-4 mb-5">
                                    You now know everything you need to begin your circuit simulation journey. 
                                    Let's create something amazing!
                                </p>
                                <div className="d-flex flex-wrap justify-content-center gap-3">
                                    <button className="start-btn" onClick={simulate}>
                                        <i className="fas fa-rocket me-2"></i>
                                        Start Circuit Design
                                    </button>
                                    {/* <button className="start-btn" style={{background: 'transparent', border: '2px solid white', color: 'white'}}>
                                        <i className="fas fa-play me-2"></i>
                                        Watch Tutorial
                                    </button> */}
                                </div>
                                
                                <div className="mt-5 pt-4">
                                    <p className="text-white-50">
                                        <i className="fas fa-star me-2"></i>
                                        Join thousands of students and engineers using CircuitSim for their projects
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default Use;