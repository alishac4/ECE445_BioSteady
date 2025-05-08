#!/usr/bin/env python3
import matplotlib.pyplot as plt
import numpy as np
import sys
import os
import json
from datetime import datetime, timedelta

def generate_heartrate_chart(user_id):
    # Create directories if they don't exist
    charts_dir = os.path.join('public', 'charts')
    os.makedirs(charts_dir, exist_ok=True)
    
    # Generate timestamps for last 7 days
    end_date = datetime.now()
    dates = [(end_date - timedelta(days=i)) for i in range(7)]
    dates.reverse()  # Sort chronologically
    
    # Format dates for x-axis
    date_labels = [date.strftime('%m/%d') for date in dates]
    timestamps = [date.timestamp() * 1000 for date in dates]  # Convert to milliseconds for JSON
    
    # Generate dummy heart rate data (varied by day of week)
    # Resting rate around 60-75, exercise spikes up to 120-150
    heart_rates = []
    for i, date in enumerate(dates):
        # Simulate slightly higher heart rates on weekdays (more stress)
        if date.weekday() < 5:  # Monday to Friday
            base_rate = np.random.randint(65, 80)
        else:  # Weekend
            base_rate = np.random.randint(60, 75)
        
        # Add some randomness for daily fluctuation
        heart_rates.append(base_rate)
    
    # Calculate statistics
    avg_rate = sum(heart_rates) / len(heart_rates)
    max_rate = max(heart_rates)
    min_rate = min(heart_rates)
    last_reading = heart_rates[-1]
    
    # Create the chart
    plt.figure(figsize=(10, 6))
    plt.plot(date_labels, heart_rates, marker='o', linestyle='-', linewidth=2, color='#e74c3c')
    
    # Add reference lines
    plt.axhline(y=100, color='#ff3333', linestyle='--', alpha=0.7, label='Exercise Level')
    plt.axhline(y=70, color='#33cc33', linestyle='--', alpha=0.7, label='Resting Level')
    
    # Customize chart appearance
    plt.title('Average Heart Rate - Last 7 Days', fontsize=16)
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Heart Rate (BPM)', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.legend()
    
    # Adjust layout and save chart
    plt.tight_layout()
    chart_path = f'public/charts/heartrate_chart_{user_id}.png'
    plt.savefig(chart_path)
    
    # Create data for JSON file
    chart_data = {
        "chartPath": f'/charts/heartrate_chart_{user_id}.png',
        "averageRate": round(avg_rate, 1),
        "maxRate": max_rate,
        "minRate": min_rate,
        "lastReading": last_reading,
        "data": [
            {"timestamp": timestamps[i], "rate": rate} 
            for i, rate in enumerate(heart_rates)
        ]
    }
    
    # Save data to JSON file
    json_path = f'public/charts/heartrate_data_{user_id}.json'
    with open(json_path, 'w') as f:
        json.dump(chart_data, f, indent=2)
    
    print(json.dumps(chart_data, indent=2))
    return chart_data

if __name__ == "__main__":
    user_id = sys.argv[1] if len(sys.argv) > 1 else "default"
    generate_heartrate_chart(user_id) 