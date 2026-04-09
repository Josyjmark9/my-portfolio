import React, { useEffect, useState } from 'react';
import { 
  LogOut, 
  ArrowLeft, 
  Loader2, 
  Save, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Shield, 
  Settings, 
  Layout, 
  Palette, 
  Share2, 
  Briefcase, 
  Zap, 
  User, 
  MessageSquare, 
  BarChart3,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  Globe
} from 'lucide-react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from './firebase';

const ADMIN_EMAIL = 'josiahjohnmark9@gmail.com';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSaving, setIsSaving] = useState<any>({});

  const [activePanel, setActivePanel] = useState('stats');
  const [stats, setStats] = useState({ visitors: 0, projects: 0, skills: 0, messages: 0 });
  const [profile, setProfile] = useState<any>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [socials, setSocials] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [sections, setSections] = useState<any>({});
  const [sectionBackgrounds, setSectionBackgrounds] = useState<any>({});
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
    // Check for bypass first
    const bypass = localStorage.getItem('jj_admin_bypass');
    if (bypass === 'true') {
      setIsLoggedIn(true);
      setIsAuthChecking(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setIsAuthChecking(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const unsubProjects = onSnapshot(query(collection(db, 'projects'), orderBy('date', 'desc')), (snap) => {
        setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsubMessages = onSnapshot(query(collection(db, 'messages'), orderBy('date', 'desc')), (snap) => {
        setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsubProfile = onSnapshot(doc(db, 'profile', 'main'), (snap) => {
        if (snap.exists()) setProfile(snap.data());
      });
      const unsubSocials = onSnapshot(collection(db, 'socials'), (snap) => {
        const s: any = {};
        snap.docs.forEach(doc => {
          const data = doc.data();
          s[data.platform] = data.url;
        });
        setSocials(s);
      });
      const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (snap) => {
        if (snap.exists()) setSettings(snap.data());
      });
      const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
        setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsubExperience = onSnapshot(collection(db, 'experience'), (snap) => {
        setExperience(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsubVisibility = onSnapshot(doc(db, 'config', 'visibility'), (snap) => {
        if (snap.exists()) setSections(snap.data());
      });
      const unsubBackgrounds = onSnapshot(doc(db, 'config', 'backgrounds'), (snap) => {
        if (snap.exists()) setSectionBackgrounds(snap.data());
      });

      return () => {
        unsubProjects();
        unsubMessages();
        unsubProfile();
        unsubSocials();
        unsubSettings();
        unsubServices();
        unsubExperience();
        unsubVisibility();
        unsubBackgrounds();
      };
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setStats({
      visitors: 0, // We'll need a way to track visitors in Firestore if needed
      projects: projects.length,
      skills: 4, // Fixed for now
      messages: messages.filter(m => !m.read).length
    });
  }, [projects, messages]);

  const showToast = (key: string) => {
    setToasts((prev: any) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setToasts((prev: any) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setLoginError('Access denied. Only the administrator can log in.');
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError('Failed to log in with Google.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jj_admin_bypass');
    signOut(auth);
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

  const saveProfile = async () => {
    setIsSaving((prev: any) => ({ ...prev, profile: true }));
    try {
      await setDoc(doc(db, 'profile', 'main'), profile);
      showToast('profile');
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving((prev: any) => ({ ...prev, profile: false }));
    }
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const updatedProfile = { ...profile, cv: ev.target?.result };
      setProfile(updatedProfile);
      await setDoc(doc(db, 'profile', 'main'), updatedProfile);
    };
    reader.readAsDataURL(file);
  };

  const removeCV = async () => {
    const updatedProfile = { ...profile };
    delete updatedProfile.cv;
    setProfile(updatedProfile);
    await setDoc(doc(db, 'profile', 'main'), updatedProfile);
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

  const addProject = async () => {
    if (!newProject.title || !newProject.skill) {
      alert('Please add a title and select a skill.');
      return;
    }
    setIsSaving((prev: any) => ({ ...prev, projects: true }));
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        date: new Date().toISOString()
      });
      setNewProject({ title: '', skill: '', desc: '', link: '', gameLink: '', emoji: '', image: null });
      showToast('projects');
    } catch (error) {
      console.error("Error adding project:", error);
    } finally {
      setIsSaving((prev: any) => ({ ...prev, projects: false }));
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    setIsSaving((prev: any) => ({ ...prev, skills: true }));
    try {
      // Skills are just a list, we can store them in a single doc or separate docs.
      // For simplicity, let's keep them in a collection.
      await addDoc(collection(db, 'skills'), { name: newSkill.trim() });
      setNewSkill('');
    } catch (error) {
      console.error("Error adding skill:", error);
    } finally {
      setIsSaving((prev: any) => ({ ...prev, skills: false }));
    }
  };

  const deleteSkill = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'skills', id));
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  const saveSocials = async () => {
    setIsSaving((prev: any) => ({ ...prev, socials: true }));
    try {
      // Socials are stored as platform: url. We can update each doc.
      for (const platform in socials) {
        await setDoc(doc(db, 'socials', platform), { platform, url: socials[platform] });
      }
      showToast('socials');
    } catch (error) {
      console.error("Error saving socials:", error);
    } finally {
      setIsSaving((prev: any) => ({ ...prev, socials: false }));
    }
  };

  const saveAppearance = async () => {
    setIsSaving((prev: any) => ({ ...prev, appearance: true }));
    try {
      await setDoc(doc(db, 'settings', 'main'), settings);
      if (settings.glowColor) document.documentElement.style.setProperty('--glow-color', settings.glowColor);
      if (settings.glowIntensity !== undefined) document.documentElement.style.setProperty('--glow-intensity', settings.glowIntensity);
      showToast('appearance');
    } catch (error) {
      console.error("Error saving appearance:", error);
    } finally {
      setIsSaving((prev: any) => ({ ...prev, appearance: false }));
    }
  };

  const saveSections = async () => {
    setIsSaving((prev: any) => ({ ...prev, sections: true }));
    try {
      await setDoc(doc(db, 'config', 'visibility'), sections);
      await setDoc(doc(db, 'config', 'backgrounds'), sectionBackgrounds);
      showToast('sections');
    } catch (error) {
      console.error("Error saving sections:", error);
    } finally {
      setIsSaving((prev: any) => ({ ...prev, sections: false }));
    }
  };

  const addService = async () => {
    if (!newService.title) return;
    setIsSaving((prev: any) => ({ ...prev, services: true }));
    try {
      await addDoc(collection(db, 'services'), newService);
      setNewService({ title: '', desc: '', icon: '' });
      showToast('services');
    } catch (error) {
      console.error("Error adding service:", error);
    } finally {
      setIsSaving((prev: any) => ({ ...prev, services: false }));
    }
  };

  const deleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const addExperience = async () => {
    if (!newExp.role) return;
    setIsSaving((prev: any) => ({ ...prev, experience: true }));
    try {
      await addDoc(collection(db, 'experience'), newExp);
      setNewExp({ role: '', company: '', period: '', desc: '' });
      showToast('experience');
    } catch (error) {
      console.error("Error adding experience:", error);
    } finally {
      setIsSaving((prev: any) => ({ ...prev, experience: false }));
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'experience', id));
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const markMessageRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'messages', id), { read: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const changePassword = async () => {
    // Password change is handled by Google Auth now.
    // This section can be removed or repurposed for other security settings.
    setSecurityError('Password management is handled via your Google Account.');
  };

  if (isAuthChecking) {
    return (
      <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <Loader2 className="animate-spin" size={48} color="var(--blue)" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="admin-body">
        <div id="login-page">
          <div className="login-grid-bg"></div>
          <div className="login-box">
            <div className="login-logo">JJ Admin</div>
            <div className="login-sub">Portfolio Control Panel</div>
            
            <a href="/" className="back-to-site-link">
              <ArrowLeft size={16} /> Back to site
            </a>

            <div className="login-methods" style={{ textAlign: 'center', padding: '20px' }}>
              <Shield size={48} color="var(--blue)" style={{ marginBottom: '15px', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
                This area is restricted. Please use the authorized access method from the main site.
              </p>
            </div>

            {loginError && <div className="login-error" style={{ display: 'block' }}>{loginError}</div>}
            
            <div className="login-footer">
              Only authorized access permitted.
            </div>
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
            <a href="/" className="dash-nav-link back-btn-responsive">
              <ArrowLeft size={18} /> <span>Back to site</span>
            </a>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> <span>Logout</span>
            </button>
          </div>
        </nav>
        <div className="dash-body">
          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-section">Overview</div>
            <div className={`sidebar-item ${activePanel === 'stats' ? 'active' : ''}`} onClick={() => setActivePanel('stats')}>
              <BarChart3 size={18} className="sidebar-icon" /> Dashboard
            </div>
            <div className={`sidebar-item ${activePanel === 'messages' ? 'active' : ''}`} onClick={() => setActivePanel('messages')}>
              <MessageSquare size={18} className="sidebar-icon" /> Messages
              {stats.messages > 0 && <span id="msg-badge" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--blue)' }}>{stats.messages}</span>}
            </div>

            <div className="sidebar-section">My Portfolio</div>
            <div className={`sidebar-item ${activePanel === 'profile' ? 'active' : ''}`} onClick={() => setActivePanel('profile')}>
              <User size={18} className="sidebar-icon" /> Profile
            </div>
            <div className={`sidebar-item ${activePanel === 'projects' ? 'active' : ''}`} onClick={() => setActivePanel('projects')}>
              <Briefcase size={18} className="sidebar-icon" /> Projects
            </div>
            <div className={`sidebar-item ${activePanel === 'skills' ? 'active' : ''}`} onClick={() => setActivePanel('skills')}>
              <Zap size={18} className="sidebar-icon" /> Skills
            </div>
            <div className={`sidebar-item ${activePanel === 'socials' ? 'active' : ''}`} onClick={() => setActivePanel('socials')}>
              <Share2 size={18} className="sidebar-icon" /> Social Links
            </div>
            <div className={`sidebar-item ${activePanel === 'services' ? 'active' : ''}`} onClick={() => setActivePanel('services')}>
              <Settings size={18} className="sidebar-icon" /> Services
            </div>
            <div className={`sidebar-item ${activePanel === 'experience' ? 'active' : ''}`} onClick={() => setActivePanel('experience')}>
              <Briefcase size={18} className="sidebar-icon" /> Experience
            </div>

            <div className="sidebar-section">Site Control</div>
            <div className={`sidebar-item ${activePanel === 'config' ? 'active' : ''}`} onClick={() => setActivePanel('config')}>
              <Settings size={18} className="sidebar-icon" /> Site Config
            </div>
            <div className={`sidebar-item ${activePanel === 'appearance' ? 'active' : ''}`} onClick={() => setActivePanel('appearance')}>
              <Palette size={18} className="sidebar-icon" /> Appearance
            </div>
            <div className={`sidebar-item ${activePanel === 'sections' ? 'active' : ''}`} onClick={() => setActivePanel('sections')}>
              <Layout size={18} className="sidebar-icon" /> Sections
            </div>
            <div className={`sidebar-item ${activePanel === 'security' ? 'active' : ''}`} onClick={() => setActivePanel('security')}>
              <Shield size={18} className="sidebar-icon" /> Security
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
                  <div style={{ marginTop: '24px', borderTop: '1px solid var(--blue-border)', paddingTop: '24px' }}>
                    <div className="admin-card-title">Section Backgrounds</div>
                    <div className="panel-sub">Add image URLs or animation names for each section.</div>
                    {[
                      { key: 'hero', label: 'Hero Background URL' },
                      { key: 'projects', label: 'Projects Background URL' },
                      { key: 'about-section', label: 'About Background URL (Profile pic used by default)' },
                      { key: 'contact', label: 'Contact Background URL' }
                    ].map(s => (
                      <div key={s.key} className="aform-group" style={{ marginBottom: '16px' }}>
                        <label className="aform-label">{s.label}</label>
                        <input 
                          type="text" 
                          className="aform-input" 
                          value={sectionBackgrounds[s.key] || ''} 
                          onChange={(e) => setSectionBackgrounds({ ...sectionBackgrounds, [s.key]: e.target.value })} 
                          placeholder="https://example.com/image.jpg" 
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <button className="save-btn" onClick={saveSections}>Save sections & backgrounds</button>
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
