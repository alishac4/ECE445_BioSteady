import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import '../index.css';

const Home: React.FC = () => {
  const [userName, setUserName] = useState('Vasyl Vatsyk');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.name || 'Vasyl Vatsyk');
    }
  }, []);

  return (
    <div className="landing-wrapper">
      <header className="navbar">
        <div className="brand">
          <img src="/logo.svg" alt="BioSteady Logo" className="brand-logo" />
          <span className="brand-name">BioSteady</span>
        </div>
        <div className="nav-controls">
          <div className="user-greeting">
            Hi, {userName}
          </div>
          <Link to="/profile" className="profile-link">Profile</Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="home-container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px' 
      }}>
        <section className="hero" style={{ 
          textAlign: 'center', 
          marginBottom: '60px',
          padding: '40px 0'
        }}>
          <h1 className="hero-title" style={{
            fontSize: '3rem',
            marginBottom: '20px',
            background: 'linear-gradient(to right, #3b82f6, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Monitor Your Body's Response
          </h1>
          <p className="hero-subtitle" style={{
            fontSize: '1.25rem',
            color: 'var(--text-light)',
            maxWidth: '800px',
            margin: '0 auto 30px'
          }}>
            BioSteady helps you understand your body's response to caffeine and stress through real-time monitoring and AI-powered insights.
          </p>
          <div className="hero-buttons" style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center'
          }}>
            <Link to="/caffeine">
              <button className="btn-primary" style={{
                background: 'var(--accent)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>Caffeine Analysis</button>
            </Link>
            <Link to="/heart">
              <button className="btn-primary" style={{
                background: 'var(--accent)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>Heart Rate Monitor</button>
            </Link>
          </div>
        </section>

        <section className="features" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="card" style={{
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Real-time Monitoring</h3>
            <p className="text-light" style={{ color: 'var(--text-light)' }}>Track your physiological responses as they happen</p>
          </div>
          
          <div className="card" style={{
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🧠</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>AI-Powered Insights</h3>
            <p className="text-light" style={{ color: 'var(--text-light)' }}>Get personalized recommendations based on your data</p>
          </div>
          
          <div className="card" style={{
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📱</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Comprehensive Dashboard</h3>
            <p className="text-light" style={{ color: 'var(--text-light)' }}>View all your metrics in one place</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
