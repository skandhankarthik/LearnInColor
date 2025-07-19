import React from "react";
import "./LandingPage.css";

const features = [
  {
    title: "Dyslexia-friendly font",
    description: "Easier reading for everyone",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5m0 0h7.5a4.5 4.5 0 010 9H4zm0 0l10 14" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
  },
  {
    title: "Color filter toggles",
    description: "Customizable color overlays",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="#6ee7b7" strokeWidth="2"/><path d="M2 12h20" stroke="#3b82f6" strokeWidth="2"/></svg>
    ),
  },
  {
    title: "Audio note playback",
    description: "Listen to your notes",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l8.5 6L9 18z" fill="#6ee7b7"/><rect x="3" y="6" width="2" height="12" rx="1" fill="#3b82f6"/></svg>
    ),
  },
  {
    title: "Study focus timer",
    description: "Stay on track with sessions",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="#6ee7b7" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
  },
  {
    title: "Emotional check-in",
    description: "Track your feelings as you study",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="#6ee7b7" strokeWidth="2"/><path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="10" r="1" fill="#3b82f6"/><circle cx="15" cy="10" r="1" fill="#3b82f6"/></svg>
    ),
  },
  {
    title: "Customizable UI",
    description: "For neurodivergent learners",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#6ee7b7" strokeWidth="2"/><path d="M8 8h8v8H8z" stroke="#3b82f6" strokeWidth="2"/></svg>
    ),
  },
];

const LandingPage = ({ onGetStarted }) => (
  <div className="landing-bg">
    <header className="landing-header">
      <span className="landing-logo">LearnInColor</span>
    </header>
    <main className="landing-main">
      <h1 className="main-headline">
        Inclusive learning for <span className="main-highlight">everyone</span>
      </h1>
      <p className="main-subhead">
        An inclusive notetaking and learning app with customizable UI for visual impairments, dyslexia, and ADHD.<br />Making study accessible for all neurodivergent learners.
      </p>
      <div className="main-features-grid">
        {features.map((f, i) => (
          <div key={i} className="main-feature-block">
            <div className="main-feature-icon">{f.icon}</div>
            <div className="main-feature-info">
              <span className="main-feature-title">{f.title}</span>
              <span className="main-feature-desc">{f.description}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="main-cta" onClick={onGetStarted}>
        Get Started Now
      </button>
    </main>
  </div>
);

export default LandingPage; 