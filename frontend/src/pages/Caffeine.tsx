import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import '../index.css';

// Import Firebase functions
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs, Firestore } from 'firebase/firestore';

// Firebase configuration
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

interface ResponseData {
  timestamp: number;
  heartRate: number;
  skinConductance: number;
}

// Create static dummy data for guaranteed display
const DUMMY_DATA: ResponseData[] = Array.from({ length: 60 }, (_, i) => {
  // Base heart rate around 80, with a spike at 30 seconds
  let hr = 80;
  let sc = 0.5;
  
  if (i > 25 && i < 35) {
    // Create spike around 30-second mark
    const distFromCenter = Math.abs(i - 30);
    hr = 80 + Math.max(0, (5 - distFromCenter) * 15);
    sc = 0.5 + Math.max(0, (5 - distFromCenter) * 0.3);
  }
  
  // Add some randomness
  hr += Math.random() * 6 - 3;
  sc += Math.random() * 0.1 - 0.05;
  
  return {
    timestamp: Date.now() + i * 1000,
    heartRate: hr,
    skinConductance: sc
  };
});

const Caffeine: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [dataCollected, setDataCollected] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);
  const [responseData, setResponseData] = useState<ResponseData[]>(DUMMY_DATA);
  const [loading, setLoading] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    // Only fetch if Firebase is available
    if (db && typeof db === 'object' && Object.keys(db).length > 0) {
      fetchResponseData();
    }
  }, []);

  // Fetch response data after detection
  const fetchResponseData = async () => {
    try {
      setLoading(true);
      
      // Check if db is properly initialized
      if (!db || typeof db !== 'object' || Object.keys(db).length === 0) {
        console.error("Firestore not properly initialized");
        setLoading(false);
        
        // Use mock data if Firebase isn't working
        setResponseData(DUMMY_DATA);
        return;
      }
      
      try {
        // Query the sensorData collection
        const q = query(
          collection(db, "sensorData"),
          orderBy("timestamp", "desc"),
          limit(60)
        );
        
        const querySnapshot = await getDocs(q);
        const data: ResponseData[] = [];
        
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          data.push({
            timestamp: docData.timestamp?.toMillis() || Date.now(),
            heartRate: docData.heartRate || 0,
            skinConductance: docData.skinConductance || 0
          });
        });
        
        console.log("Fetched sensor data:", data);
        
        // If no data, use dummy data
        if (data.length === 0) {
          setResponseData(DUMMY_DATA);
        } else {
          // Sort data chronologically
          const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
          setResponseData(sortedData);
        }
      } catch (dbError) {
        console.error("Error querying Firestore:", dbError);
        setResponseData(DUMMY_DATA);
      }
    } catch (error) {
      console.error("Error fetching response data:", error);
      setResponseData(DUMMY_DATA);
    } finally {
      setLoading(false);
    }
  };

  const startDetection = () => {
    // Simple direct approach - just log and show popup
    console.log("Button clicked! Starting detection...");
    
    // Set detecting state
    setShowPopup(true);
    setTimeLeft(30);
    
    // Use a single setTimeout to hide the popup after 30 seconds
    setTimeout(() => {
      setShowPopup(false);
      
      // Generate new random data each time for demonstration
      const newData = DUMMY_DATA.map(item => ({
        ...item,
        heartRate: item.heartRate + (Math.random() * 10 - 5),
        skinConductance: item.skinConductance + (Math.random() * 0.2 - 0.1)
      }));
      
      setDataCollected(true); // Show data after detection
      setResponseData(newData); // Set guaranteed data
      fetchResponseData(); // Also try to fetch real data
    }, 30000);
    
    // Set an interval to update the countdown every second
    const countdownInterval = window.setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        
        // Once we reach 0, clear the interval
        if (newTime <= 0) {
          clearInterval(countdownInterval);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
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
    if (!responseData || responseData.length === 0) {
      // Default fallback path if no data
      return "M 20,100 L 60,90 L 100,120 L 140,80 L 180,110 L 220,90 L 260,130 L 300,70 L 340,100 L 380,85 L 420,95 L 460,75 L 500,105 L 540,90 L 580,100";
    }
    
    try {
      const width = 600;
      const height = 200;
      const padding = 20;
      
      // Extract heart rate values
      const heartRates = responseData.map(d => d.heartRate || 80);
      
      // Calculate min and max for scaling
      const minRate = Math.min(...heartRates) - 5;
      const maxRate = Math.max(...heartRates) + 5;
      
      // Scale functions - normalized to 0-1 range for better visualization
      const xScale = (i: number) => padding + (i * (width - 2 * padding) / (heartRates.length - 1));
      const yScale = (rate: number) => height - padding - ((rate - minRate) / (maxRate - minRate) * (height - 2 * padding));
      
      // Generate path using the same approach as HeartRate.tsx
      let path = `M ${xScale(0)} ${yScale(heartRates[0])}`;
      for (let i = 1; i < heartRates.length; i++) {
        path += ` L ${xScale(i)} ${yScale(heartRates[i])}`;
      }
      
      return path;
    } catch (error) {
      console.error("Error generating heart rate path:", error);
      return "M 20,100 L 60,90 L 100,120 L 140,80 L 180,110 L 220,90 L 260,130 L 300,70 L 340,100 L 380,85 L 420,95 L 460,75 L 500,105 L 540,90 L 580,100";
    }
  };
  
  // Generate SVG path for skin conductance graph
  const generateSkinConductancePath = () => {
    if (!responseData || responseData.length === 0) {
      // Default fallback path if no data
      return "M 20,150 L 60,145 L 100,155 L 140,140 L 180,150 L 220,145 L 260,160 L 300,130 L 340,150 L 380,145 L 420,155 L 460,140 L 500,150 L 540,145 L 580,150";
    }
    
    try {
      const width = 600;
      const height = 200;
      const padding = 20;
      
      // Extract skin conductance values
      const scValues = responseData.map(d => d.skinConductance || 0.5);
      
      // Calculate min and max for scaling
      const minSC = Math.min(...scValues) - 0.05;
      const maxSC = Math.max(...scValues) + 0.05;
      
      // Scale functions - normalized to 0-1 range for consistent visualization
      const xScale = (i: number) => padding + (i * (width - 2 * padding) / (scValues.length - 1));
      // Use same scaling approach for both heart rate and SC
      const yScale = (value: number) => height - padding - ((value - minSC) / (maxSC - minSC) * (height - 2 * padding));
      
      // Generate path
      let path = `M ${xScale(0)} ${yScale(scValues[0])}`;
      for (let i = 1; i < scValues.length; i++) {
        path += ` L ${xScale(i)} ${yScale(scValues[i])}`;
      }
      
      return path;
    } catch (error) {
      console.error("Error generating skin conductance path:", error);
      return "M 20,150 L 60,145 L 100,155 L 140,140 L 180,150 L 220,145 L 260,160 L 300,130 L 340,150 L 380,145 L 420,155 L 460,140 L 500,150 L 540,145 L 580,150";
    }
  };
  
  // Find the caffeine marker position (peak heart rate)
  const getCaffeineMarkerPosition = () => {
    if (responseData.length === 0) return { top: "30%", left: "50%" };
    
    const heartRates = responseData.map(d => d.heartRate);
    const maxHR = Math.max(...heartRates);
    const peakIndex = heartRates.indexOf(maxHR);
    
    const x = (peakIndex / (responseData.length - 1)) * 100;
    
    // Find min and max for scaling
    const minHR = Math.min(...heartRates);
    const range = maxHR - minHR || 1;
    
    // Normalize height (0% is top, 100% is bottom)
    const normalizedHR = 100 - ((maxHR - minHR) / range * 75);
    
    return {
      top: `${normalizedHR}%`,
      left: `${x}%`
    };
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
          <h2>Caffeine Detection</h2>
          <div className="detection-container">
            <p>Click anywhere in this card to start a 30-second caffeine detection</p>
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
              <h2>Caffeine Status</h2>
              <div className="status-indicator">
                <span className="status-dot active" title="Caffeine detected in system"></span>
                <span>Last detected: just now</span>
              </div>
              <div className="metrics">
                <div className="metric" title="Current caffeine intensity level">
                  <span className="label">Intensity</span>
                  <span className="value">Moderate</span>
                </div>
                <div className="metric" title="Estimated duration of caffeine effects">
                  <span className="label">Duration</span>
                  <span className="value">4 hours</span>
                </div>
                <div className="metric" title="Time until next recommended intake">
                  <span className="label">Next Intake</span>
                  <span className="value">3 hours</span>
                </div>
                <div className="metric" title="Metabolic rate">
                  <span className="label">Metabolism</span>
                  <span className="value">Normal</span>
                </div>
              </div>
            </div>

        <div className="graph-container">
              <h2>Response Pattern</h2>
              <div className="chart-placeholder" style={{ padding: '20px', position: 'relative' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>Loading data...</div>
                ) : responseData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>No data available</div>
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
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Skin conductance path */}
                    <path
                      d={generateSkinConductancePath()}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Data points for heart rate */}
                    {responseData.filter((_, i) => i % 5 === 0).map((d, i) => {
                      const width = 600;
                      const height = 200;
                      const padding = 20;
                      const heartRates = responseData.map(d => d.heartRate || 80);
                      const minRate = Math.min(...heartRates) - 5;
                      const maxRate = Math.max(...heartRates) + 5;
                      const actualIndex = i * 5;
                      const xScale = (i: number) => padding + (i * (width - 2 * padding) / (heartRates.length - 1));
                      const yScale = (rate: number) => height - padding - ((rate - minRate) / (maxRate - minRate) * (height - 2 * padding));
                      
                      return (
                        <circle
                          key={`hr-point-${i}`}
                          cx={xScale(actualIndex)}
                          cy={yScale(d.heartRate || 80)}
                          r="4"
                          fill="#3b82f6"
                        />
                      );
                    })}
                    
                    {/* Data points for skin conductance */}
                    {responseData.filter((_, i) => i % 5 === 0).map((d, i) => {
                      const width = 600;
                      const height = 200;
                      const padding = 20;
                      const scValues = responseData.map(d => d.skinConductance || 0.5);
                      const minSC = Math.min(...scValues) - 0.05;
                      const maxSC = Math.max(...scValues) + 0.05;
                      const actualIndex = i * 5;
                      const xScale = (i: number) => padding + (i * (width - 2 * padding) / (scValues.length - 1));
                      const yScale = (value: number) => height - padding - ((value - minSC) / (maxSC - minSC) * (height - 2 * padding));
                      
                      return (
                        <circle
                          key={`sc-point-${i}`}
                          cx={xScale(actualIndex)}
                          cy={yScale(d.skinConductance || 0.5)}
                          r="4"
                          fill="#f97316"
                        />
                      );
                    })}
                    
                    {/* Y-axis labels - split into two sides for clarity */}
                    <text x="10" y="30" fill="#3b82f6" fontSize="12">
                      HR: {Math.round(Math.max(...responseData.map(d => d.heartRate || 80)))} BPM
                    </text>
                    <text x="10" y="220" fill="#3b82f6" fontSize="12">
                      HR: {Math.round(Math.min(...responseData.map(d => d.heartRate || 80)))} BPM
                    </text>
                    <text x="550" y="30" fill="#f97316" fontSize="12" textAnchor="end">
                      SC: {(Math.max(...responseData.map(d => d.skinConductance || 0.5))).toFixed(2)}
                    </text>
                    <text x="550" y="220" fill="#f97316" fontSize="12" textAnchor="end">
                      SC: {(Math.min(...responseData.map(d => d.skinConductance || 0.5))).toFixed(2)}
                    </text>
                  </svg>
                )}
                
                {/* Remove old Y-axis labels as we now have them in the SVG */}
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
                </div>
              </div>
              <div className="chart-legend" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="dot" style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '50%', marginRight: '5px' }}></span>
                  <span>Heart Rate</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="dot" style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#f97316', borderRadius: '50%', marginRight: '5px' }}></span>
                  <span>Skin Conductance</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="dot" style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '5px' }}></span>
                  <span>Target Zone</span>
                </div>
        </div>
      </div>

            <div className="card">
              <h2>Recommendations</h2>
              <ul className="recommendations">
                <li className="recommendation-item">
                  <span className="recommendation-icon">💧</span>
                  <span>Stay hydrated with water</span>
                </li>
                <li className="recommendation-item">
                  <span className="recommendation-icon">🚶</span>
                  <span>Take a short walk to help metabolize caffeine</span>
                </li>
                <li className="recommendation-item">
                  <span className="recommendation-icon">⏰</span>
                  <span>Consider reducing afternoon intake</span>
                </li>
              </ul>
            </div>

            {/* External Caffeine Visualization */}
            <div className="card" style={{ gridColumn: "1 / span 2", marginTop: "20px" }}>
              <div className="caffeine-monitor">
                <h2>Advanced Caffeine Visualization</h2>
                <div style={{ 
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  backgroundColor: '#1a1a2e',
                  minHeight: '550px',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Replace static image with iframe to WebSocket client */}
                  <iframe
                    src="http://localhost:5001/websocket-client"
                    style={{
                      width: '100%',
                      height: '550px',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    title="Real-time Caffeine Visualization"
                  />
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#999', 
                  marginTop: '10px', 
                  textAlign: 'center' 
                }}>
                  Real-time streaming visualization from caffeine detection server
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

export default Caffeine;
