# app.py
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Configure SocketIO. Use a secret key for session management.
# For production, replace with a strong, randomly generated key.
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_super_secret_key_here')

# Initialize SocketIO with Flask app
# cors_allowed_origins="*" is for development. Restrict this in production!
# It should be your frontend URL (e.g., "http://localhost:3000") and your gateway app origins.
socketio = SocketIO(app, cors_allowed_origins="*")

# --- In-memory storage for simplicity (REPLACE WITH A DATABASE IN PRODUCTION) ---
# This will store the latest telemetry for each drone connected via a gateway
drone_telemetry_data = {}
# This will store pending commands for drones
drone_command_queue = {}
# This will store notifications for the frontend
notifications = [] # Example: [{'id': 1, 'message': 'Drone X battery low!', 'type': 'alert', 'read': False, 'timestamp': '...'}, ...]

# --- Helper function for notifications (can be moved to a separate module) ---
def add_notification(message, type='info'):
    """Adds a new notification and emits it to connected frontends."""
    new_notification = {
        'id': len(notifications) + 1,
        'message': message,
        'type': type,
        'read': False,
        'timestamp': request.json.get('timestamp') if request.is_json else None # Use timestamp from request if available
    }
    notifications.append(new_notification)
    # Emit to all connected frontends (React clients)
    socketio.emit('new_notification', new_notification, room='frontend_clients')
    print(f"Notification added: {message}")


# --- WebSocket Event Handlers (for Gateway App and Frontend) ---

@socketio.on('connect')
def handle_connect():
    """Handles new WebSocket connections."""
    print(f"Client connected: {request.sid}")
    # When a client connects, we don't immediately know if it's a gateway or frontend.
    # They should send a 'register_as_gateway' or 'register_as_frontend' event.

@socketio.on('disconnect')
def handle_disconnect():
    """Handles WebSocket disconnections."""
    print(f"Client disconnected: {request.sid}")
    # Clean up any associated drone data if this was a gateway
    for drone_id, sid in list(drone_telemetry_data.items()):
        if sid == request.sid:
            del drone_telemetry_data[drone_id]
            print(f"Gateway for drone {drone_id} disconnected.")
            add_notification(f"Drone {drone_id} gateway disconnected.", 'alert')
            break
    # Remove from frontend room if applicable
    leave_room(request.sid, 'frontend_clients')


@socketio.on('register_as_gateway')
def register_gateway(data):
    """
    Registers a connected client as a drone gateway.
    data should contain {'drone_id': 'DRN-001'}
    """
    drone_id = data.get('drone_id')
    if drone_id:
        # Store the SID associated with this drone_id
        drone_telemetry_data[drone_id] = request.sid
        join_room(drone_id) # Join a room specific to this drone for targeted commands
        print(f"Gateway for drone {drone_id} registered with SID: {request.sid}")
        add_notification(f"Drone {drone_id} gateway connected.", 'info')
    else:
        print(f"Invalid registration from {request.sid}: missing drone_id")

@socketio.on('register_as_frontend')
def register_frontend():
    """Registers a connected client as a frontend application."""
    join_room('frontend_clients')
    print(f"Frontend client registered with SID: {request.sid}")
    # Send initial notifications to the newly connected frontend
    emit('initial_notifications', notifications)


@socketio.on('telemetry_update')
def handle_telemetry_update(data):
    """
    Receives real-time telemetry from a drone gateway.
    data should contain {'drone_id': 'DRN-001', 'telemetry': {...}}
    """
    drone_id = data.get('drone_id')
    telemetry = data.get('telemetry')
    if drone_id and telemetry:
        # Update the in-memory telemetry data
        drone_telemetry_data[drone_id] = telemetry # In a real app, you'd store more than just telemetry here
        print(f"Received telemetry for {drone_id}: {telemetry}")
        # Emit the telemetry update to all connected frontend clients
        socketio.emit('drone_telemetry_update', {'drone_id': drone_id, 'telemetry': telemetry}, room='frontend_clients')
    else:
        print(f"Invalid telemetry update from {request.sid}: {data}")

@socketio.on('media_captured')
def handle_media_captured(data):
    """
    Receives notification from gateway that media was captured.
    data should contain {'drone_id': 'DRN-001', 'media_url': '...', 'type': 'image/video', 'title': '...'}
    """
    drone_id = data.get('drone_id')
    media_url = data.get('media_url')
    media_type = data.get('type')
    title = data.get('title')
    if drone_id and media_url and media_type and title:
        print(f"Media captured by {drone_id}: {title} ({media_type}) at {media_url}")
        add_notification(f"New {media_type} captured by Drone {drone_id}: {title}", 'info')
        # In a real app, you'd save this media metadata to your database
        # and potentially trigger a frontend update for the media library.
        socketio.emit('new_media_available', data, room='frontend_clients')
    else:
        print(f"Invalid media captured data from {request.sid}: {data}")


# --- REST API Endpoints (for Frontend to send commands, or for other data) ---

@app.route('/api/command_drone/<drone_id>', methods=['POST'])
def command_drone(drone_id):
    """
    REST endpoint for frontend to send commands to a specific drone.
    The command will be forwarded to the registered drone gateway via WebSocket.
    Request JSON: {'command': 'takeoff', 'params': {'altitude': 10}}
    """
    command_data = request.json
    if not command_data or 'command' not in command_data:
        return jsonify({"error": "Invalid command data"}), 400

    # Find the SID of the gateway connected for this drone_id
    gateway_sid = None
    for d_id, sid in drone_telemetry_data.items(): # Iterate through stored SIDs
        if d_id == drone_id:
            gateway_sid = sid
            break

    if gateway_sid:
        # Emit the command to the specific gateway app
        socketio.emit('drone_command', command_data, room=gateway_sid)
        print(f"Command '{command_data['command']}' sent to drone {drone_id} (via gateway {gateway_sid})")
        add_notification(f"Command '{command_data['command']}' sent to Drone {drone_id}.", 'info')
        return jsonify({"status": "Command sent", "drone_id": drone_id, "command": command_data['command']}), 200
    else:
        print(f"No active gateway found for drone {drone_id}")
        add_notification(f"Failed to send command to Drone {drone_id}: Gateway offline.", 'alert')
        return jsonify({"error": f"No active gateway found for drone {drone_id}"}), 404

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Returns all stored notifications."""
    return jsonify(notifications), 200

@app.route('/api/notifications/mark_read/<int:notif_id>', methods=['POST'])
def mark_notification_read(notif_id):
    """Marks a specific notification as read."""
    for notif in notifications:
        if notif['id'] == notif_id:
            notif['read'] = True
            # Optionally, emit update to frontends
            socketio.emit('notification_updated', notif, room='frontend_clients')
            return jsonify({"status": "Notification marked as read"}), 200
    return jsonify({"error": "Notification not found"}), 404

@app.route('/api/notifications/delete/<int:notif_id>', methods=['DELETE'])
def delete_notification_api(notif_id):
    """Deletes a specific notification."""
    global notifications
    initial_len = len(notifications)
    notifications = [n for n in notifications if n['id'] != notif_id]
    if len(notifications) < initial_len:
        # Optionally, emit update to frontends
        socketio.emit('notification_deleted', {'id': notif_id}, room='frontend_clients')
        return jsonify({"status": "Notification deleted"}), 200
    return jsonify({"error": "Notification not found"}), 404


# --- Example REST endpoint for frontend to get drone status (can be expanded) ---
@app.route('/api/drone_status/<drone_id>', methods=['GET'])
def get_drone_status(drone_id):
    """Returns the latest telemetry data for a specific drone."""
    telemetry = drone_telemetry_data.get(drone_id)
    if telemetry:
        return jsonify({"drone_id": drone_id, "telemetry": telemetry}), 200
    return jsonify({"error": "Drone not found or offline"}), 404

@app.route('/api/connected_drones', methods=['GET'])
def get_connected_drones():
    """Returns a list of currently connected drone IDs via gateways."""
    return jsonify(list(drone_telemetry_data.keys())), 200


if __name__ == '__main__':
    # Run the Flask app with SocketIO
    # For production, use a WSGI server like Gunicorn with eventlet/gevent
    # Example: gunicorn --worker-class eventlet -w 1 app:app -b 0.0.0.0:5000
    print("Starting Flask-SocketIO server...")
    socketio.run(app, debug=True, port=5000, host='0.0.0.0')

