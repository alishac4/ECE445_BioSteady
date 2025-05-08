#!/usr/bin/env python3

from flask import Flask, send_file, request, render_template_string
from flask_cors import CORS
import matplotlib
# Set non-interactive backend before importing pyplot to avoid GUI issues on macOS
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import io
import os
import time
import json
from datetime import datetime, timedelta
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="*")  # Initialize SocketIO with CORS

# Simulated data for demonstration
class SimulatedData:
    def __init__(self):
        self.start_time = time.time()
        self.hr_base = 85
        self.sc_base = 0.5
        self.caffeine_detected = False
        self.last_detection_time = None
        self.detection_threshold = 105  # HR threshold for "detecting" caffeine
        self.detection_count = 0
        self.samples = []
        
        # Initial 30 seconds of data
        for i in range(30):
            self.add_data_point()
    
    def add_data_point(self):
        current_time = time.time()
        elapsed = current_time - self.start_time
        
        # Increase HR and SC over time with some randomness
        time_factor = min(1.0, elapsed / 120)  # Full effect after 2 minutes
        hr_increase = 30 * time_factor  # Up to 30 BPM increase
        sc_increase = 0.3 * time_factor  # Up to 0.3 unit increase
        
        # Add randomness - reduce noise for smoother curves
        hr_noise = np.random.normal(0, 1.2)  # Reduced noise
        sc_noise = np.random.normal(0, 0.02)  # Reduced noise
        
        # Calculate current values with smoothing
        last_hr = self.samples[-1]['heart_rate'] if self.samples else self.hr_base
        last_sc = self.samples[-1]['skin_conductance'] if self.samples else self.sc_base
        
        # Apply smoothing - blend with previous value for smoother transitions
        smoothing = 0.7  # Higher = more smoothing
        target_hr = self.hr_base + hr_increase + hr_noise
        target_sc = self.sc_base + sc_increase + sc_noise
        
        hr = last_hr * smoothing + target_hr * (1 - smoothing)
        sc = last_sc * smoothing + target_sc * (1 - smoothing)
        
        # Store the data point
        timestamp = datetime.now()
        self.samples.append({
            'timestamp': timestamp,
            'heart_rate': hr,
            'skin_conductance': sc
        })
        
        # Keep only last 60 seconds of data
        while len(self.samples) > 60:
            self.samples.pop(0)
        
        # Check for caffeine detection
        if hr > self.detection_threshold and not self.caffeine_detected:
            self.caffeine_detected = True
            self.last_detection_time = timestamp
            self.detection_count += 1
        
        # Reset detection after some time
        if self.caffeine_detected and self.last_detection_time:
            detection_age = (timestamp - self.last_detection_time).total_seconds()
            if detection_age > 120:  # Reset after 2 minutes
                self.caffeine_detected = False
        
        # Return the latest data point
        return {
            'timestamp': timestamp.strftime('%H:%M:%S'),
            'heart_rate': hr,
            'skin_conductance': sc,
            'caffeine_detected': self.caffeine_detected
        }

# Create simulator instance
simulator = SimulatedData()

# Background thread for sending data
def background_thread():
    last_data_count = 0
    while True:
        # Check if we've received new data since the last time
        current_data_count = len(simulator.samples)
        
        # Only generate new data if we haven't received external data
        if current_data_count == last_data_count:
            # Add a new simulated data point
            data_point = simulator.add_data_point()
            
            # Emit data to all connected clients
            socketio.emit('data_update', data_point)
        
        last_data_count = len(simulator.samples)
        
        # Sleep for a short time
        socketio.sleep(0.5)  # 500ms refresh rate is sufficient

@app.route('/get-plot')
def get_plot():
    # Update data
    simulator.add_data_point()
    
    # Get the latest data
    data = simulator.samples
    timestamps = [d['timestamp'] for d in data]
    heart_rates = [d['heart_rate'] for d in data]
    skin_conductance = [d['skin_conductance'] for d in data]
    
    # Format timestamps for x-axis
    time_labels = [(t - timestamps[0]).total_seconds() for t in timestamps]
    
    # Create the figure with dark background - use tight figure size for efficiency
    plt.figure(figsize=(10, 6), facecolor='#1a1a2e', dpi=80)
    ax = plt.axes()
    ax.set_facecolor('#1a1a2e')
    
    # Plot heart rate with left y-axis - use smoother lines
    ax.plot(time_labels, heart_rates, color='#3b82f6', linewidth=2.5, label='Heart Rate', 
            path_effects=[], alpha=0.9)
    ax.set_xlabel('Time (seconds)', color='white')
    ax.set_ylabel('Heart Rate (BPM)', color='#3b82f6')
    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='#3b82f6')
    
    # Create a right y-axis for skin conductance
    ax2 = ax.twinx()
    ax2.plot(time_labels, skin_conductance, color='#f97316', linewidth=2.5, label='Skin Conductance',
             path_effects=[], alpha=0.9)
    ax2.set_ylabel('Skin Conductance (μS)', color='#f97316')
    ax2.tick_params(axis='y', colors='#f97316')
    
    # Set up grid and limits
    ax.grid(True, linestyle='--', alpha=0.2)  # Lighter grid
    ax.set_xlim(0, max(time_labels))
    
    # HR range with padding - keep consistent for smoother visual
    max_hr_ever = 120  # Maximum we expect
    min_hr_ever = 70   # Minimum we expect
    ax.set_ylim(min_hr_ever, max_hr_ever)
    
    # SC range with some padding - keep consistent
    max_sc_ever = 0.9  # Maximum we expect
    min_sc_ever = 0.4  # Minimum we expect
    ax2.set_ylim(min_sc_ever, max_sc_ever)
    
    # Title
    plt.title('Sensor Response', color='white', fontsize=16)
    
    # Create a custom legend
    lines = ax.get_lines() + ax2.get_lines()
    labels = [line.get_label() for line in lines]
    ax.legend(lines, labels, loc='upper right', facecolor='#2a2a4a', edgecolor='none', labelcolor='white')
    
    # Add coffee cup icon if caffeine is detected
    if simulator.caffeine_detected:
        # Add coffee cup emoji or icon
        ax.text(0.97, 0.03, '☕', transform=ax.transAxes, 
                fontsize=24, color='#f97316', ha='right', va='bottom')
        
        # Add detection text
        ax.text(0.03, 0.03, 'Caffeine Detected', transform=ax.transAxes,
                fontsize=12, color='#f97316', ha='left', va='bottom')
    
    # Add timestamp
    current_time = datetime.now().strftime("%H:%M:%S")
    ax.text(0.03, 0.97, f'Time: {current_time}', transform=ax.transAxes,
            fontsize=10, color='white', ha='left', va='top', alpha=0.7)
    
    # Optimize for performance
    plt.tight_layout()
    
    # Save plot to a memory buffer with optimized settings
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=80, bbox_inches='tight', pad_inches=0.1,
                facecolor='#1a1a2e', edgecolor='none')
    buf.seek(0)
    plt.close('all')  # Ensure all figures are closed to prevent memory leaks
    
    return send_file(buf, mimetype='image/png')

@app.route('/status')
def status():
    # Get detection status
    detection_age = None
    if simulator.last_detection_time:
        detection_age = (datetime.now() - simulator.last_detection_time).total_seconds() / 60.0  # in minutes
    
    intensity = "None"
    if simulator.caffeine_detected:
        if max([d['heart_rate'] for d in simulator.samples]) > 110:
            intensity = "High"
        else:
            intensity = "Moderate"
    
    return {
        "caffeine_detected": simulator.caffeine_detected,
        "detection_count": simulator.detection_count,
        "last_detection_time": simulator.last_detection_time.isoformat() if simulator.last_detection_time else None,
        "detection_age_minutes": detection_age,
        "intensity": intensity,
        "current_heart_rate": simulator.samples[-1]['heart_rate'] if simulator.samples else None,
        "current_skin_conductance": simulator.samples[-1]['skin_conductance'] if simulator.samples else None
    }

@app.route('/websocket-client')
def websocket_client():
    """Serve a simple HTML page with WebSocket client for testing"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Caffeine Detection Streaming Client</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #1a1a2e;
                color: white;
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
            }
            .chart-container {
                position: relative;
                height: 400px;
                background-color: #1a1a2e;
                border-radius: 8px;
                margin-bottom: 20px;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            .status {
                display: flex;
                justify-content: space-between;
                padding: 15px;
                background-color: #242444;
                border-radius: 8px;
                margin-bottom: 20px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            .caffeine-indicator {
                display: flex;
                align-items: center;
            }
            .caffeine-indicator .cup {
                font-size: 24px;
                margin-right: 10px;
                opacity: 0.3;
                transition: opacity 0.5s;
            }
            .caffeine-indicator.detected .cup {
                opacity: 1;
                color: #f97316;
            }
            h1, h2 {
                color: #3b82f6;
            }
            .value {
                font-size: 18px;
                font-weight: bold;
            }
            .label {
                font-size: 14px;
                color: #aaa;
                margin-bottom: 5px;
            }
        </style>
    </head>
    <body>
        <h1>Caffeine Detection - Live Stream</h1>
        
        <div class="status">
            <div>
                <div class="label">Heart Rate</div>
                <div class="value" id="hr-value">--.-- BPM</div>
            </div>
            <div>
                <div class="label">Skin Conductance</div>
                <div class="value" id="sc-value">--.-- μS</div>
            </div>
            <div class="caffeine-indicator" id="caffeine-indicator">
                <div class="cup">☕</div>
                <div>
                    <div class="label">Caffeine Status</div>
                    <div class="value" id="caffeine-status">Not Detected</div>
                </div>
            </div>
        </div>
        
        <div class="chart-container">
            <canvas id="chartCanvas"></canvas>
        </div>
        
        <script>
            // Connect to the Socket.IO server
            const socket = io();
            
            // Chart.js setup
            const ctx = document.getElementById('chartCanvas').getContext('2d');
            const maxDataPoints = 100;
            const data = {
                labels: Array(maxDataPoints).fill(''),
                datasets: [
                    {
                        label: 'Heart Rate',
                        borderColor: '#3b82f6',
                        data: [],
                        yAxisID: 'y',
                        tension: 0.3  // Smooth the line
                    },
                    {
                        label: 'Skin Conductance',
                        borderColor: '#f97316',
                        data: [],
                        yAxisID: 'y1',
                        tension: 0.3  // Smooth the line
                    }
                ]
            };
            
            const config = {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0  // For smoother real-time updates
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            min: 70,
                            max: 120,
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)'
                            },
                            ticks: {
                                color: '#3b82f6'
                            },
                            title: {
                                display: true,
                                text: 'Heart Rate (BPM)',
                                color: '#3b82f6'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            min: 0.4,
                            max: 0.9,
                            grid: {
                                color: 'rgba(249, 115, 22, 0.1)',
                                drawOnChartArea: false
                            },
                            ticks: {
                                color: '#f97316'
                            },
                            title: {
                                display: true,
                                text: 'Skin Conductance (μS)',
                                color: '#f97316'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: 'white'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)'
                        }
                    }
                }
            };
            
            const chart = new Chart(ctx, config);
            
            // Listen for data updates
            socket.on('data_update', function(data) {
                // Update chart data
                if (chart.data.datasets[0].data.length >= maxDataPoints) {
                    chart.data.datasets[0].data.shift();
                    chart.data.datasets[1].data.shift();
                    chart.data.labels.shift();
                    chart.data.labels.push(data.timestamp);
                } else {
                    chart.data.labels.push(data.timestamp);
                }
                
                chart.data.datasets[0].data.push(data.heart_rate);
                chart.data.datasets[1].data.push(data.skin_conductance);
                chart.update('none');  // Update without animation for smoothness
                
                // Update status displays
                document.getElementById('hr-value').textContent = data.heart_rate.toFixed(1) + ' BPM';
                document.getElementById('sc-value').textContent = data.skin_conductance.toFixed(2) + ' μS';
                
                // Update caffeine status
                const indicator = document.getElementById('caffeine-indicator');
                if (data.caffeine_detected) {
                    indicator.classList.add('detected');
                    document.getElementById('caffeine-status').textContent = 'Detected';
                } else {
                    indicator.classList.remove('detected');
                    document.getElementById('caffeine-status').textContent = 'Not Detected';
                }
            });
        </script>
    </body>
    </html>
    """
    return render_template_string(html)

@app.route('/')
def home():
    return """
    <html>
    <head>
        <title>Caffeine Detection Server</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            h1 {
                color: #333;
            }
            .endpoint {
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 15px;
                margin-bottom: 15px;
            }
            code {
                background-color: #f0f0f0;
                padding: 2px 4px;
                border-radius: 3px;
            }
            .button {
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 10px 15px;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <h1>Caffeine Detection Server</h1>
        <p>This server provides simulated caffeine detection data and visualizations.</p>
        
        <div class="endpoint">
            <h2>Endpoints:</h2>
            <ul>
                <li><code>/get-plot</code> - Returns a static visualization of heart rate and skin conductance</li>
                <li><code>/status</code> - Returns JSON with the current detection status</li>
                <li><code>/websocket-client</code> - Interactive real-time visualization with WebSockets</li>
            </ul>
        </div>
        
        <div class="endpoint">
            <h2>Live Preview:</h2>
            <p>For a static image visualization:</p>
            <img src="/get-plot" width="100%" id="preview">
            <script>
                setInterval(function() {
                    document.getElementById('preview').src = '/get-plot?t=' + new Date().getTime();
                }, 1000);
            </script>
            
            <p>For a smoother, real-time visualization with WebSockets:</p>
            <a href="/websocket-client" class="button">Open WebSocket Visualization</a>
        </div>
    </body>
    </html>
    """

# HTTP endpoint for receiving sensor data
@app.route('/api/sensor-data', methods=['POST'])
def receive_sensor_data():
    data = request.json
    print(f"Received sensor data via HTTP: {data}")
    
    # Check if we have heart rate and skin conductance
    if 'heart_rate' in data and 'skin_conductance' in data:
        # Update simulator with the received values
        timestamp = datetime.now()
        simulator.samples.append({
            'timestamp': timestamp,
            'heart_rate': data['heart_rate'],
            'skin_conductance': data['skin_conductance']
        })
        
        # Keep only the last 60 samples
        while len(simulator.samples) > 60:
            simulator.samples.pop(0)
        
        # Update caffeine detection status
        simulator.caffeine_detected = data.get('caffeine_detected', False)
        if simulator.caffeine_detected:
            simulator.last_detection_time = timestamp
            simulator.detection_count += 1
        
        # Emit the data to all connected clients immediately
        socketio.emit('data_update', {
            'timestamp': timestamp.strftime('%H:%M:%S'),
            'heart_rate': data['heart_rate'],
            'skin_conductance': data['skin_conductance'],
            'caffeine_detected': simulator.caffeine_detected
        })
        
        return {'status': 'success', 'message': 'Data received'}
    else:
        return {'status': 'error', 'message': 'Missing heart_rate or skin_conductance'}, 400

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    socketio.start_background_task(background_thread)

# Add sensor_data handler to receive data from sensor_reader_example.py
@socketio.on('sensor_data')
def handle_sensor_data(data):
    print(f"Received sensor data: {data}")
    # Check if we have heart rate and skin conductance
    if 'heart_rate' in data and 'skin_conductance' in data:
        # Update simulator with the received values
        timestamp = datetime.now()
        simulator.samples.append({
            'timestamp': timestamp,
            'heart_rate': data['heart_rate'],
            'skin_conductance': data['skin_conductance']
        })
        
        # Keep only the last 60 samples
        while len(simulator.samples) > 60:
            simulator.samples.pop(0)
        
        # Update caffeine detection status
        simulator.caffeine_detected = data.get('caffeine_detected', False)
        if simulator.caffeine_detected:
            simulator.last_detection_time = timestamp
            simulator.detection_count += 1
        
        # Emit the data to all connected clients immediately
        socketio.emit('data_update', {
            'timestamp': timestamp.strftime('%H:%M:%S'),
            'heart_rate': data['heart_rate'],
            'skin_conductance': data['skin_conductance'],
            'caffeine_detected': simulator.caffeine_detected
        })
        
        return {'status': 'success', 'message': 'Data received'}
    else:
        return {'status': 'error', 'message': 'Missing heart_rate or skin_conductance'}

if __name__ == "__main__":
    print("Starting Caffeine Detection Server...")
    print("Access the static visualization at: http://localhost:5001/get-plot")
    print("Access the interactive WebSocket visualization at: http://localhost:5001/websocket-client")
    print("Access the server homepage at: http://localhost:5001/")
    socketio.run(app, debug=True, host='0.0.0.0', port=5001) 