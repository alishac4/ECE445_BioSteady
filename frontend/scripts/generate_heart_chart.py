#!/usr/bin/env python3
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import firebase_admin
from firebase_admin import credentials, firestore
import datetime
import numpy as np
from matplotlib.colors import LinearSegmentedColormap
import os
import json

# Path to where you want to save the chart
CHART_OUTPUT_PATH = "../public/heart_rate_chart.png"

def initialize_firebase():
    """Initialize Firebase with service account credentials."""
    try:
        # Initialize with your service account credentials
        cred = credentials.Certificate("./serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        return firestore.client()
    except:
        # If running locally without credentials, print instructions
        print("Firebase credentials not found. Create a serviceAccountKey.json file from Firebase console.")
        return None

def fetch_heart_rate_data(db):
    """Fetch heart rate data from Firestore."""
    if not db:
        # Use sample data if Firebase connection failed
        return generate_sample_data()
    
    # Get the latest 50 heart rate readings
    docs = db.collection('sensorData').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50).get()
    
    data = []
    for doc in docs:
        doc_data = doc.to_dict()
        # Convert Firestore timestamps to Python datetime
        if 'timestamp' in doc_data:
            if isinstance(doc_data['timestamp'], datetime.datetime):
                doc_data['timestamp'] = doc_data['timestamp']
            else:
                # Handle timestamp stored as seconds
                doc_data['timestamp'] = datetime.datetime.fromtimestamp(doc_data['timestamp'].seconds)
        
        data.append(doc_data)
    
    # Reverse to get chronological order
    data.reverse()
    return data

def generate_sample_data():
    """Generate sample heart rate data for testing."""
    now = datetime.datetime.now()
    data = []
    
    # Generate 20 sample data points with realistic heart rate patterns
    base_rate = 72
    for i in range(20):
        # Create some variation in heart rate
        rate = base_rate + np.sin(i/3) * 15 + np.random.randint(-5, 5)
        
        data.append({
            'timestamp': now - datetime.timedelta(minutes=20-i),
            'heartRate': int(rate),
            'gsr': 0.1 + np.random.random() * 0.1
        })
    
    return data

def generate_heart_rate_chart(data):
    """Generate a heart rate chart from the data."""
    # Extract data for plotting
    timestamps = [entry.get('timestamp') for entry in data if 'timestamp' in entry and 'heartRate' in entry]
    heart_rates = [entry.get('heartRate') for entry in data if 'timestamp' in entry and 'heartRate' in entry]
    
    if not timestamps or not heart_rates:
        print("No valid heart rate data found")
        return False
    
    # Create a figure with a dark background
    plt.figure(figsize=(10, 5), facecolor='#1a2637')
    ax = plt.axes()
    ax.set_facecolor('#1a2637')
    
    # Create a custom green gradient colormap
    colors = [(0, '#1a2637'), (1, '#4ade80')]  # Dark to green
    cmap = LinearSegmentedColormap.from_list("green_gradient", colors)
    
    # Plot heart rate line
    plt.plot(timestamps, heart_rates, color='#4ade80', linewidth=3)
    
    # Add a fill below the line
    plt.fill_between(timestamps, min(heart_rates)-5, heart_rates, color='#4ade80', alpha=0.2)
    
    # Add data points
    plt.scatter(timestamps, heart_rates, color='#4ade80', s=50, zorder=5)
    
    # Add grid lines
    plt.grid(color='#2a3a4d', linestyle='-', linewidth=0.5, alpha=0.7)
    
    # Format the x-axis to show time
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))
    
    # Set labels and title
    plt.title('Heart Rate Monitoring', color='white', fontsize=16, pad=20)
    plt.xlabel('Time', color='white', fontsize=12, labelpad=10)
    plt.ylabel('BPM', color='white', fontsize=12, labelpad=10)
    
    # Set tick colors
    plt.tick_params(colors='white')
    for spine in ax.spines.values():
        spine.set_color('#2a3a4d')
    
    # Add some stats to the chart
    avg_hr = sum(heart_rates) / len(heart_rates)
    max_hr = max(heart_rates)
    
    stats_text = f"Average: {avg_hr:.1f} BPM\nPeak: {max_hr} BPM"
    plt.figtext(0.02, 0.02, stats_text, color='white', fontsize=10, 
                bbox=dict(facecolor='#2a3a4d', alpha=0.7, boxstyle='round,pad=0.5'))
    
    # Add a timestamp for when the chart was generated
    gen_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    plt.figtext(0.98, 0.02, f"Generated: {gen_time}", color='#94a3b8', 
                fontsize=8, ha='right')
    
    # Adjust layout and save
    plt.tight_layout()
    
    # Create directories if they don't exist
    os.makedirs(os.path.dirname(CHART_OUTPUT_PATH), exist_ok=True)
    
    # Save the chart
    plt.savefig(CHART_OUTPUT_PATH, dpi=150, bbox_inches='tight')
    plt.close()
    
    print(f"Chart saved to {CHART_OUTPUT_PATH}")
    return True

def save_data_for_web(data):
    """Save the data as JSON for web consumption."""
    web_data = []
    
    for entry in data:
        if 'timestamp' in entry and 'heartRate' in entry:
            # Convert timestamp to string format
            if isinstance(entry['timestamp'], datetime.datetime):
                timestamp_str = entry['timestamp'].isoformat()
            else:
                timestamp_str = str(entry['timestamp'])
                
            web_data.append({
                'timestamp': timestamp_str,
                'heartRate': entry.get('heartRate', 0),
                'gsr': entry.get('gsr', 0)
            })
    
    # Save to a JSON file
    json_path = "../public/heart_rate_data.json"
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    
    with open(json_path, 'w') as f:
        json.dump(web_data, f)
    
    print(f"Data saved to {json_path}")

def main():
    # Initialize Firebase
    db = initialize_firebase()
    
    # Fetch data
    data = fetch_heart_rate_data(db)
    
    # Generate and save the chart
    success = generate_heart_rate_chart(data)
    
    # Save data for web consumption
    if success:
        save_data_for_web(data)
        print("Heart rate chart and data files generated successfully!")
    else:
        print("Failed to generate heart rate chart.")

if __name__ == "__main__":
    main() 