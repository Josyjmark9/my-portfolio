import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Github, 
  Linkedin, 
  Instagram, 
  Twitter, 
  Send, 
  ExternalLink, 
  Play, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  MessageSquare,
  Globe,
  Pencil,
  Monitor,
  Gamepad2,
  Book,
  Paintbrush,
  ListTodo,
  Code,
  Palette
} from 'lucide-react';
import Admin from './Admin';
import { db, collection, onSnapshot, query, orderBy, addDoc, doc } from './firebase';

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#hero');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#hero');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (route === '#admin') {
    return <Admin />;
  }

  return <Portfolio />;
}

function FloatingBackgroundIcons({ count = 15, speed = 20 }: { count?: number, speed?: number }) {
  const icons = [Pencil, Monitor, Gamepad2, Book, Paintbrush, ListTodo, Code, Palette];
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const newItems = Array.from({ length: count }).map((_, i) => ({
      id: i,
      Icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      duration: Math.random() * speed + speed,
      delay: Math.random() * -speed,
      opacity: Math.random() * 0.1 + 0.05,
      rotate: Math.random() * 360
    }));
    setItems(newItems);
  }, [count, speed]);

  return (
    <div className="floating-bg-icons" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ x: `${item.x}%`, y: `${item.y}%`, rotate: item.rotate, opacity: 0 }}
          animate={{ 
            y: [`${item.y}%`, `${(item.y + 10) % 100}%`, `${item.y}%`],
            x: [`${item.x}%`, `${(item.x + 5) % 100}%`, `${item.x}%`],
            rotate: [item.rotate, item.rotate + 20, item.rotate],
            opacity: item.opacity
          }}
          transition={{ 
            duration: item.duration, 
            repeat: Infinity, 
            ease: "linear",
            delay: item.delay
          }}
          style={{ position: 'absolute', color: 'white', filter: 'grayscale(100%) brightness(0.8)' }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}
    </div>
  );
}

function HeroAnimation() {
  return (
    <div className="hero-visual-anim">
      <div className="vintage-glow"></div>
      <FloatingBackgroundIcons count={20} speed={25} />
    </div>
  );
}

function Portfolio() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [socials, setSocials] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [sections, setSections] = useState<any>({});
  const [sectionBackgrounds, setSectionBackgrounds] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Firebase Data Sync
  useEffect(() => {
    const unsubProjects = onSnapshot(query(collection(db, 'projects'), orderBy('date', 'desc')), (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      setServices(snap.docs.map(doc => doc.data()));
    });
    const unsubExperience = onSnapshot(collection(db, 'experience'), (snap) => {
      setExperience(snap.docs.map(doc => doc.data()));
    });
    const unsubVisibility = onSnapshot(doc(db, 'config', 'visibility'), (snap) => {
      if (snap.exists()) setSections(snap.data());
    });
    const unsubBackgrounds = onSnapshot(doc(db, 'config', 'backgrounds'), (snap) => {
      if (snap.exists()) setSectionBackgrounds(snap.data());
    });

    // Mark data as loaded after a short delay to ensure initial fetch
    const timer = setTimeout(() => setIsDataLoaded(true), 1000);

    return () => {
      unsubProjects();
      unsubProfile();
      unsubSocials();
      unsubSettings();
      unsubServices();
      unsubExperience();
      unsubVisibility();
      unsubBackgrounds();
      clearTimeout(timer);
    };
  }, []);

  // Loader effect
  useEffect(() => {
    if (isDataLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded]);

  // Cursor logic
  useEffect(() => {
    if (!isLoaded) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    const moveHandler = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
    };

    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(animRing);
    };

    document.addEventListener('mousemove', moveHandler);
    const ringAnimId = requestAnimationFrame(animRing);

    return () => {
      document.removeEventListener('mousemove', moveHandler);
      cancelAnimationFrame(ringAnimId);
    };
  }, [isLoaded]);

  // Particles logic
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number, pts: any[] = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.2 + 0.5
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(90, 175, 255, 0.4)';
      
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.lineWidth = 0.5;
      pts.forEach((a, i) => {
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 6400) { // 80 * 80
            const d = Math.sqrt(d2);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(90, 175, 255, ${(1 - d / 80) * 0.15})`;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };

    const drawAnimId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(drawAnimId);
    };
  }, [isLoaded]);

  // Typing animation
  useEffect(() => {
    if (!isLoaded) return;
    setIsTypingDone(false);
    const tagline = profile.tagline || 'Creative ideas that drive growth';
    let i = 0;
    const type = () => {
      if (i <= tagline.length) {
        setTypedText(tagline.slice(0, i));
        i++;
        setTimeout(type, 60);
      } else {
        setIsTypingDone(true);
      }
    };
    const timer = setTimeout(type, 200);
    return () => clearTimeout(timer);
  }, [isLoaded, profile.tagline]);

  // Scroll reveal
  useEffect(() => {
    if (!isLoaded) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [isLoaded, projects, sections]);

  // Initial data fetch
  useEffect(() => {
    // Visitor count
    let count = parseInt(localStorage.getItem('jj_visitors') || '0');
    const visited = sessionStorage.getItem('jj_visited');
    if (!visited) {
      count++;
      localStorage.setItem('jj_visitors', count.toString());
      sessionStorage.setItem('jj_visited', '1');
    }
    setVisitorCount(count);
  }, []);

  const [adminClicks, setAdminClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastClickTime > 5000) {
      setAdminClicks(1);
    } else {
      const newClicks = adminClicks + 1;
      if (newClicks >= 5) {
        window.location.hash = '#admin';
        setAdminClicks(0);
      } else {
        setAdminClicks(newClicks);
      }
    }
    setLastClickTime(now);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    const form = e.currentTarget;
    const name = (form.elements[0] as HTMLInputElement).value;
    const email = (form.elements[1] as HTMLInputElement).value;
    const message = (form.elements[2] as HTMLTextAreaElement).value;

    try {
      await addDoc(collection(db, 'messages'), {
        name,
        email,
        message,
        date: new Date().toISOString(),
        read: false
      });
      setFormSuccess(true);
      form.reset();
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTilt = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const max = parseFloat(el.getAttribute('data-max') || '12');
    const spot = el.querySelector('.glow-spot') as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const cx = r.width / 2, cy = r.height / 2;
    const dx = (x - cx) / cx, dy = (y - cy) / cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const intensity = Math.min(dist * 1.4, 1);
    const gi = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glow-intensity')) || 1;

    el.style.transform = `perspective(1000px) rotateX(${-dy * max}deg) rotateY(${dx * max}deg) scale3d(1.02, 1.02, 1.02)`;
    el.style.boxShadow = `${Math.round(dx * 8)}px ${Math.round(dy * 8)}px ${Math.round(12 + intensity * 20)}px rgba(90, 175, 255, ${(0.15 + intensity * 0.4 * gi).toFixed(2)})`;
    el.style.borderColor = `rgba(90, 175, 255, ${(0.15 + intensity * 0.5).toFixed(2)})`;

    if (spot) {
      spot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      spot.style.opacity = (0.4 + intensity * 0.6).toFixed(2);
      const sz = Math.round(100 + intensity * 100);
      spot.style.width = `${sz}px`;
      spot.style.height = `${sz}px`;
    }
  };

  const resetTilt = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const spot = el.querySelector('.glow-spot') as HTMLElement;
    el.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    el.style.boxShadow = '';
    el.style.borderColor = '';
    if (spot) spot.style.opacity = '0';
  };

  const skills = ['All', ...new Set(projects.map(p => p.skill).filter(Boolean))];

  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  return (
    <>
      <div id="cursor" ref={cursorRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>
      <div id="cursor-glow" ref={glowRef}></div>

      {!isLoaded && (
        <div id="loader">
          <div className="loader-logo">JJ</div>
          <div className="loader-bar-wrap">
            <div className="loader-bar"></div>
          </div>
          <div className="loader-text">Loading portfolio...</div>
        </div>
      )}

      <canvas id="particles" ref={canvasRef}></canvas>

      <nav id="navbar">
        <div className="nav-logo">{settings.siteName || 'Josiah Johnmark'}</div>
        <div className="nav-links">
          <a href="#hero" className="nav-link">Home</a>
          <a href="#projects" className="nav-link">Work</a>
          <a href="#about-section" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
        <div className="nav-burger" onClick={toggleMenu}>
          <span></span><span></span><span></span>
        </div>
      </nav>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <a href="#hero" className="nav-link" onClick={toggleMenu}>Home</a>
        <a href="#projects" className="nav-link" onClick={toggleMenu}>Work</a>
        <a href="#about-section" className="nav-link" onClick={toggleMenu}>About</a>
        <a href="#contact" className="nav-link" onClick={toggleMenu}>Contact</a>
      </div>

      <main>
        {/* HERO */}
        {sections.hero !== false && (
          <section id="hero">
            {sectionBackgrounds.hero && (
              <div className="section-bg-layer" style={{ backgroundImage: `url(${sectionBackgrounds.hero})`, opacity: 0.15 }}></div>
            )}
            <div className="hero-grid-bg"></div>

            <div className="hero-top">
              <div className="photo-outer">
                <div className="photo-circle">
                  <div className="photo-border-glow"></div>
                  <div className="photo-glow-spot"></div>
                  {profile.photo ? (
                    <img 
                      src={profile.photo} 
                      alt="Josiah Johnmark" 
                      referrerPolicy="no-referrer" 
                      className="profile-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const placeholder = (e.target as HTMLImageElement).parentElement?.querySelector('.photo-placeholder');
                        if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="photo-placeholder" style={{ display: profile.photo ? 'none' : 'flex', zIndex: 2 }}>JJ</div>
                </div>
              </div>

              <HeroAnimation />

              <div className="hero-identity">
                <div className="hero-greeting">{settings.heroGreeting || 'Hello, I am'}</div>
                <div className="hero-name">{profile.name?.split(' ')[0] || 'Josiah'} <span>{profile.name?.split(' ').slice(1).join(' ') || 'Johnmark'}</span></div>
                <div className="hero-tagline">
                  <span>{typedText}</span>{!isTypingDone && <span className="cursor-blink">|</span>}
                </div>
                <div className="hero-roles">
                  <div className="pill">Game Developer</div>
                  <div className="pill">AI App Developer</div>
                  <div className="pill">AI Web Developer</div>
                  <div className="pill">Pencil Artist</div>
                </div>
              </div>
            </div>

            <div
              className="hero-about tilt-el"
              data-max="10"
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
            >
              <div className="glow-spot"></div>
              <span dangerouslySetInnerHTML={{ __html: profile.aboutShort || 'Josiah Johnmark is a <strong>creative person</strong> based in Abuja, Nigeria — a pencil artist and developer people can\'t stop coming back to. Driven by an obsession with detail, growth, and turning bold ideas into real experiences.' }}></span>
            </div>

            <div className="hero-btns">
              <a href="#projects" className="btn-primary">View my work</a>
              {profile.cv && (
                <a href={profile.cv} className="btn-outline" download>Download CV</a>
              )}
            </div>

            {sections['stats-bar'] !== false && (
              <div className="stats-bar reveal" ref={statsRef}>
                <div className="stat-item">
                  <div className="stat-num">{projects.length}</div>
                  <div className="stat-label">Projects</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">10+</div>
                  <div className="stat-label">Years drawing</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">{Math.max(new Set(projects.map(p => p.skill).filter(Boolean)).size, 4)}</div>
                  <div className="stat-label">Skills</div>
                </div>
              </div>
            )}
          </section>
        )}

        {sections.projects !== false && (
          <>
            <div className="section-divider"></div>
            <section id="projects">
              {sectionBackgrounds.projects && (
                <div className="section-bg-layer" style={{ backgroundImage: `url(${sectionBackgrounds.projects})` }}></div>
              )}
              <div className="section-tag reveal">My work</div>
              <div className="section-title reveal">Projects</div>

              <div className="filter-tabs reveal">
                {skills.map((s: any) => (
                  <div
                    key={s}
                    className={`pill ${filter === (s === 'All' ? 'all' : s) ? 'active' : ''}`}
                    onClick={() => setFilter(s === 'All' ? 'all' : s)}
                  >
                    {s}
                  </div>
                ))}
              </div>

              <div className="proj-grid">
                {projects.length === 0 ? (
                  <div className="no-projects">No projects yet — check back soon!</div>
                ) : (
                  projects
                    .filter(p => filter === 'all' || p.skill === filter)
                    .map((p, idx) => (
                      <ProjectCard key={idx} project={p} handleTilt={handleTilt} resetTilt={resetTilt} />
                    ))
                )}
              </div>
            </section>
          </>
        )}

        {services.length > 0 && (
          <>
            <div className="section-divider"></div>
            <section id="services">
              <div className="section-tag reveal">What I offer</div>
              <div className="section-title reveal">Services</div>
              <div className="services-grid">
                {services.map((s, i) => (
                  <div key={i} className="service-card reveal">
                    <div className="service-icon">{s.icon}</div>
                    <div className="service-title">{s.title}</div>
                    <div className="service-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {experience.length > 0 && (
          <>
            <div className="section-divider"></div>
            <section id="experience">
              <div className="section-tag reveal">My journey</div>
              <div className="section-title reveal">Experience</div>
              <div className="exp-timeline">
                {experience.map((ex, i) => (
                  <div key={i} className="exp-item reveal">
                    <div className="exp-dot"></div>
                    <div className="exp-content">
                      <div className="exp-header">
                        <div className="exp-role">{ex.role}</div>
                        <div className="exp-period">{ex.period}</div>
                      </div>
                      <div className="exp-company">{ex.company}</div>
                      <div className="exp-desc">{ex.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {services.length > 0 && (
          <>
            <div className="section-divider"></div>
            <section id="services">
              <div className="section-tag reveal">What I offer</div>
              <div className="section-title reveal">Services</div>
              <div className="services-grid">
                {services.map((s, i) => (
                  <div key={i} className="service-card reveal">
                    <div className="service-icon">{s.icon}</div>
                    <div className="service-title">{s.title}</div>
                    <div className="service-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {experience.length > 0 && (
          <>
            <div className="section-divider"></div>
            <section id="experience">
              <div className="section-tag reveal">My journey</div>
              <div className="section-title reveal">Experience</div>
              <div className="exp-timeline">
                {experience.map((ex, i) => (
                  <div key={i} className="exp-item reveal">
                    <div className="exp-dot"></div>
                    <div className="exp-content">
                      <div className="exp-header">
                        <div className="exp-role">{ex.role}</div>
                        <div className="exp-period">{ex.period}</div>
                      </div>
                      <div className="exp-company">{ex.company}</div>
                      <div className="exp-desc">{ex.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {sections['about-section'] !== false && (
          <>
            <div className="section-divider"></div>
            <section id="about-section" className="vintage-bg-container">
              {/* Vintage Background */}
              <div 
                className="vintage-bg" 
                style={{ 
                  backgroundImage: `url(${sectionBackgrounds['about-section'] || profile.photo})`,
                  opacity: 0.15
                }}
              ></div>
              
              <div className="section-tag reveal">Who I am</div>
              <div className="section-title reveal">About me</div>
              
              <div className="about-tabs reveal">
                <div className="about-tab-content">
                  <div
                    className={`hero-about tilt-el ${isAboutExpanded ? 'expanded' : 'collapsed'}`}
                    data-max="5"
                    style={{ 
                      maxWidth: '1001px', 
                      minHeight: '400px', 
                      margin: '0 auto', 
                      background: 'rgba(10, 20, 40, 0.7)', 
                      backdropFilter: 'blur(10px)', 
                      border: '1px solid var(--blue-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px',
                      position: 'relative'
                    }}
                    onMouseMove={handleTilt}
                    onMouseLeave={resetTilt}
                  >
                    <div className="glow-spot"></div>
                    <p
                      className="about-text-compact"
                      dangerouslySetInnerHTML={{ __html: profile.aboutFull || 'Josiah Johnmark is a <strong style="color:var(--blue);">creative person</strong> based in Abuja, Nigeria — a pencil artist and developer people can\'t stop coming back to.<br><br>With over a decade of pencil art experience, he specialises in realistic portraits and character illustrations — work that demands patience, precision, and an obsession with getting every single detail right. That same obsession carries into every line of code he writes.<br><br>His journey into game development was inevitable. Growing up with a deep love for games — the kind that pull you in and refuse to let go — Josiah didn\'t just want to play them. He wanted to build them. The smooth mechanics, the addictive features, the competitive rankings that make you desperate to come back — that\'s the experience he aims to create.<br><br>Holding a degree in Biochemistry, Josiah made a deliberate choice to follow his passion over convention. He respects the science, but his heart has always been in creativity, technology, and growth.<br><br><em style="color:var(--blue);">Talented. Creative. Hardworking.</em> — That\'s how the people around him describe him.' }}
                    ></p>
                    
                    <button 
                      className="about-expand-btn" 
                      onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                    >
                      {isAboutExpanded ? 'Show Less' : 'Read More'}
                      <span className={`expand-icon ${isAboutExpanded ? 'up' : 'down'}`}></span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {sections.contact !== false && (
          <>
            <div className="section-divider"></div>
            <section id="contact">
              {sectionBackgrounds.contact && (
                <div className="section-bg-layer" style={{ backgroundImage: `url(${sectionBackgrounds.contact})` }}></div>
              )}
              <div className="section-tag reveal">Get in touch</div>
              <div className="section-title reveal">Contact</div>
              <div className="contact-grid">
                <div className="contact-left reveal">
                  <p className="contact-intro">
                    Have a project in mind, want to hire me, or just want to say hello?
                    Reach out on any of these platforms and I'll get back to you.
                  </p>
                  <div className="contact-pills">
                    <a href="mailto:josiahjohnmark9@gmail.com" className="contact-pill pill">
                      <Mail size={14} style={{ marginRight: '8px' }} /> josiahjohnmark9@gmail.com
                    </a>
                    <a href="https://wa.me/2347033223491" target="_blank" className="contact-pill pill">
                      <MessageSquare size={14} style={{ marginRight: '8px' }} /> WhatsApp
                    </a>
                    {socials.instagram && (
                      <a href={socials.instagram} target="_blank" className="contact-pill pill">
                        <Instagram size={14} style={{ marginRight: '8px' }} /> Instagram
                      </a>
                    )}
                    {socials.x && (
                      <a href={socials.x} target="_blank" className="contact-pill pill">
                        <Twitter size={14} style={{ marginRight: '8px' }} /> X (Twitter)
                      </a>
                    )}
                    {socials.linkedin && (
                      <a href={socials.linkedin} target="_blank" className="contact-pill pill">
                        <Linkedin size={14} style={{ marginRight: '8px' }} /> LinkedIn
                      </a>
                    )}
                    {socials.telegram && (
                      <a href={socials.telegram} target="_blank" className="contact-pill pill">
                        <Send size={14} style={{ marginRight: '8px' }} /> Telegram
                      </a>
                    )}
                    {socials.github && (
                      <a href={socials.github} target="_blank" className="contact-pill pill">
                        <Github size={14} style={{ marginRight: '8px' }} /> GitHub
                      </a>
                    )}
                  </div>
                </div>
                <div className="contact-right reveal">
                  <form className="contact-form" onSubmit={sendMessage}>
                    <div className="form-group">
                      <label className="form-label">Your name</label>
                      <input type="text" className="form-input" placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your email</label>
                      <input type="email" className="form-input" placeholder="john@email.com" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message</label>
                      <textarea className="form-textarea" placeholder="Tell me about your project or opportunity..." required></textarea>
                    </div>
                    <button type="submit" className="btn-primary" disabled={isSending} style={{ width: '100%', cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      {isSending ? <Loader2 className="animate-spin" size={20} /> : 'Send message'}
                    </button>
                    {formSuccess && (
                      <div className="form-success" style={{ display: 'block' }}>Message sent! I'll get back to you soon.</div>
                    )}
                  </form>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer>
        <FloatingBackgroundIcons count={10} speed={30} />
        <div className="foot-copy" style={{ position: 'relative', zIndex: 1 }}>{settings.footerText || '© 2025 Josiah Johnmark. All rights reserved.'}</div>
        <div className="foot-tag" style={{ position: 'relative', zIndex: 1 }}>Creative ideas that drive growth | <a href="#admin" onClick={handleAdminClick} style={{ color: 'inherit', textDecoration: 'none', opacity: 0.5 }}>Admin</a></div>
      </footer>
    </>
  );
}

function ProjectCard({ project, handleTilt, resetTilt }: any) {
  const [showGame, setShowGame] = useState(false);

  return (
    <div
      className="proj-card tilt-el reveal"
      data-max="14"
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
    >
      <div className="glow-spot"></div>
      <div className="proj-thumb">
        {project.image ? (
          <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
        ) : (
          <div className="proj-thumb-icon"><span>{project.emoji || '🎮'}</span></div>
        )}
      </div>
      <div className="proj-info">
        <div className="proj-type-badge">{project.skill || 'Project'}</div>
        <div className="proj-title">{project.title || 'Untitled'}</div>
        <div className="proj-desc">{project.desc || ''}</div>
        <div className="proj-actions">
          {project.gameLink && (
            <button className="proj-btn proj-btn-primary" onClick={() => setShowGame(!showGame)}>
              {showGame ? 'Hide game' : 'Play game'}
            </button>
          )}
          {project.link && (
            <a href={project.link} target="_blank" className="proj-btn proj-btn-outline">View project</a>
          )}
        </div>
        {showGame && project.gameLink && (
          <div className="game-embed-wrap">
            <iframe src={project.gameLink} allowFullScreen></iframe>
            <div className="game-link-bar">
              <span>Playing: {project.title}</span>
              <a href={project.gameLink} target="_blank">Open in new tab</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
