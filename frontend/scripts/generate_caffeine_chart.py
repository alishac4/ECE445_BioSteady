#!/usr/bin/env python3

import matplotlib.pyplot as plt
import numpy as np
import sys
import os
import json
from datetime import datetime, timedelta

def generate_caffeine_chart(user_id):
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
    
    # Generate dummy caffeine levels (higher on even days, lower on odd days)
    caffeine_levels = []
    for i, date in enumerate(dates):
        if date.day % 2 == 0:
            # Even days - higher caffeine
            caffeine_levels.append(np.random.randint(180, 250))
        else:
            # Odd days - lower caffeine
            caffeine_levels.append(np.random.randint(100, 170))
    
    # Calculate statistics
    avg_caffeine = sum(caffeine_levels) / len(caffeine_levels)
    max_caffeine = max(caffeine_levels)
    min_caffeine = min(caffeine_levels)
    last_reading = caffeine_levels[-1]
    
    # Create the chart
    plt.figure(figsize=(10, 6))
    plt.plot(date_labels, caffeine_levels, marker='o', linestyle='-', linewidth=2, color='#0066cc')
    
    # Add reference lines
    plt.axhline(y=200, color='#ff3333', linestyle='--', alpha=0.7, label='High Caffeine')
    plt.axhline(y=150, color='#ffcc00', linestyle='--', alpha=0.7, label='Moderate Caffeine')
    
    # Customize chart appearance
    plt.title('Caffeine Levels - Last 7 Days', fontsize=16)
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Caffeine Level (mg)', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.legend()
    
    # Adjust layout and save chart
    plt.tight_layout()
    chart_path = f'public/charts/caffeine_chart_{user_id}.png'
    plt.savefig(chart_path)
    
    # Create data for JSON file
    chart_data = {
        "chartPath": f'/charts/caffeine_chart_{user_id}.png',
        "averageCaffeine": round(avg_caffeine, 1),
        "maxCaffeine": max_caffeine,
        "minCaffeine": min_caffeine,
        "lastReading": last_reading,
        "data": [
            {"timestamp": timestamps[i], "level": level} 
            for i, level in enumerate(caffeine_levels)
        ]
    }
    
    # Save data to JSON file
    json_path = f'public/charts/caffeine_data_{user_id}.json'
    with open(json_path, 'w') as f:
        json.dump(chart_data, f, indent=2)
    
    print(json.dumps(chart_data, indent=2))
    return chart_data

if __name__ == "__main__":
    user_id = sys.argv[1] if len(sys.argv) > 1 else "default"
    generate_caffeine_chart(user_id) 