import React, { useEffect, useState } from 'react';

const ADMIN_EMAIL = 'josiahjohnmark9@gmail.com';
const DEFAULT_PASS = '08030804821';

const save = (key: string, val: any) => { localStorage.setItem('jj_' + key, JSON.stringify(val)); };
const load = (key: string, fallback: any) => {
  try {
    const v = localStorage.getItem('jj_' + key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const [activePanel, setActivePanel] = useState('stats');
  const [stats, setStats] = useState({ visitors: 0, projects: 0, skills: 0, messages: 0 });
  const [profile, setProfile] = useState<any>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [socials, setSocials] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [sections, setSections] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);

  const [newProject, setNewProject] = useState<any>({ title: '', skill: '', desc: '', link: '', gameLink: '', emoji: '', image: null });
  const [newSkill, setNewSkill] = useState('');
  const [newService, setNewService] = useState({ title: '', desc: '', icon: '' });
  const [newExp, setNewExp] = useState({ role: '', company: '', period: '', desc: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [securityError, setSecurityError] = useState('');

  const [toasts, setToasts] = useState<any>({});

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    }
  }, [isLoggedIn]);

  const refreshData = () => {
    const visitors = parseInt(localStorage.getItem('jj_visitors') || '0');
    const projectsData = load('projects', []);
    const skillsData = load('skills', ['Pencil Art', 'Game Dev', 'App Dev', 'Web Dev']);
    const messagesData = load('messages', []);
    const profileData = load('profile', {});
    const socialsData = load('socials', {});
    const settingsData = load('settings', {});
    const sectionsData = load('sections', {});
    const servicesData = load('services', []);
    const experienceData = load('experience', []);

    setStats({
      visitors,
      projects: projectsData.length,
      skills: skillsData.length,
      messages: messagesData.length
    });
    setProjects(projectsData);
    setSkills(skillsData);
    setMessages(messagesData);
    setProfile(profileData);
    setSocials(socialsData);
    setSettings(settingsData);
    setSections(sectionsData);
    setServices(servicesData);
    setExperience(experienceData);
  };

  const showToast = (key: string) => {
    setToasts((prev: any) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setToasts((prev: any) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  const handleCheckEmail = () => {
    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      // Direct login for admin email
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('This email is not registered as admin.');
    }
  };

  const handleLogin = () => {
    const storedPass = load('adminpass', DEFAULT_PASS);
    if (password === storedPass) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmailConfirmed(false);
    setEmail('');
    setPassword('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile((prev: any) => ({ ...prev, photo: ev.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    save('profile', profile);
    showToast('profile');
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const updatedProfile = { ...profile, cv: ev.target?.result };
      setProfile(updatedProfile);
      save('profile', updatedProfile);
    };
    reader.readAsDataURL(file);
  };

  const removeCV = () => {
    const updatedProfile = { ...profile };
    delete updatedProfile.cv;
    setProfile(updatedProfile);
    save('profile', updatedProfile);
  };

  const handleProjectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewProject((prev: any) => ({ ...prev, image: ev.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const addProject = () => {
    if (!newProject.title || !newProject.skill) {
      alert('Please add a title and select a skill.');
      return;
    }
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    save('projects', updatedProjects);
    setNewProject({ title: '', skill: '', desc: '', link: '', gameLink: '', emoji: '', image: null });
    refreshData();
    showToast('projects');
  };

  const deleteProject = (index: number) => {
    if (!confirm('Delete this project?')) return;
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
    save('projects', updatedProjects);
    refreshData();
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      save('skills', updatedSkills);
      refreshData();
    }
    setNewSkill('');
  };

  const deleteSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    save('skills', updatedSkills);
    refreshData();
  };

  const saveSocials = () => {
    save('socials', socials);
    showToast('socials');
  };

  const saveAppearance = () => {
    save('settings', settings);
    if (settings.glowColor) document.documentElement.style.setProperty('--glow-color', settings.glowColor);
    if (settings.glowIntensity !== undefined) document.documentElement.style.setProperty('--glow-intensity', settings.glowIntensity);
    showToast('appearance');
  };

  const saveSections = () => {
    save('sections', sections);
    showToast('sections');
  };

  const addService = () => {
    if (!newService.title) return;
    const updated = [...services, newService];
    setServices(updated);
    save('services', updated);
    setNewService({ title: '', desc: '', icon: '' });
    showToast('services');
  };

  const deleteService = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    save('services', updated);
  };

  const addExperience = () => {
    if (!newExp.role) return;
    const updated = [...experience, newExp];
    setExperience(updated);
    save('experience', updated);
    setNewExp({ role: '', company: '', period: '', desc: '' });
    showToast('experience');
  };

  const deleteExperience = (index: number) => {
    const updated = experience.filter((_, i) => i !== index);
    setExperience(updated);
    save('experience', updated);
  };

  const deleteMessage = (index: number) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);
    save('messages', updatedMessages);
    refreshData();
  };

  const changePassword = () => {
    const stored = load('adminpass', DEFAULT_PASS);
    setSecurityError('');
    if (passwords.current !== stored) { setSecurityError('Current password is wrong.'); return; }
    if (passwords.new.length < 8) { setSecurityError('New password must be at least 8 characters.'); return; }
    if (passwords.new !== passwords.confirm) { setSecurityError("Passwords don't match."); return; }
    save('adminpass', passwords.new);
    setPasswords({ current: '', new: '', confirm: '' });
    showToast('security');
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-body">
        <div id="login-page">
          <div className="login-grid-bg"></div>
          <div className="login-box">
            <div className="login-logo">JJ Admin</div>
            <div className="login-sub">Portfolio Control Panel</div>
            <a href="/" style={{ color: 'var(--blue)', textDecoration: 'none', fontSize: '13px', marginBottom: '20px', display: 'inline-block' }}>⬅️ Back to site</a>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@gmail.com"
                disabled={emailConfirmed}
              />
            </div>
            {emailConfirmed && (
              <div id="password-group">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    autoFocus
                  />
                </div>
                <div className="forgot-link" onClick={() => setShowForgot(!showForgot)}>Forgot password?</div>
                {showForgot && (
                  <div className="forgot-panel" style={{ display: 'block' }}>
                    To reset your password, send an email to <strong>josiahjohnmark9@gmail.com</strong> from your registered address with the subject: <strong>Reset Admin Password</strong>. You will receive instructions within 24 hours.
                  </div>
                )}
              </div>
            )}

            <button className="login-btn" onClick={emailConfirmed ? handleLogin : handleCheckEmail}>
              {emailConfirmed ? 'Login' : 'Continue'}
            </button>
            {loginError && <div className="login-error" style={{ display: 'block' }}>{loginError}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <div id="dashboard" style={{ display: 'block' }}>
        <nav className="dash-nav">
          <div className="dash-logo">JJ Admin</div>
          <div className="dash-nav-right">
            <a href="/" className="dash-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>⬅️</span> Back to site
            </a>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
        <div className="dash-body">
          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-section">Overview</div>
            <div className={`sidebar-item ${activePanel === 'stats' ? 'active' : ''}`} onClick={() => setActivePanel('stats')}>
              <span className="sidebar-icon">📊</span> Dashboard
            </div>
            <div className={`sidebar-item ${activePanel === 'messages' ? 'active' : ''}`} onClick={() => setActivePanel('messages')}>
              <span className="sidebar-icon">💬</span> Messages
              {stats.messages > 0 && <span id="msg-badge" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--blue)' }}>{stats.messages}</span>}
            </div>

            <div className="sidebar-section">My Portfolio</div>
            <div className={`sidebar-item ${activePanel === 'profile' ? 'active' : ''}`} onClick={() => setActivePanel('profile')}>
              <span className="sidebar-icon">👤</span> Profile
            </div>
            <div className={`sidebar-item ${activePanel === 'projects' ? 'active' : ''}`} onClick={() => setActivePanel('projects')}>
              <span className="sidebar-icon">🗂️</span> Projects
            </div>
            <div className={`sidebar-item ${activePanel === 'skills' ? 'active' : ''}`} onClick={() => setActivePanel('skills')}>
              <span className="sidebar-icon">⚡</span> Skills
            </div>
            <div className={`sidebar-item ${activePanel === 'socials' ? 'active' : ''}`} onClick={() => setActivePanel('socials')}>
              <span className="sidebar-icon">🔗</span> Social Links
            </div>
            <div className={`sidebar-item ${activePanel === 'services' ? 'active' : ''}`} onClick={() => setActivePanel('services')}>
              <span className="sidebar-icon">🛠️</span> Services
            </div>
            <div className={`sidebar-item ${activePanel === 'experience' ? 'active' : ''}`} onClick={() => setActivePanel('experience')}>
              <span className="sidebar-icon">💼</span> Experience
            </div>

            <div className="sidebar-section">Site Control</div>
            <div className={`sidebar-item ${activePanel === 'config' ? 'active' : ''}`} onClick={() => setActivePanel('config')}>
              <span className="sidebar-icon">⚙️</span> Site Config
            </div>
            <div className={`sidebar-item ${activePanel === 'appearance' ? 'active' : ''}`} onClick={() => setActivePanel('appearance')}>
              <span className="sidebar-icon">🎨</span> Appearance
            </div>
            <div className={`sidebar-item ${activePanel === 'sections' ? 'active' : ''}`} onClick={() => setActivePanel('sections')}>
              <span className="sidebar-icon">👁️</span> Sections
            </div>
            <div className={`sidebar-item ${activePanel === 'security' ? 'active' : ''}`} onClick={() => setActivePanel('security')}>
              <span className="sidebar-icon">🔒</span> Security
            </div>
          </div>

          {/* CONTENT */}
          <div className="dash-content">
            {/* STATS PANEL */}
            {activePanel === 'stats' && (
              <div className="dash-panel active">
                <div className="panel-title">Dashboard</div>
                <div className="panel-sub">Welcome back, Josiah. Here's your portfolio at a glance.</div>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-box-num">{stats.visitors.toLocaleString()}</div>
                    <div className="stat-box-label">Total visitors</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-num">{stats.projects}</div>
                    <div className="stat-box-label">Projects</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-num">{stats.skills}</div>
                    <div className="stat-box-label">Skills</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-num">{stats.messages}</div>
                    <div className="stat-box-label">Messages</div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-card-title">Quick actions</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button className="save-btn" onClick={() => setActivePanel('projects')}>+ Add project</button>
                    <button className="save-btn" onClick={() => setActivePanel('profile')} style={{ background: 'rgba(90,175,255,0.15)', color: 'var(--blue)', border: '1px solid var(--blue-border)' }}>Edit profile</button>
                    <button className="save-btn" onClick={() => setActivePanel('messages')} style={{ background: 'rgba(90,175,255,0.15)', color: 'var(--blue)', border: '1px solid var(--blue-border)' }}>View messages</button>
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE PANEL */}
            {activePanel === 'profile' && (
              <div className="dash-panel active">
                <div className="panel-title">Profile</div>
                <div className="panel-sub">Edit everything visitors see about you.</div>

                <div className="admin-card">
                  <div className="admin-card-title">Profile photo</div>
                  <div className="photo-upload-area" onClick={() => document.getElementById('photo-file')?.click()}>
                    {profile.photo ? (
                      <img className="photo-preview" src={profile.photo} alt="Preview" />
                    ) : (
                      <div id="photo-upload-placeholder">
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📷</div>
                        <div className="upload-label">Click to upload your photo<br /><span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>JPG, PNG — recommended 400x400px</span></div>
                      </div>
                    )}
                    <input type="file" id="photo-file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="save-btn" onClick={saveProfile}>Save photo</button>
                    <button className="del-btn" onClick={() => setProfile((p: any) => ({ ...p, photo: null }))}>Remove photo</button>
                  </div>
                </div>

                <div className="admin-card">
                  <div className="admin-card-title">Personal info</div>
                  <div className="form-row">
                    <div className="aform-group">
                      <label className="aform-label">Display name</label>
                      <input type="text" className="aform-input" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Josiah Johnmark" />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Location</label>
                      <input type="text" className="aform-input" value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="Abuja, Nigeria" />
                    </div>
                    <div className="aform-group full">
                      <label className="aform-label">Tagline</label>
                      <input type="text" className="aform-input" value={profile.tagline || ''} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} placeholder="Creative ideas that drive growth" />
                    </div>
                    <div className="aform-group full">
                      <label className="aform-label">Short about (shown on homepage hero)</label>
                      <textarea className="aform-textarea" rows={3} value={profile.aboutShort || ''} onChange={(e) => setProfile({ ...profile, aboutShort: e.target.value })} placeholder="Josiah Johnmark is a creative person based in..."></textarea>
                    </div>
                    <div className="aform-group full">
                      <label className="aform-label">Full bio (shown on About page)</label>
                      <textarea className="aform-textarea" rows={6} value={profile.aboutFull || ''} onChange={(e) => setProfile({ ...profile, aboutFull: e.target.value })} placeholder="Full biography..."></textarea>
                    </div>
                  </div>
                  <button className="save-btn" onClick={saveProfile}>Save profile</button>
                  <span className={`saved-toast ${toasts.profile ? 'show' : ''}`}>Saved!</span>
                </div>

                <div className="admin-card">
                  <div className="admin-card-title">CV / Resume</div>
                  <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                    Upload your CV as a PDF. Visitors can download it from the homepage.
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="file" id="cv-file" accept=".pdf" style={{ display: 'none' }} onChange={handleCVUpload} />
                    <button className="save-btn" onClick={() => document.getElementById('cv-file')?.click()}>Upload CV PDF</button>
                    <span id="cv-status" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{profile.cv ? 'CV uploaded' : ''}</span>
                    <button className="del-btn" onClick={removeCV}>Remove CV</button>
                  </div>
                </div>
              </div>
            )}

            {/* PROJECTS PANEL */}
            {activePanel === 'projects' && (
              <div className="dash-panel active">
                <div className="panel-title">Projects</div>
                <div className="panel-sub">Add and manage your portfolio projects.</div>

                <div className="admin-card">
                  <div className="admin-card-title">Add new project</div>
                  <div className="form-row">
                    <div className="aform-group">
                      <label className="aform-label">Project title</label>
                      <input type="text" className="aform-input" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="My awesome game" />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Skill category</label>
                      <select className="aform-select" value={newProject.skill} onChange={(e) => setNewProject({ ...newProject, skill: e.target.value })}>
                        <option value="">Select skill...</option>
                        {skills.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="aform-group full">
                      <label className="aform-label">Description</label>
                      <textarea className="aform-textarea" rows={2} value={newProject.desc} onChange={(e) => setNewProject({ ...newProject, desc: e.target.value })} placeholder="Short description of this project..."></textarea>
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Project / external link</label>
                      <input type="url" className="aform-input" value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Game embed link (if game)</label>
                      <input type="url" className="aform-input" value={newProject.gameLink} onChange={(e) => setNewProject({ ...newProject, gameLink: e.target.value })} placeholder="https://your-game-url.com" />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Emoji icon</label>
                      <input type="text" className="aform-input" value={newProject.emoji} onChange={(e) => setNewProject({ ...newProject, emoji: e.target.value })} placeholder="🎮" maxLength={2} />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Thumbnail image</label>
                      <input type="file" id="np-img" accept="image/*" style={{ display: 'none' }} onChange={handleProjectImage} />
                      <button className="save-btn" onClick={() => document.getElementById('np-img')?.click()} style={{ fontSize: '11px', padding: '8px 14px' }}>Upload image</button>
                      {newProject.image && <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>Image ready</span>}
                    </div>
                  </div>
                  <button className="save-btn" onClick={addProject}>Add project</button>
                  <span className={`saved-toast ${toasts.projects ? 'show' : ''}`}>Project added!</span>
                </div>

                <div className="admin-card">
                  <div className="admin-card-title">All projects</div>
                  <div className="proj-list">
                    {projects.length === 0 ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>No projects yet. Add one above.</div>
                    ) : (
                      projects.map((p, i) => (
                        <div key={i} className="proj-list-item">
                          <div className="proj-list-item-info">
                            <div className="proj-list-item-title">{p.emoji || ''} {p.title}</div>
                            <div className="proj-list-item-meta">{p.skill} {p.gameLink ? '· Has game embed' : ''}</div>
                          </div>
                          <div className="proj-list-item-actions">
                            <button className="del-btn" onClick={() => deleteProject(i)}>Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SKILLS PANEL */}
            {activePanel === 'skills' && (
              <div className="dash-panel active">
                <div className="panel-title">Skills</div>
                <div className="panel-sub">Add or remove the skills shown on your site.</div>
                <div className="admin-card">
                  <div className="admin-card-title">Your skills</div>
                  <div className="skills-list">
                    {skills.map((s, i) => (
                      <div key={i} className="skill-chip">
                        {s}
                        <span className="skill-chip-del" onClick={() => deleteSkill(i)}>×</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" className="aform-input" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g. UI/UX Design" style={{ maxWidth: '280px' }} onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
                    <button className="save-btn" onClick={addSkill}>Add skill</button>
                  </div>
                </div>
              </div>
            )}

            {/* SOCIALS PANEL */}
            {activePanel === 'socials' && (
              <div className="dash-panel active">
                <div className="panel-title">Social links</div>
                <div className="panel-sub">Paste your profile links. Leave blank to hide from the site.</div>
                <div className="admin-card">
                  <div className="form-row">
                    <div className="aform-group">
                      <label className="aform-label">Instagram</label>
                      <input type="url" className="aform-input" value={socials.instagram || ''} onChange={(e) => setSocials({ ...socials, instagram: e.target.value })} placeholder="https://instagram.com/..." />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">X (Twitter)</label>
                      <input type="url" className="aform-input" value={socials.x || ''} onChange={(e) => setSocials({ ...socials, x: e.target.value })} placeholder="https://x.com/..." />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">LinkedIn</label>
                      <input type="url" className="aform-input" value={socials.linkedin || ''} onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Telegram</label>
                      <input type="url" className="aform-input" value={socials.telegram || ''} onChange={(e) => setSocials({ ...socials, telegram: e.target.value })} placeholder="https://t.me/..." />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">GitHub (optional)</label>
                      <input type="url" className="aform-input" value={socials.github || ''} onChange={(e) => setSocials({ ...socials, github: e.target.value })} placeholder="https://github.com/..." />
                    </div>
                  </div>
                  <button className="save-btn" onClick={saveSocials}>Save links</button>
                  <span className={`saved-toast ${toasts.socials ? 'show' : ''}`}>Saved!</span>
                </div>
              </div>
            )}

            {/* SITE CONFIG PANEL */}
            {activePanel === 'config' && (
              <div className="dash-panel active">
                <div className="panel-title">Site configuration</div>
                <div className="panel-sub">Global settings for your portfolio.</div>
                <div className="admin-card">
                  <div className="form-row">
                    <div className="aform-group">
                      <label className="aform-label">Site name (Navbar)</label>
                      <input type="text" className="aform-input" value={settings.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} placeholder="Josiah Johnmark" />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Hero greeting</label>
                      <input type="text" className="aform-input" value={settings.heroGreeting || ''} onChange={(e) => setSettings({ ...settings, heroGreeting: e.target.value })} placeholder="Hello, I am" />
                    </div>
                    <div className="aform-group full">
                      <label className="aform-label">Footer copyright text</label>
                      <input type="text" className="aform-input" value={settings.footerText || ''} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} placeholder="© 2025 Josiah Johnmark. All rights reserved." />
                    </div>
                  </div>
                  <button className="save-btn" onClick={saveAppearance}>Save config</button>
                  <span className={`saved-toast ${toasts.appearance ? 'show' : ''}`}>Saved!</span>
                </div>
              </div>
            )}

            {/* SERVICES PANEL */}
            {activePanel === 'services' && (
              <div className="dash-panel active">
                <div className="panel-title">Services</div>
                <div className="panel-sub">List the professional services you offer.</div>
                <div className="admin-card">
                  <div className="admin-card-title">Add new service</div>
                  <div className="form-row">
                    <div className="aform-group">
                      <label className="aform-label">Service title</label>
                      <input type="text" className="aform-input" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} placeholder="Pencil Portraiture" />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Icon emoji</label>
                      <input type="text" className="aform-input" value={newService.icon} onChange={(e) => setNewService({ ...newService, icon: e.target.value })} placeholder="✏️" />
                    </div>
                    <div className="aform-group full">
                      <label className="aform-label">Description</label>
                      <textarea className="aform-textarea" rows={2} value={newService.desc} onChange={(e) => setNewService({ ...newService, desc: e.target.value })} placeholder="Detailed realistic pencil drawings..."></textarea>
                    </div>
                  </div>
                  <button className="save-btn" onClick={addService}>Add service</button>
                  <span className={`saved-toast ${toasts.services ? 'show' : ''}`}>Service added!</span>
                </div>
                <div className="admin-card">
                  <div className="admin-card-title">Current services</div>
                  <div className="proj-list">
                    {services.map((s, i) => (
                      <div key={i} className="proj-list-item">
                        <div className="proj-list-item-info">
                          <div className="proj-list-item-title">{s.icon} {s.title}</div>
                        </div>
                        <button className="del-btn" onClick={() => deleteService(i)}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EXPERIENCE PANEL */}
            {activePanel === 'experience' && (
              <div className="dash-panel active">
                <div className="panel-title">Experience</div>
                <div className="panel-sub">Your professional journey and milestones.</div>
                <div className="admin-card">
                  <div className="admin-card-title">Add experience</div>
                  <div className="form-row">
                    <div className="aform-group">
                      <label className="aform-label">Role / Position</label>
                      <input type="text" className="aform-input" value={newExp.role} onChange={(e) => setNewExp({ ...newExp, role: e.target.value })} placeholder="Lead Artist" />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Company / Studio</label>
                      <input type="text" className="aform-input" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} placeholder="Freelance" />
                    </div>
                    <div className="aform-group">
                      <label className="aform-label">Period</label>
                      <input type="text" className="aform-input" value={newExp.period} onChange={(e) => setNewExp({ ...newExp, period: e.target.value })} placeholder="2020 - Present" />
                    </div>
                    <div className="aform-group full">
                      <label className="aform-label">Description</label>
                      <textarea className="aform-textarea" rows={2} value={newExp.desc} onChange={(e) => setNewExp({ ...newExp, desc: e.target.value })} placeholder="Responsibilities and achievements..."></textarea>
                    </div>
                  </div>
                  <button className="save-btn" onClick={addExperience}>Add experience</button>
                  <span className={`saved-toast ${toasts.experience ? 'show' : ''}`}>Experience added!</span>
                </div>
                <div className="admin-card">
                  <div className="admin-card-title">Timeline</div>
                  <div className="proj-list">
                    {experience.map((ex, i) => (
                      <div key={i} className="proj-list-item">
                        <div className="proj-list-item-info">
                          <div className="proj-list-item-title">{ex.role} @ {ex.company}</div>
                          <div className="proj-list-item-meta">{ex.period}</div>
                        </div>
                        <button className="del-btn" onClick={() => deleteExperience(i)}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* APPEARANCE PANEL */}
            {activePanel === 'appearance' && (
              <div className="dash-panel active">
                <div className="panel-title">Appearance</div>
                <div className="panel-sub">Control the glow colour and intensity across the site.</div>
                <div className="admin-card">
                  <div className="admin-card-title">Glow colour</div>
                  <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                    This controls the colour of the glow effects on all cards, pills, and animations.
                  </div>
                  <div className="color-picker-row" style={{ marginBottom: '20px' }}>
                    <div className="color-swatch-wrap">
                      <div className="color-preview" style={{ background: settings.glowColor || '#5aafff' }}></div>
                      <input type="color" value={settings.glowColor || '#5aafff'} onChange={(e) => setSettings({ ...settings, glowColor: e.target.value })} style={{ position: 'absolute', opacity: 0, width: '36px', height: '36px', top: 0, left: 0, cursor: 'pointer' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>Pick glow colour</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{settings.glowColor || '#5aafff'}</div>
                    </div>
                  </div>
                  <div className="aform-group">
                    <label className="aform-label">Glow intensity — <span>{parseFloat(settings.glowIntensity || '1').toFixed(1)}</span></label>
                    <input type="range" min="0.2" max="2" step="0.1" value={settings.glowIntensity || 1} onChange={(e) => setSettings({ ...settings, glowIntensity: e.target.value })} style={{ width: '100%', maxWidth: '300px', accentColor: 'var(--blue)' }} />
                  </div>
                  <button className="save-btn" onClick={saveAppearance}>Save appearance</button>
                  <span className={`saved-toast ${toasts.appearance ? 'show' : ''}`}>Saved!</span>
                </div>
              </div>
            )}

            {/* SECTIONS PANEL */}
            {activePanel === 'sections' && (
              <div className="dash-panel active">
                <div className="panel-title">Section visibility</div>
                <div className="panel-sub">Toggle any section on or off. Changes apply instantly to your live site.</div>
                <div className="admin-card">
                  {[
                    { key: 'hero', label: 'Hero / Banner' },
                    { key: 'projects', label: 'Projects gallery' },
                    { key: 'about-section', label: 'About me' },
                    { key: 'contact', label: 'Contact section' },
                    { key: 'stats-bar', label: 'Stats bar (projects count etc.)' },
                    { key: 'visitor-badge', label: 'Visitor counter' }
                  ].map(s => (
                    <div key={s.key} className="toggle-row">
                      <span className="toggle-label">{s.label}</span>
                      <label className="toggle">
                        <input type="checkbox" checked={sections[s.key] !== false} onChange={(e) => setSections({ ...sections, [s.key]: e.target.checked })} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                  <div style={{ marginTop: '16px' }}>
                    <button className="save-btn" onClick={saveSections}>Save visibility</button>
                    <span className={`saved-toast ${toasts.sections ? 'show' : ''}`}>Saved!</span>
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGES PANEL */}
            {activePanel === 'messages' && (
              <div className="dash-panel active">
                <div className="panel-title">Messages</div>
                <div className="panel-sub">Contact form messages from visitors.</div>
                <div>
                  {messages.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>No messages yet.</div>
                  ) : (
                    messages.map((m, i) => (
                      <div key={i} className="msg-item">
                        <div className="msg-header">
                          <div>
                            <div className="msg-name">{m.name}</div>
                            <div className="msg-email">{m.email}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="msg-date">{m.date}</div>
                            <button className="del-btn" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => deleteMessage(i)}>Delete</button>
                          </div>
                        </div>
                        <div className="msg-body">{m.msg}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SECURITY PANEL */}
            {activePanel === 'security' && (
              <div className="dash-panel active">
                <div className="panel-title">Security</div>
                <div className="panel-sub">Change your admin password.</div>
                <div className="admin-card">
                  <div className="admin-card-title">Change password</div>
                  <div className="aform-group">
                    <label className="aform-label">Current password</label>
                    <input type="password" class="aform-input" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="Current password" />
                  </div>
                  <div className="aform-group">
                    <label className="aform-label">New password</label>
                    <input type="password" class="aform-input" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="New password (min 8 characters)" />
                  </div>
                  <div className="aform-group">
                    <label className="aform-label">Confirm new password</label>
                    <input type="password" class="aform-input" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Repeat new password" />
                  </div>
                  <button className="save-btn" onClick={changePassword}>Update password</button>
                  <span className={`saved-toast ${toasts.security ? 'show' : ''}`}>Password updated!</span>
                  {securityError && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--danger)' }}>{securityError}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
