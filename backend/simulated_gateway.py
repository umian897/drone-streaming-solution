# simulated_gateway.py
import socketio
import time
import json
import random

# --- Configuration ---
# IMPORTANT: Replace with the actual IP address of your Mac running the Flask backend
# If Flask is running on localhost (127.0.0.1) and this script is on the same machine,
# you can use 'http://127.0.0.1:5000'.
# If Flask is running on your local network IP (e.g., 192.168.0.180), use that.
FLASK_BACKEND_URL = "http://127.0.0.1:5000" # !!! ADJUST THIS URL !!!

DRONE_ID = "DRN-SIM-001" # A unique ID for this simulated drone/gateway

sio = socketio.Client()

# --- Simulated Drone State ---
sim_latitude = 34.0522
sim_longitude = -118.2437
sim_altitude = 0.0
sim_battery_percent = 100
sim_speed = 0.0
sim_flight_mode = "GPS"
sim_status = "Disconnected" # Initial status

# --- Socket.IO Event Handlers ---

@sio.event
def connect():
    global sim_status
    print(f"[Gateway] Connected to Flask backend at {FLASK_BACKEND_URL}")
    sim_status = "Connected to Backend"
    # Register this client as a gateway with the backend
    sio.emit('register_as_gateway', {'drone_id': DRONE_ID})
    print(f"[Gateway] Registered as gateway for drone: {DRONE_ID}")
    start_telemetry_simulation()

@sio.event
def disconnect():
    global sim_status
    print("[Gateway] Disconnected from Flask backend.")
    sim_status = "Disconnected"
    stop_telemetry_simulation()

@sio.event
def connect_error(data):
    global sim_status
    print(f"[Gateway] Connection failed: {data}")
    sim_status = "Connection Error"

@sio.on('drone_command')
def on_drone_command(data):
    """
    Handles commands received from the Flask backend.
    Example data: {'command': 'takeoff', 'params': {'altitude': 10}}
    """
    command = data.get('command')
    params = data.get('params', {})
    print(f"\n[Gateway] Received command: {command} with params: {params}")

    # --- Simulate DJI SDK command execution ---
    global sim_altitude, sim_speed, sim_flight_mode, sim_status

    status = "success"
    message = f"Simulated command '{command}' executed."

    if command == "takeoff":
        if sim_altitude == 0:
            sim_altitude = params.get('altitude', 10.0)
            sim_speed = 5.0
            sim_flight_mode = "Auto-Takeoff"
            sim_status = "Flying"
            print(f"[Gateway] Simulating takeoff to {sim_altitude}m...")
        else:
            status = "failure"
            message = "Already airborne."
            print("[Gateway] Cannot takeoff, already airborne.")

    elif command == "land":
        if sim_altitude > 0:
            sim_altitude = 0.0
            sim_speed = 0.0
            sim_flight_mode = "Auto-Landing"
            sim_status = "Landed"
            print("[Gateway] Simulating landing...")
        else:
            status = "failure"
            message = "Already on ground."
            print("[Gateway] Cannot land, already on ground.")

    elif command == "take_photo":
        print("[Gateway] Simulating photo capture...")
        # In a real app, this would involve DJI SDK's camera.takePhoto()
        # and then uploading the image to cloud storage and notifying Flask.
        # For simulation, we just notify Flask directly.
        media_url = f"https://placehold.co/600x400/{random.randint(0, 0xFFFFFF):06x}/ffffff?text=Simulated+Photo+{int(time.time())}"
        sio.emit('media_captured', {
            'drone_id': DRONE_ID,
            'media_url': media_url,
            'type': 'image',
            'title': f"Simulated Photo from {DRONE_ID}",
            'timestamp': time.time() * 1000 # Milliseconds for JS
        })
        message = "Simulated photo captured and notified backend."

    elif command == "record_video_start":
        print("[Gateway] Simulating video recording start...")
        sim_status = "Recording Video"
        message = "Simulated video recording started."

    elif command == "record_video_stop":
        print("[Gateway] Simulating video recording stop...")
        sim_status = "Flying" # Back to flying status
        media_url = f"https://www.w3schools.com/html/mov_bbb.mp4" # Example video URL
        sio.emit('media_captured', {
            'drone_id': DRONE_ID,
            'media_url': media_url,
            'type': 'video',
            'title': f"Simulated Video from {DRONE_ID}",
            'timestamp': time.time() * 1000 # Milliseconds for JS
        })
        message = "Simulated video recording stopped and notified backend."

    else:
        status = "failure"
        message = f"Unknown command: {command}"
        print(f"[Gateway] Unknown command: {command}")

    # Emit command status back to Flask
    sio.emit('command_status_report', {
        'drone_id': DRONE_ID,
        'command': command,
        'status': status,
        'message': message
    })

# --- Telemetry Simulation Loop ---
telemetry_timer = None

def send_simulated_telemetry():
    global sim_latitude, sim_longitude, sim_altitude, sim_battery_percent, sim_speed, sim_flight_mode

    # Simulate movement and battery drain
    if sim_status == "Flying" or sim_status == "Recording Video":
        sim_latitude += (random.random() - 0.5) * 0.00005
        sim_longitude += (random.random() - 0.5) * 0.00005
        sim_battery_percent = max(0, sim_battery_percent - random.randint(0, 1))
        sim_speed = random.uniform(2.0, 15.0)
    elif sim_status == "Landed":
        sim_altitude = 0.0
        sim_speed = 0.0
    elif sim_status == "Disconnected":
        sim_battery_percent = 100 # Reset if disconnected
        sim_altitude = 0.0
        sim_speed = 0.0

    telemetry = {
        "latitude": round(sim_latitude, 6),
        "longitude": round(sim_longitude, 6),
        "altitude": round(sim_altitude, 2),
        "speed": round(sim_speed, 2),
        "battery_percent": sim_battery_percent,
        "flight_mode": sim_flight_mode,
        "signal": "Excellent" if sim_status != "Disconnected" else "No Signal",
        "timestamp": time.time() * 1000 # Send as milliseconds for JavaScript
    }

    if sio.connected:
        sio.emit('telemetry_update', {'drone_id': DRONE_ID, 'telemetry': telemetry})
        # print(f"[Gateway] Sent telemetry for {DRONE_ID}: {telemetry['battery_percent']}%")
    else:
        print("[Gateway] Socket not connected, stopping telemetry simulation.")
        stop_telemetry_simulation()

def start_telemetry_simulation():
    global telemetry_timer
    if telemetry_timer is None:
        telemetry_timer = sio.start_background_task(target=telemetry_loop)
        print("[Gateway] Started telemetry simulation.")

def stop_telemetry_simulation():
    global telemetry_timer
    if telemetry_timer:
        # No direct way to stop a background task in python-socketio,
        # but the loop will check sio.connected and exit.
        telemetry_timer = None
        print("[Gateway] Stopped telemetry simulation.")

def telemetry_loop():
    while sio.connected:
        send_simulated_telemetry()
        time.sleep(3) # Send telemetry every 3 seconds

# --- Main execution ---
if __name__ == '__main__':
    try:
        print(f"Attempting to connect to Flask backend at {FLASK_BACKEND_URL}...")
        sio.connect(FLASK_BACKEND_URL)
        sio.wait() # Keep the client running until disconnected
    except socketio.exceptions.ConnectionError as e:
        print(f"[Gateway] Could not connect to Flask backend: {e}")
        print("Please ensure your Flask backend is running and the FLASK_BACKEND_URL is correct.")
    except KeyboardInterrupt:
        print("\n[Gateway] Shutting down simulated gateway.")
    finally:
        if sio.connected:
            sio.disconnect()
