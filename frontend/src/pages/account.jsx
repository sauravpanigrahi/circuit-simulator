import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../elements/navbar';
import { useDarkMode } from '../elements/darkMode';
import './homepage.css';

const AccountPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const palette = {
    surface: isDarkMode ? 'rgba(15,23,42,0.9)' : '#ffffff',
    surfaceSoft: isDarkMode ? 'rgba(30,41,59,0.75)' : '#f4f6fb',
    border: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    text: isDarkMode ? '#e8ecf8' : '#0b1224',
    muted: isDarkMode ? '#9fb1c7' : '#4b5563',
    chip: isDarkMode ? 'rgba(255,255,255,0.06)' : '#eef2ff',
    glow: isDarkMode ? '0 12px 40px rgba(56,189,248,0.18)' : '0 10px 30px rgba(99,102,241,0.14)',
  };
  const [profile, setProfile] = useState({
    name: 'Circuit Builder',
    email: 'you@circuitsim.app',
    role: 'Devloper',
    plan: 'Starter',
  });
  const [preferences, setPreferences] = useState(() => {
    const stored = localStorage.getItem('accountPreferences');
    return (
      (stored && JSON.parse(stored)) || {
        news: true,
        productUpdates: true,
        autoSave: true,
        twoFactor: false,
      }
    );
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const storedName =
      localStorage.getItem('name') ||
      localStorage.getItem('userName') ||
      'Circuit Builder';
    const storedEmail =
      localStorage.getItem('email') ||
      localStorage.getItem('userEmail') ||
      'you@circuitsim.app';
    const storedPlan = localStorage.getItem('plan') || 'Starter';
    const storedRole = localStorage.getItem('role') || 'Devloper';
    setProfile({
      name: storedName,
      email: storedEmail,
      plan: storedPlan,
      role: storedRole,
    });
  }, []);

  const handlePreferenceToggle = (key) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('accountPreferences', JSON.stringify(next));
      return next;
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('name', profile.name);
    localStorage.setItem('userName', profile.name);
    localStorage.setItem('email', profile.email);
    localStorage.setItem('userEmail', profile.email);
    localStorage.setItem('plan', profile.plan);
    localStorage.setItem('role', profile.role);
    window.dispatchEvent(new Event('authStateChanged'));
    setStatus('Your profile was updated.');
    setTimeout(() => setStatus(''), 2200);
  };

  const quickLinks = [
    // {
    //   title: 'Open Simulator',
    //   description: 'Jump straight into the canvas.',
    //   action: () => navigate('/circuit'),
    //   icon: '🚀',
    //   accent: '#00d4ff',
    // },
    {
      title: 'Documentation',
      description: 'Brush up on how to build quickly.',
      action: () => navigate('/use'),
      icon: '📘',
      accent: '#8b5cf6',
    },
    {
      title: 'Read the Blog',
      description: 'Product updates and tips.',
      action: () => navigate('/blog'),
      icon: '✍️',
      accent: '#f59e0b',
    },
    {
      title: 'Meet the developers',
      description: 'Learn about who built CircuitSim.',
      action: () => navigate('/'),
      icon: '👨‍💻',
      accent: '#22c55e',
    },
  ];

  const activity = [
    { label: 'Saved a new design', detail: 'Class-A Amplifier', time: '2h ago' },
    { label: 'Ran transient analysis', detail: 'Pulse generator board', time: '1d ago' },
    { label: 'Shared a circuit', detail: 'Op-amp filter', time: '3d ago' },
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
              stroke="rgba(139, 92, 246, 0.06)"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
          <div className="row g-4 mb-4 align-items-center">
            <div className="col-lg-8">
              <div
                className="card border-0 shadow-lg"
                style={{
                  background: palette.surface,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: `1px solid ${palette.border}`,
                  boxShadow: palette.glow,
                }}
              >
                <div className="card-body p-4 p-md-5 d-flex flex-column flex-md-row align-items-center gap-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center"
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '24px',
                      background: 'linear-gradient(135deg, #00d4ff 0%, #6366f1 100%)',
                      color: '#0b1224',
                      fontSize: '2.4rem',
                      fontWeight: 800,
                    }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow-1 text-center text-md-start">
                    <p className="text-uppercase mb-1" style={{ letterSpacing: '0.12em', color: palette.muted, fontSize: '0.78rem' }}>
                      Account Overview
                    </p>
                    <h1 className="fw-bold mb-2" style={{ color: palette.text }}>{profile.name}</h1>
                    <p className="mb-1" style={{ color: palette.muted }}>{profile.email}</p>
                    <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                      <span className="badge rounded-pill px-3 py-2" style={{ background: palette.chip, color: '#7c3aed', border: `1px solid ${palette.border}` }}>
                        {profile.plan} Plan
                      </span>
                      <span className="badge rounded-pill px-3 py-2" style={{ background: palette.chip, color: '#10b981', border: `1px solid ${palette.border}` }}>
                        {profile.role}
                      </span>
                      <span className="badge rounded-pill px-3 py-2" style={{ background: palette.chip, color: '#0ea5e9', border: `1px solid ${palette.border}` }}>
                        Dark mode: {isDarkMode ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      className={`btn mb-2 w-100 ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
                      onClick={toggleDarkMode}
                    >
                      Toggle Theme
                    </button>
                    <button
                      className="btn btn-primary w-100"
                      style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed', boxShadow: '0 10px 30px rgba(124,58,237,0.3)' }}
                      onClick={() => navigate('/circuit')}
                    >
                      Launch Simulator
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div
                className="card border-0 shadow-lg h-100"
                style={{ background: palette.surface, borderRadius: '20px', border: `1px solid ${palette.border}` }}
              >
                <div className="card-body p-4">
                  <p className="text-uppercase mb-1" style={{ letterSpacing: '0.12em', color: palette.muted, fontSize: '0.78rem' }}>
                    Snapshot
                  </p>
                  <h5 className="fw-bold mb-3" style={{ color: palette.text }}>Your stats</h5>
                  <div className="d-grid gap-3">
                    {[
                      { label: 'Projects', value: '12', color: '#00d4ff' },
                      { label: 'Simulations', value: '34', color: '#8b5cf6' },
                      { label: 'Shared', value: '7', color: '#f59e0b' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="d-flex align-items-center justify-content-between px-3 py-2 rounded"
                        style={{ background: palette.surfaceSoft, border: `1px solid ${palette.border}` }}
                      >
                        <span style={{ color: palette.muted }}>{item.label}</span>
                        <span className="fw-bold" style={{ color: item.color }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              <div
                className="card border-0 shadow-lg mb-4"
                style={{ background: palette.surface, borderRadius: '20px', border: `1px solid ${palette.border}` }}
              >
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div>
                      <p className="text-uppercase mb-1" style={{ letterSpacing: '0.12em', color: palette.muted, fontSize: '0.78rem' }}>
                        Profile
                      </p>
                      <h5 className="fw-bold mb-0" style={{ color: palette.text }}>Personal details</h5>
                    </div>
                    {status && (
                      <span
                        className="badge px-3 py-2"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)' }}
                      >
                        {status}
                      </span>
                    )}
                  </div>
                  <form className="row g-3" onSubmit={handleSaveProfile}>
                    <div className="col-md-6">
                      <label className="form-label" style={{ color: palette.muted }}>Full name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        required
                        style={{
                          background: isDarkMode ? '#111827' : '#f9fafb',
                          color: palette.text,
                          border: `1px solid ${palette.border}`,
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ color: palette.muted }}>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        required
                        style={{
                          background: isDarkMode ? '#111827' : '#f9fafb',
                          color: palette.text,
                          border: `1px solid ${palette.border}`,
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ color: palette.muted }}>Role</label>
                      <input
                        type="text"
                        className="form-control"
                        name="role"
                        value={profile.role}
                        onChange={handleProfileChange}
                        style={{
                          background: isDarkMode ? '#111827' : '#f9fafb',
                          color: palette.text,
                          border: `1px solid ${palette.border}`,
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ color: palette.muted }}>Plan</label>
                      <select
                        className="form-select"
                        name="plan"
                        value={profile.plan}
                        onChange={handleProfileChange}
                        style={{
                          background: isDarkMode ? '#111827' : '#f9fafb',
                          color: palette.text,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <option value="Starter">Starter</option>
                        <option value="Pro">Pro</option>
                        <option value="Team">Team</option>
                      </select>
                    </div>
                    <div className="col-12 d-flex flex-wrap gap-2 justify-content-end">
                      {/* <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/pricing')}>
                        View plans
                      </button> */}
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ backgroundColor: '#0ea5e9', borderColor: '#0ea5e9', boxShadow: '0 10px 26px rgba(14,165,233,0.35)' }}
                      >
                        Save changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div
                className="card border-0 shadow-lg"
                style={{ background: palette.surface, borderRadius: '20px', border: `1px solid ${palette.border}` }}
              >
                <div className="card-body p-4 p-md-5">
                  <p className="text-uppercase mb-1" style={{ letterSpacing: '0.12em', color: palette.muted, fontSize: '0.78rem' }}>
                    Recent activity
                  </p>
                  <h5 className="fw-bold mb-4" style={{ color: palette.text }}>What you’ve been up to</h5>
                  <div className="list-group list-group-flush">
                    {activity.map((item, idx) => (
                      <div
                        key={idx}
                        className="list-group-item d-flex align-items-center"
                        style={{
                          background: 'transparent',
                          borderColor: palette.border,
                          color: palette.text,
                        }}
                      >
                        <div
                          className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '44px',
                            height: '44px',
                            background: 'rgba(0,212,255,0.12)',
                            color: '#00d4ff',
                            fontWeight: 700,
                          }}
                        >
                          •
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{item.label}</div>
                          <div className="small" style={{ color: palette.muted }}>{item.detail}</div>
                        </div>
                        <span className="small" style={{ color: palette.muted }}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div
                className="card border-0 shadow-lg mb-4"
                style={{ background: palette.surface, borderRadius: '20px', border: `1px solid ${palette.border}` }}
              >
                <div className="card-body p-4">
                  <p className="text-uppercase mb-1" style={{ letterSpacing: '0.12em', color: palette.muted, fontSize: '0.78rem' }}>
                    Quick actions
                  </p>
                  <h5 className="fw-bold mb-3" style={{ color: palette.text }}>Jump back in</h5>
                  <div className="d-grid gap-3">
                    {quickLinks.map((link) => (
                      <button
                        key={link.title}
                        className="btn w-100 text-start p-3 border-0 shadow-sm"
                        onClick={link.action}
                        style={{
                          background: palette.surfaceSoft,
                          color: palette.text,
                          borderRadius: '16px',
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className="d-inline-flex align-items-center justify-content-center rounded"
                            style={{
                              width: '44px',
                              height: '44px',
                              background: `${link.accent}22`,
                              color: link.accent,
                              fontSize: '1.4rem',
                            }}
                          >
                            {link.icon}
                          </span>
                          <div>
                            <div className="fw-semibold">{link.title}</div>
                            <div className="small" style={{ color: palette.muted }}>{link.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="card border-0 shadow-lg"
                style={{ background: palette.surface, borderRadius: '20px', border: `1px solid ${palette.border}` }}
              >
                <div className="card-body p-4">
                  <p className="text-uppercase mb-1" style={{ letterSpacing: '0.12em', color: palette.muted, fontSize: '0.78rem' }}>
                    Preferences
                  </p>
                  <h5 className="fw-bold mb-3" style={{ color: palette.text }}>Stay in sync</h5>
                  <div className="d-grid gap-3">
                    {[
                      { key: 'news', label: 'Product announcements' },
                      { key: 'productUpdates', label: 'Simulation tips & tricks' },
                      { key: 'autoSave', label: 'Auto-save drafts' },
                      { key: 'twoFactor', label: 'Two-factor reminders' },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="d-flex align-items-center justify-content-between p-2 px-3 rounded"
                        style={{ background: palette.surfaceSoft, border: `1px solid ${palette.border}` }}
                      >
                        <div style={{ color: palette.text }}>{item.label}</div>
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={preferences[item.key]}
                            onChange={() => handlePreferenceToggle(item.key)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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

export default AccountPage;

