import React from 'react';
import { Navbar } from '../elements/navbar';
import { useDarkMode } from '../elements/darkMode';
import './homepage.css';

const DeveloperPage = () => {
  const { isDarkMode } = useDarkMode();

  const palette = {
    surface: isDarkMode ? 'rgba(15,23,42,0.96)' : '#ffffff',
    surfaceSoft: isDarkMode ? 'rgba(30,41,59,0.8)' : '#eef2ff',
    border: isDarkMode ? 'rgba(148,163,184,0.3)' : '#e5e7eb',
    text: isDarkMode ? '#e5edff' : '#0f172a',
    muted: isDarkMode ? '#9ca3af' : '#4b5563',
    accent: '#6366f1',
  };

  const developers = [
    {
      name: 'Saurav Panigrahi',
      role: 'Student Developer & Circuit Enthusiast',
      subtitle: 'Bringing modern web UI to circuit simulation',
      avatarLetter: 'D',
      linkedin: 'https://www.linkedin.com/in/your-linkedin-id',
      scholar: 'https://scholar.google.com/citations?user=your-scholar-id',
      highlights: [
        'Designed the interactive circuit canvas and simulation workflow.',
        'Built the frontend experience with React, dark mode, and smooth animations.',
        'Integrated API calls and helped shape the overall UX for learners.',
      ],
    },
    {
      name: 'Dr.Rakesh Sinha',
      role: 'Faculty Mentor & Domain Expert',
      subtitle: 'Guiding the Theory and validation behind the tool',
      avatarLetter: 'T',
      linkedin: 'https://www.linkedin.com/in/rakesh-sinha-4b50a525/',
      orcid: 'https://orcid.org/0000-0003-0592-8505',
      highlights: [
        'Provided core guidance on circuit theory and simulation correctness.',
        'Reviewed algorithms and helped validate analysis results.',
        'Shaped the learning outcomes so students can trust the tool.',
      ],
    },
  ];

  return (
    <div
      className={`${isDarkMode ? 'dark-theme' : 'light-theme'} page-load`}
      style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif", color: palette.text }}
    >
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <Navbar />

      <div
        className="position-relative"
        style={{
          background: isDarkMode
            ? 'radial-gradient(circle at 10% 0%, rgba(56,189,248,0.18), transparent 45%), ' +
              'radial-gradient(circle at 90% 10%, rgba(129,140,248,0.18), transparent 45%), ' +
              'linear-gradient(140deg, var(--bg-primary) 0%, #020617 40%, var(--bg-secondary) 100%)'
            : 'radial-gradient(circle at 0% 0%, rgba(191,219,254,0.8), transparent 55%), ' +
              'radial-gradient(circle at 100% 0%, rgba(221,214,254,0.9), transparent 55%), ' +
              'linear-gradient(150deg, #f9fafb 0%, #eef2ff 45%, #e0f2fe 100%)',
          minHeight: '100vh',
          paddingTop: '4rem',
        }}
      >
        <div className="sine-wave-background d-none d-md-block">
          <svg className="sine-wave" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path
              className="sine-path"
              d="M0,200 Q300,100 600,200 T1200,200"
              fill="none"
              stroke="rgba(99, 102, 241, 0.08)"
              strokeWidth="2"
            />
            <path
              className="sine-path-delayed"
              d="M0,220 Q300,120 600,220 T1200,220"
              fill="none"
              stroke="rgba(56, 189, 248, 0.12)"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
          {/* Hero */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <p
                className="text-uppercase mb-2"
                style={{ letterSpacing: '0.16em', fontSize: '0.78rem', color: palette.muted }}
              >
                Behind CircuitSim
              </p>
              <h1
                className="fw-bold mb-3 text-gradient"
                style={{ fontSize: '2.6rem', lineHeight: 1.1 }}
              >
                Meet the developers building this simulator
              </h1>
              <p
                className="mx-auto"
                style={{
                  maxWidth: '640px',
                  color: palette.muted,
                  fontSize: '0.98rem',
                }}
              >
                CircuitSim is a collaborative project between a passionate student developer and an
                experienced teacher. Together, we’re turning circuit theory into a beautiful,
                interactive learning experience you can explore right in your browser.
              </p>
            </div>
          </div>

          {/* Developer cards */}
          <div className="row g-4 mb-5">
            {developers.map((dev, idx) => (
              <div key={dev.name} className="col-lg-6">
                <div
                  className="card border-0 shadow-lg h-100"
                  style={{
                    background: palette.surface,
                    borderRadius: '22px',
                    border: `1px solid ${palette.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '6px',
                      background:
                        idx === 0
                          ? 'linear-gradient(90deg, #22d3ee, #6366f1)'
                          : 'linear-gradient(90deg, #a855f7, #f97316)',
                    }}
                  />
                  <div className="card-body p-4 p-md-5">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div
                        className="d-inline-flex align-items-center justify-content-center"
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '20px',
                          background:
                            idx === 0
                              ? 'linear-gradient(135deg, #22d3ee, #6366f1)'
                              : 'linear-gradient(135deg, #f97316, #a855f7)',
                          color: '#020617',
                          fontWeight: 800,
                          fontSize: '1.8rem',
                        }}
                      >
                        {dev.avatarLetter}
                      </div>
                      <div>
                        <h3 className="fw-semibold mb-1" style={{ color: palette.text }}>
                          {dev.name}
                        </h3>
                        <div style={{ color: palette.muted, fontSize: '0.9rem' }}>{dev.role}</div>
                      </div>
                    </div>

                    <p style={{ color: palette.text, fontWeight: 500 }} className="mb-3">
                      {dev.subtitle}
                    </p>
                    <ul
                      className="mb-3"
                      style={{
                        listStyle: 'none',
                        paddingLeft: 0,
                        marginBottom: '1rem',
                        fontSize: '0.95rem',
                        color: palette.muted,
                      }}
                    >
                      {dev.highlights.map((h) => (
                        <li key={h} className="mb-2 d-flex">
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '999px',
                              background: palette.accent,
                              marginTop: '7px',
                              marginRight: '10px',
                              flexShrink: 0,
                            }}
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {dev.linkedin && (
                        <a
                          href={dev.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm d-inline-flex align-items-center gap-2"
                          style={{
                            background: palette.surfaceSoft,
                            color: palette.text,
                            border: `1px solid ${palette.border}`,
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            paddingInline: '0.95rem',
                          }}
                        >
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '999px',
                              background: '#0a66c2',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                            }}
                          >
                            in
                          </span>
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {dev.orcid && (
                        <a
                          href={dev.orcid}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm d-inline-flex align-items-center gap-2"
                          style={{
                            background: palette.surfaceSoft,
                            color: palette.text,
                            border: `1px solid ${palette.border}`,
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            paddingInline: '0.95rem',
                          }}
                        >
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '999px',
                              background: '#a6ce39',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            iD
                          </span>
                          <span>ORCID</span>
                        </a>
                      )}
                      {dev.scholar && !dev.orcid && (
                        <a
                          href={dev.scholar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm d-inline-flex align-items-center gap-2"
                          style={{
                            background: palette.surfaceSoft,
                            color: palette.text,
                            border: `1px solid ${palette.border}`,
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            paddingInline: '0.95rem',
                          }}
                        >
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '6px',
                              background: '#4285f4',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            G
                          </span>
                          <span>Google Scholar</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vision / timeline */}
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-7">
              <div
                className="card border-0 shadow-lg h-100"
                style={{
                  background: palette.surface,
                  borderRadius: '22px',
                  border: `1px solid ${palette.border}`,
                }}
              >
                <div className="card-body p-4 p-md-5">
                  <p
                    className="text-uppercase mb-1"
                    style={{ letterSpacing: '0.16em', fontSize: '0.78rem', color: palette.muted }}
                  >
                    Why we built this
                  </p>
                  <h4 className="fw-bold mb-3" style={{ color: palette.text }}>
                    From classroom concepts to an interactive lab
                  </h4>
                  <p style={{ color: palette.muted, fontSize: '0.95rem' }}>
                    This project started as a way to make circuit analysis feel less like a static
                    textbook and more like a living lab. Instead of solving everything on paper, we
                    wanted you to be able to drag components, run simulations, and immediately see
                    how theory behaves in real circuits.
                  </p>
                  <p style={{ color: palette.muted, fontSize: '0.95rem' }}>
                    The student developer focuses on UI, usability, and the overall flow, while the
                    teacher ensures the tool stays accurate, reliable, and aligned with real
                    engineering practice. That blend of design + domain expertise is at the heart of
                    CircuitSim.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div
                className="card border-0 shadow-lg h-100"
                style={{
                  background: palette.surface,
                  borderRadius: '22px',
                  border: `1px solid ${palette.border}`,
                }}
              >
                <div className="card-body p-4 p-md-5">
                  <p
                    className="text-uppercase mb-1"
                    style={{ letterSpacing: '0.16em', fontSize: '0.78rem', color: palette.muted }}
                  >
                    Project highlights
                  </p>
                  <h4 className="fw-bold mb-3" style={{ color: palette.text }}>
                    What you’re using today
                  </h4>
                  <ul
                    style={{
                      listStyle: 'none',
                      paddingLeft: 0,
                      marginBottom: 0,
                      color: palette.muted,
                      fontSize: '0.95rem',
                    }}
                  >
                    <li className="mb-2">
                      ✔ Modern, responsive interface that works on desktops and laptops.
                    </li>
                    <li className="mb-2">
                      ✔ Dark mode by default, tuned for long study and design sessions.
                    </li>
                    <li className="mb-2">
                      ✔ Circuit canvas, analysis views, and blog built as part of one experience.
                    </li>
                    <li className="mb-2">
                      ✔ Room to grow: more components, AI assistance, and features coming next.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-5" style={{ color: palette.muted, fontSize: '0.9rem' }}>
            Built with curiosity, late-night debugging, and a lot of coffee. If this tool helps you
            learn or prototype faster, that’s a win for us.
          </div>
        </div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </div>
  );
};

export default DeveloperPage;


