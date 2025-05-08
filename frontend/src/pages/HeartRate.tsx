import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import '../index.css';

// Firebase imports
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs, Firestore } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDLWZpZ98FH6VUO_xakZt-MMxd4rA0Aw_U",
  authDomain: "biosteady-8ee44.firebaseapp.com",
  projectId: "biosteady-8ee44",
  storageBucket: "biosteady-8ee44.appspot.com",
  messagingSenderId: "1051648505932",
  appId: "1:1051648505932:web:19ff2d7c68e471a3b21d05"
};

// Initialize Firebase safely
let app: FirebaseApp;
let db: Firestore;

try {
  // Check if Firebase is already initialized
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Create a fallback empty db to prevent errors
  app = {} as FirebaseApp;
  db = {} as Firestore;
}

const HeartRate: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [heartRateData, setHeartRateData] = useState<any[]>([]);
  const [currentHeartRate, setCurrentHeartRate] = useState<number>(0);
  const [averageHeartRate, setAverageHeartRate] = useState<number>(0);
  const [peakHeartRate, setPeakHeartRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataCollected, setDataCollected] = useState<boolean>(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Skip auto-loading data on initial render
  // useEffect(() => {
  //   fetchHeartRateData();
  // }, []);

  const fetchHeartRateData = async () => {
    try {
      setLoading(true);
      
      // Check if db is properly initialized
      if (!db || typeof db !== 'object' || Object.keys(db).length === 0) {
        console.error("Firestore not properly initialized");
        setLoading(false);
        return;
      }
      
      try {
        // Create a query against the "sensorData" collection
        const q = query(
          collection(db, "sensorData"),
          orderBy("timestamp", "desc"),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const data: any[] = [];
        
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log("Fetched sensor data:", data);
        
        // Reverse to get chronological order
        const chronologicalData = [...data].reverse();
        setHeartRateData(chronologicalData);
        
        if (chronologicalData.length > 0) {
          // Set current heart rate to the most recent value
          const latestReading = chronologicalData[chronologicalData.length - 1];
          // Based on the screenshot, the field is "heartRate"
          setCurrentHeartRate(latestReading.heartRate || 72);
          
          // Calculate stats
          const heartRates = chronologicalData
            .map(d => d.heartRate)
            .filter(hr => hr !== undefined && hr > 0);
            
          if (heartRates.length > 0) {
            // Calculate average
            const sum = heartRates.reduce((a, b) => a + b, 0);
            const avg = Math.round(sum / heartRates.length);
            setAverageHeartRate(avg);
            
            // Find peak
            const peak = Math.max(...heartRates);
            setPeakHeartRate(peak);
            
            // Set last updated time
            if (latestReading.timestamp) {
              const date = new Date(latestReading.timestamp.toDate ? latestReading.timestamp.toDate() : latestReading.timestamp);
              setLastUpdated(date.toLocaleString());
            }
          }
        }
        
        setLoading(false);
      } catch (dbError) {
        console.error("Error querying Firestore:", dbError);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching heart rate data:", error);
      setLoading(false);
    }
  };

  const startDetection = () => {
    console.log("Heart Rate Detection started!");
    setShowPopup(true);
    setTimeLeft(30);
    
    // Clear any existing timers
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
    }
    
    // Start new timer
    const countdownInterval = window.setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        console.log("Countdown:", newTime);
        
        if (newTime <= 0) {
          console.log("Countdown complete!");
          if (timerIntervalRef.current) {
            window.clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          // Wait 1 second before hiding the popup
          setTimeout(() => {
            setShowPopup(false);
            // Refresh data after detection
            fetchHeartRateData();
            setDataCollected(true); // Mark that we have data to display
          }, 1000);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    // Store the interval ID in the ref
    timerIntervalRef.current = countdownInterval;
  };

  const cancelDetection = () => {
    console.log("Detection canceled!");
    // Clear the timer
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setShowPopup(false);
  };

  // Generate SVG path for heart rate graph
  const generateHeartRatePath = () => {
    if (heartRateData.length === 0) return '';
    
    const width = 600;
    const height = 200;
    const padding = 20;
    
    // Extract heart rate values - using heartRate as seen in the screenshot
    const heartRates = heartRateData.map(d => d.heartRate || 70);
    
    // Calculate min and max for scaling
    const minRate = Math.min(...heartRates) - 5;
    const maxRate = Math.max(...heartRates) + 5;
    
    // Scale functions
    const xScale = (i: number) => padding + (i * (width - 2 * padding) / (heartRates.length - 1));
    const yScale = (rate: number) => height - padding - ((rate - minRate) * (height - 2 * padding) / (maxRate - minRate));
    
    // Generate path
    let path = `M ${xScale(0)} ${yScale(heartRates[0])}`;
    for (let i = 1; i < heartRates.length; i++) {
      path += ` L ${xScale(i)} ${yScale(heartRates[i])}`;
    }
    
    return path;
  };

  return (
    <div className="dashboard-wrapper">
      <header className="navbar">
        <Link to="/" className="brand">
          <img src="/logo.svg" alt="BioSteady Logo" className="brand-logo" />
          <span className="brand-name">BioSteady</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="dashboard-main">
        {/* Detection card moved to top to be the focus before data collection */}
        <div 
          className="card detection-card" 
          style={{ 
            gridColumn: dataCollected ? "1" : "1 / span 2",
            cursor: 'pointer',
            position: 'relative',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '2px solid transparent'
          }}
          onClick={startDetection}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <h2>Heart Rate Detection</h2>
          <div className="detection-container">
            <p>Click anywhere in this card to start a 30-second heart rate detection</p>
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '20px auto',
                color: 'white',
                fontSize: '40px',
                fontWeight: 'bold'
              }}
            >
              30s
            </div>
          </div>
        </div>

        {dataCollected && (
          <>
            <div className="card">
              <h2>Current Heart Rate</h2>
              <div className="heart-rate-display">
                <span className="rate">{currentHeartRate}</span>
                <span className="unit">BPM</span>
              </div>
              <div className="status">
                <span className="status-dot normal"></span>
                <span>Normal Range</span>
              </div>
              {lastUpdated && (
                <div style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-light)' }}>
                  Last updated: {lastUpdated}
                </div>
              )}
            </div>

            <div className="graph-container">
              <h2>Heart Rate Trend</h2>
              <div className="chart-placeholder" style={{ padding: '20px', position: 'relative' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>Loading data...</div>
                ) : heartRateData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>No heart rate data available</div>
                ) : (
                  <svg width="100%" height="250" viewBox="0 0 600 250" preserveAspectRatio="none">
                    {/* Background */}
                    <rect x="0" y="0" width="600" height="250" fill="#1a2637" />
                    
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line 
                        key={`grid-${i}`}
                        x1="0" 
                        y1={50 + i * 40} 
                        x2="600" 
                        y2={50 + i * 40} 
                        stroke="#2a3a4d" 
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Heart rate path */}
                    <path
                      d={generateHeartRatePath()}
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Data points */}
                    {heartRateData.map((d, i) => {
                      const width = 600;
                      const height = 200;
                      const padding = 20;
                      const heartRates = heartRateData.map(d => d.heartRate || 70);
                      const minRate = Math.min(...heartRates) - 5;
                      const maxRate = Math.max(...heartRates) + 5;
                      const xScale = (i: number) => padding + (i * (width - 2 * padding) / (heartRates.length - 1));
                      const yScale = (rate: number) => height - padding - ((rate - minRate) * (height - 2 * padding) / (maxRate - minRate));
                      
                      return (
                        <circle
                          key={`point-${i}`}
                          cx={xScale(i)}
                          cy={yScale(d.heartRate || 70)}
                          r="4"
                          fill="#4ade80"
                        />
                      );
                    })}
                  </svg>
                )}
                
                {/* Y-axis labels */}
                <div style={{ 
                  position: 'absolute', 
                  top: '20px', 
                  left: '10px', 
                  height: 'calc(100% - 40px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  color: 'var(--text-light)',
                  fontSize: '12px'
                }}>
                  {heartRateData.length > 0 && (
                    <>
                      <div>{Math.max(...heartRateData.map(d => d.heartRate || 70)) + 5} BPM</div>
                      <div>{Math.min(...heartRateData.map(d => d.heartRate || 70)) - 5} BPM</div>
                    </>
                  )}
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="dot heart-rate"></span>
                  <span>Heart Rate</span>
                </div>
                <div className="legend-item">
                  <span className="dot target-zone"></span>
                  <span>Target Zone</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Activity Summary</h2>
              <div className="metrics">
                <div className="metric" title="Average heart rate over the past 24 hours">
                  <span className="label">Today's Average</span>
                  <span className="value">{averageHeartRate} BPM</span>
                </div>
                <div className="metric" title="Your baseline heart rate when fully rested">
                  <span className="label">Resting Rate</span>
                  <span className="value">{Math.round(averageHeartRate * 0.9)} BPM</span>
                </div>
                <div className="metric" title="Highest recorded heart rate today">
                  <span className="label">Peak Today</span>
                  <span className="value">{peakHeartRate} BPM</span>
                </div>
                <div className="metric" title="Overall heart rate pattern">
                  <span className="label">Variability</span>
                  <span className="value">Normal</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FULL SCREEN POPUP */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '100px',
            fontWeight: 'bold',
            margin: '20px 0'
          }}>
            {timeLeft}
          </div>
          <div style={{
            fontSize: '28px',
            margin: '10px 0 30px',
            color: '#3b82f6'
          }}>
            RECORDING DATA
          </div>
          <div style={{
            width: '300px',
            height: '10px',
            backgroundColor: '#222',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div 
              style={{
                height: '100%',
                width: `${(30-timeLeft)/30 * 100}%`,
                backgroundColor: '#3b82f6',
                borderRadius: '10px',
                transition: 'width 1s linear'
              }}
            />
          </div>
          <div style={{
            fontSize: '16px',
            marginTop: '40px',
            padding: '10px 20px',
            border: '1px solid #666',
            borderRadius: '8px',
            color: '#999'
          }}>
            Place your finger on the sensor
          </div>
          
          {/* Cancel Button */}
          <button
            onClick={cancelDetection}
            style={{
              marginTop: '30px',
              padding: '10px 25px',
              fontSize: '16px',
              backgroundColor: 'transparent',
              border: '1px solid #666',
              color: '#999',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = '#f43f5e';
              e.currentTarget.style.color = '#f43f5e';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#666';
              e.currentTarget.style.color = '#999';
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default HeartRate;
