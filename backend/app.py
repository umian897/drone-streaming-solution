import os
import time
import threading
import random
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from dotenv import load_dotenv

# SQLAlchemy and Flask-SQLAlchemy Imports
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import JSONB

# Flask-Migrate Import
from flask_migrate import Migrate

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- Flask-CORS Configuration ---
# Allow requests from your React frontend (localhost:3000) and any other origins needed
# For production, replace "*" with specific origins like "http://localhost:3000, https://your-frontend-domain.com"
CORS(app, resources={r"/api/*": {"origins": "*"}}) # Apply CORS to /api routes
CORS(app) # Apply CORS to all other routes (including Socket.IO)

# --- Flask-SQLAlchemy Configuration ---
# DATABASE_URL should be set in your .env file
# Example: 'postgresql://usman:1234@localhost:5432/drone_project'
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://your_username:your_password@localhost:5432/your_database_name')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Disable tracking modifications for performance

db = SQLAlchemy(app)

# --- Flask-Migrate Initialization ---
migrate = Migrate(app, db)

# --- Flask-SocketIO Configuration ---
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_super_secret_key_here')
socketio = SocketIO(app, cors_allowed_origins="*") # Ensure SocketIO also allows CORS from all origins for development

# --- SQLAlchemy Database Models ---
class Drone(db.Model):
    __tablename__ = 'drones'
    id = Column(String, primary_key=True) # Drone ID (e.g., DRN-SIM-001)
    name = Column(String(100), nullable=False)
    status = Column(String(50))
    battery = Column(Integer)
    location = Column(String(100))
    last_flight = Column(DateTime)
    flight_hours = Column(Float)
    last_telemetry = Column(JSONB)
    last_updated = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    live_stream_url = Column(String(500)) # Added for live video stream URL

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'battery': self.battery,
            'location': self.location,
            'lastFlight': self.last_flight.isoformat() if self.last_flight else None, # camelCase
            'flightHours': self.flight_hours, # camelCase
            'lastTelemetry': self.last_telemetry, # camelCase
            'lastUpdated': self.last_updated.isoformat() if self.last_updated else None, # camelCase
            'liveStreamUrl': self.live_stream_url # camelCase
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True) # Auto-incrementing ID
    message = Column(Text, nullable=False)
    type = Column(String(50)) # 'info', 'alert', 'success'
    read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'type': self.type,
            'read': self.read,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class Mission(db.Model):
    __tablename__ = 'missions'
    id = Column(String, primary_key=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50))
    drone_id = Column(String(50)) # Foreign key to Drone.id
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    progress = Column(Integer)
    details = Column(Text)
    waypoints = Column(Integer)
    area = Column(String(100))
    payload = Column(String(255))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'drone': self.drone_id, # Frontend expects 'drone'
            'startTime': self.start_time.isoformat() if self.start_time else None, # camelCase
            'endTime': self.end_time.isoformat() if self.end_time else None,     # camelCase
            'progress': self.progress,
            'details': self.details,
            'waypoints': self.waypoints,
            'area': self.area,
            'payload': self.payload
        }

class Media(db.Model):
    __tablename__ = 'media'
    id = Column(Integer, primary_key=True)
    drone_id = Column(String(50), nullable=False) # Foreign key to Drone.id
    media_url = Column(String(500), nullable=False)
    type = Column(String(50)) # 'image', 'video'
    title = Column(String(255))
    description = Column(Text)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'droneId': self.drone_id, # camelCase
            'url': self.media_url, # Frontend expects 'url'
            'type': self.type,
            'title': self.title,
            'description': self.description,
            'date': self.timestamp.isoformat() if self.timestamp else None, # Frontend expects 'date'
            'thumbnail': self.media_url # Using full URL as thumbnail for simplicity
        }

class MaintenancePart(db.Model):
    __tablename__ = 'maintenance_parts'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50))
    last_maintenance = Column(DateTime)
    next_maintenance = Column(DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'lastMaintenance': self.last_maintenance.isoformat() if self.last_maintenance else None, # camelCase
            'nextMaintenance': self.next_maintenance.isoformat() if self.next_maintenance else None # camelCase
        }

class Incident(db.Model):
    __tablename__ = 'incidents'
    id = Column(Integer, primary_key=True)
    type = Column(String(50)) # 'alert', 'warning', 'info'
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))
    resolved = Column(Boolean, default=False)
    # New fields from frontend
    when = Column(DateTime)
    place = Column(String(255))
    drone = Column(String(50)) # Drone ID
    reason = Column(String(255))
    region = Column(String(100))
    issue = Column(String(255))

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'message': self.message,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'resolved': self.resolved,
            'when': self.when.isoformat() if self.when else None,
            'place': self.place,
            'drone': self.drone,
            'reason': self.reason,
            'region': self.region,
            'issue': self.issue
        }

class UserProfile(db.Model): # New Model for User Profile
    __tablename__ = 'user_profiles'
    id = Column(Integer, primary_key=True)
    firebase_uid = Column(String(128), unique=True, nullable=False) # Link to Firebase Auth UID
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    profile_picture_url = Column(String(500))
    total_flights = Column(Integer, default=0)
    total_flight_time_hours = Column(Float, default=0.0)
    average_flight_time_hours = Column(Float, default=0.0)
    # Add other user-specific fields as needed

    def to_dict(self):
        return {
            'id': self.id,
            'firebaseUid': self.firebase_uid,
            'name': self.name,
            'email': self.email,
            'profilePicture': self.profile_picture_url,
            'totalFlights': self.total_flights,
            'totalFlightTime': f"{int(self.total_flight_time_hours)}h {int((self.total_flight_time_hours * 60) % 60)}m",
            'averageFlightTime': f"{int(self.average_flight_time_hours)}h {int((self.average_flight_time_hours * 60) % 60)}m",
        }


# --- In-memory cache for active gateway SIDs (not stored in DB) ---
drone_gateway_sids = {}

# --- Helper function for notifications (now uses SQLAlchemy) ---
def add_notification(message, type='info'):
    """Adds a new notification to the database and emits it to connected frontends."""
    try:
        new_notification = Notification(
            message=message,
            type=type,
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(new_notification)
        db.session.commit()
        notif_dict = new_notification.to_dict()
        print(f"Notification added to DB: {message} with ID {notif_dict['id']}")
        socketio.emit('new_notification', notif_dict, room='frontend_clients')
    except Exception as e:
        db.session.rollback()
        print(f"Error adding notification to database: {e}")

# --- WebSocket Event Handlers ---
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    for drone_id, sid in list(drone_gateway_sids.items()):
        if sid == request.sid:
            del drone_gateway_sids[drone_id]
            print(f"Gateway for drone {drone_id} disconnected.")
            add_notification(f"Drone {drone_id} gateway disconnected.", 'alert')
            break
    leave_room(request.sid, 'frontend_clients')

@socketio.on('register_as_gateway')
def register_gateway(data):
    drone_id = data.get('drone_id')
    if drone_id:
        drone_gateway_sids[drone_id] = request.sid
        join_room(drone_id)
        print(f"Gateway for drone {drone_id} registered with SID: {request.sid}")
        add_notification(f"Drone {drone_id} gateway connected.", 'info')
        # Optional: Update drone status to 'Online' in DB here
        with app.app_context():
            drone = Drone.query.get(drone_id)
            if drone:
                drone.status = 'Online'
                db.session.commit()
                socketio.emit('drone_status_change', {'drone_id': drone_id, 'status': 'Online'}) # Emit status change
    else:
        print(f"Invalid registration from {request.sid}: missing drone_id")

@socketio.on('register_as_frontend')
def register_frontend():
    join_room('frontend_clients')
    print(f"Frontend client registered with SID: {request.sid}")
    try:
        notifications = Notification.query.order_by(Notification.timestamp.desc()).limit(50).all()
        initial_notifications = [n.to_dict() for n in notifications]
        emit('initial_notifications', initial_notifications)
    except Exception as e:
        print(f"Error fetching initial notifications from DB: {e}")

@socketio.on('telemetry_update')
def handle_telemetry_update(data):
    drone_id = data.get('drone_id')
    telemetry = data.get('telemetry')
    if drone_id and telemetry:
        try:
            drone = Drone.query.get(drone_id)
            if drone:
                drone.last_telemetry = telemetry
                drone.last_updated = datetime.now(timezone.utc)
                db.session.commit()
                print(f"Received and updated telemetry for {drone_id} in DB: {telemetry}")
                socketio.emit('drone_telemetry_update', {'drone_id': drone_id, 'telemetry': telemetry}, room='frontend_clients')
            else:
                print(f"Drone {drone_id} not found in database. Telemetry not stored.")
                # Optionally, create the drone entry if it doesn't exist
                # new_drone = Drone(id=drone_id, name=f"Drone {drone_id}", last_telemetry=telemetry, status='Online')
                # db.session.add(new_drone)
                # db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error updating telemetry in DB: {e}")
    else:
        print(f"Invalid telemetry update from {request.sid}: {data}")

@socketio.on('media_captured')
def handle_media_captured(data):
    drone_id = data.get('drone_id')
    media_url = data.get('media_url')
    media_type = data.get('type')
    title = data.get('title')
    description = data.get('description', '')
    if drone_id and media_url and media_type and title:
        print(f"Media captured by {drone_id}: {title} ({media_type}) at {media_url}")
        add_notification(f"New {media_type} captured by Drone {drone_id}: {title}", 'info')
        try:
            new_media = Media(
                drone_id=drone_id,
                media_url=media_url,
                type=media_type,
                title=title,
                description=description,
                timestamp=datetime.now(timezone.utc)
            )
            db.session.add(new_media)
            db.session.commit()
            socketio.emit('new_media_available', new_media.to_dict(), room='frontend_clients')
            print("Media metadata saved to database.")
        except Exception as e:
            db.session.rollback()
            print(f"Error saving media metadata to database: {e}")
    else:
        print(f"Invalid media captured data from {request.sid}: {data}")

@socketio.on('video_stream_ready') # New event to handle stream URL from gateway
def handle_video_stream_ready(data):
    drone_id = data.get('drone_id')
    stream_url = data.get('stream_url')
    if drone_id and stream_url:
        print(f"Received video stream URL for {drone_id}: {stream_url}")
        with app.app_context():
            drone = Drone.query.get(drone_id)
            if drone:
                drone.live_stream_url = stream_url
                db.session.commit()
                print(f"Drone {drone_id} live_stream_url updated in DB.")
                socketio.emit('drone_stream_available', {'drone_id': drone_id, 'stream_url': stream_url}, room='frontend_clients')
            else:
                print(f"Drone {drone_id} not found in DB to update stream URL.")
    else:
        print(f"Invalid video_stream_ready data: {data}")

# --- REST API Endpoints ---
@app.route('/api/command_drone/<drone_id>', methods=['POST'])
def command_drone(drone_id):
    command_data = request.json
    if not command_data or 'command' not in command_data:
        return jsonify({"error": "Invalid command data"}), 400

    gateway_sid = drone_gateway_sids.get(drone_id)

    if gateway_sid:
        socketio.emit('drone_command', command_data, room=gateway_sid)
        print(f"Command '{command_data['command']}' sent to drone {drone_id} (via gateway {gateway_sid})")
        add_notification(f"Command '{command_data['command']}' sent to Drone {drone_id}.", 'info')
        return jsonify({"status": "Command sent", "drone_id": drone_id, "command": command_data['command']}), 200
    else:
        print(f"No active gateway found for drone {drone_id}")
        add_notification(f"Failed to send command to Drone {drone_id}: Gateway offline.", 'alert')
        return jsonify({"error": f"No active gateway found for drone {drone_id}"}), 404

@app.route('/api/notifications', methods=['GET'])
def get_notifications_api():
    try:
        notifications = Notification.query.order_by(Notification.timestamp.desc()).all()
        return jsonify([n.to_dict() for n in notifications]), 200
    except Exception as e:
        print(f"Error fetching notifications from DB: {e}")
        return jsonify({"error": "Failed to fetch notifications"}), 500

@app.route('/api/notifications/mark_read/<int:notif_id>', methods=['POST'])
def mark_notification_read(notif_id):
    try:
        notif = Notification.query.get(notif_id)
        if notif:
            notif.read = True
            db.session.commit()
            socketio.emit('notification_updated', notif.to_dict(), room='frontend_clients')
            return jsonify({"status": "Notification marked as read"}), 200
        return jsonify({"error": "Notification not found"}), 404
    except Exception as e:
        db.session.rollback()
        print(f"Error marking notification {notif_id} as read: {e}")
        return jsonify({"error": "Failed to mark notification as read"}), 500

@app.route('/api/notifications/delete/<int:notif_id>', methods=['DELETE'])
def delete_notification_api(notif_id):
    try:
        notif = Notification.query.get(notif_id)
        if notif:
            db.session.delete(notif)
            db.session.commit()
            socketio.emit('notification_deleted', {'id': notif_id}, room='frontend_clients')
            return jsonify({"status": "Notification deleted"}), 200
        return jsonify({"error": "Notification not found"}), 404
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting notification {notif_id}: {e}")
        return jsonify({"error": "Failed to delete notification"}), 500

@app.route('/api/drones', methods=['GET'])
def get_drones():
    try:
        drones = Drone.query.all()
        return jsonify([d.to_dict() for d in drones]), 200
    except Exception as e:
        print(f"Error fetching drones: {e}")
        return jsonify({"error": "Failed to fetch drones"}), 500

@app.route('/api/drones', methods=['POST'])
def add_drone():
    data = request.json
    if not data or 'id' not in data or 'name' not in data:
        return jsonify({"error": "Missing drone ID or Name"}), 400
    try:
        new_drone = Drone(
            id=data['id'],
            name=data['name'],
            status=data.get('status', 'Offline'),
            battery=data.get('battery', 0),
            location=data.get('location', 'Unknown'),
            # Ensure last_flight is parsed correctly if it's a string from frontend
            last_flight=datetime.fromisoformat(data['last_flight'].replace('Z', '+00:00')) if data.get('last_flight') else None,
            flight_hours=data.get('flight_hours', 0.0)
        )
        db.session.add(new_drone)
        db.session.commit()
        return jsonify(new_drone.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding drone: {e}")
        return jsonify({"error": "Failed to add drone", "details": str(e)}), 500

@app.route('/api/drones/<string:drone_id>', methods=['PUT']) # New PUT endpoint for drones
def update_drone(drone_id):
    data = request.json
    try:
        drone = Drone.query.get(drone_id)
        if not drone:
            return jsonify({"error": "Drone not found"}), 404

        # Update fields if provided in request data
        drone.name = data.get('name', drone.name)
        drone.status = data.get('status', drone.status)
        drone.battery = data.get('battery', drone.battery)
        drone.location = data.get('location', drone.location)
        if 'last_flight' in data:
            drone.last_flight = datetime.fromisoformat(data['last_flight'].replace('Z', '+00:00')) if data['last_flight'] else None
        drone.flight_hours = data.get('flight_hours', drone.flight_hours)
        drone.last_telemetry = data.get('last_telemetry', drone.last_telemetry) # For telemetry updates
        drone.live_stream_url = data.get('live_stream_url', drone.live_stream_url) # For stream URL updates
        drone.last_updated = datetime.now(timezone.utc) # Update timestamp

        db.session.commit()
        return jsonify(drone.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating drone {drone_id}: {e}")
        return jsonify({"error": "Failed to update drone", "details": str(e)}), 500

@app.route('/api/drones/<string:drone_id>', methods=['DELETE']) # New DELETE endpoint for drones
def delete_drone(drone_id):
    try:
        drone = Drone.query.get(drone_id)
        if not drone:
            return jsonify({"error": "Drone not found"}), 404
        db.session.delete(drone)
        db.session.commit()
        return jsonify({"status": "Drone deleted"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting drone {drone_id}: {e}")
        return jsonify({"error": "Failed to delete drone", "details": str(e)}), 500


@app.route('/api/missions', methods=['GET'])
def get_missions():
    try:
        missions = Mission.query.all()
        return jsonify([m.to_dict() for m in missions]), 200
    except Exception as e:
        print(f"Error fetching missions: {e}")
        return jsonify({"error": "Failed to fetch missions"}), 500

@app.route('/api/missions', methods=['POST'])
def add_mission(): # Renamed from get_missions to add_mission for clarity
    data = request.json
    if not data or 'name' not in data or 'drone_id' not in data:
        return jsonify({"error": "Missing mission name or drone ID"}), 400
    try:
        new_mission = Mission(
            id=data.get('id', str(random.randint(100000, 999999))), # Generate ID if not provided
            name=data['name'],
            status=data.get('status', 'Scheduled'),
            drone_id=data['drone_id'],
            start_time=datetime.fromisoformat(data['start_time'].replace('Z', '+00:00')) if data.get('start_time') else None,
            end_time=datetime.fromisoformat(data['end_time'].replace('Z', '+00:00')) if data.get('end_time') else None,
            progress=data.get('progress', 0),
            details=data.get('details', ''),
            waypoints=data.get('waypoints', 0),
            area=data.get('area', ''),
            payload=data.get('payload', '')
        )
        db.session.add(new_mission)
        db.session.commit()
        return jsonify(new_mission.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding mission: {e}")
        return jsonify({"error": "Failed to add mission", "details": str(e)}), 500

@app.route('/api/missions/<string:mission_id>', methods=['PUT']) # New PUT endpoint for missions
def update_mission(mission_id):
    data = request.json
    try:
        mission = Mission.query.get(mission_id)
        if not mission:
            return jsonify({"error": "Mission not found"}), 404

        mission.name = data.get('name', mission.name)
        mission.status = data.get('status', mission.status)
        mission.drone_id = data.get('drone_id', mission.drone_id)
        if 'start_time' in data:
            mission.start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00')) if data['start_time'] else None
        if 'end_time' in data:
            mission.end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00')) if data['end_time'] else None
        mission.progress = data.get('progress', mission.progress)
        mission.details = data.get('details', mission.details)
        mission.waypoints = data.get('waypoints', mission.waypoints)
        mission.area = data.get('area', mission.area)
        mission.payload = data.get('payload', mission.payload)

        db.session.commit()
        return jsonify(mission.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating mission {mission_id}: {e}")
        return jsonify({"error": "Failed to update mission", "details": str(e)}), 500

@app.route('/api/missions/<string:mission_id>', methods=['DELETE']) # New DELETE endpoint for missions
def delete_mission(mission_id):
    try:
        mission = Mission.query.get(mission_id)
        if not mission:
            return jsonify({"error": "Mission not found"}), 404
        db.session.delete(mission)
        db.session.commit()
        return jsonify({"status": "Mission deleted"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting mission {mission_id}: {e}")
        return jsonify({"error": "Failed to delete mission", "details": str(e)}), 500


@app.route('/api/media', methods=['GET'])
def get_media():
    try:
        media_items = Media.query.order_by(Media.timestamp.desc()).all()
        return jsonify([m.to_dict() for m in media_items]), 200
    except Exception as e:
        print(f"Error fetching media: {e}")
        return jsonify({"error": "Failed to fetch media"}), 500

@app.route('/api/media', methods=['POST'])
def add_media(): # Renamed from get_media to add_media for clarity
    data = request.json
    if not data or 'drone_id' not in data or 'media_url' not in data:
        return jsonify({"error": "Missing drone ID or media URL"}), 400
    try:
        new_media = Media(
            drone_id=data['drone_id'],
            media_url=data['media_url'],
            type=data.get('type', 'image'),
            title=data.get('title', 'Untitled Media'),
            description=data.get('description', ''),
            timestamp=datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')) if data.get('timestamp') else datetime.now(timezone.utc)
        )
        db.session.add(new_media)
        db.session.commit()
        return jsonify(new_media.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding media: {e}")
        return jsonify({"error": "Failed to add media", "details": str(e)}), 500

@app.route('/api/media/<int:media_id>', methods=['PUT']) # New PUT endpoint for media
def update_media(media_id):
    data = request.json
    try:
        media = Media.query.get(media_id)
        if not media:
            return jsonify({"error": "Media not found"}), 404

        media.drone_id = data.get('drone_id', media.drone_id)
        media.media_url = data.get('media_url', media.media_url)
        media.type = data.get('type', media.type)
        media.title = data.get('title', media.title)
        media.description = data.get('description', media.description)
        if 'timestamp' in data:
            media.timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')) if data['timestamp'] else None

        db.session.commit()
        return jsonify(media.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating media {media_id}: {e}")
        return jsonify({"error": "Failed to update media", "details": str(e)}), 500

@app.route('/api/media/<int:media_id>', methods=['DELETE']) # New DELETE endpoint for media
def delete_media(media_id):
    try:
        media = Media.query.get(media_id)
        if not media:
            return jsonify({"error": "Media not found"}), 404
        db.session.delete(media)
        db.session.commit()
        return jsonify({"status": "Media deleted"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting media {media_id}: {e}")
        return jsonify({"error": "Failed to delete media", "details": str(e)}), 500


@app.route('/api/maintenance_parts', methods=['GET'])
def get_maintenance_parts():
    try:
        parts = MaintenancePart.query.all()
        return jsonify([p.to_dict() for p in parts]), 200
    except Exception as e:
        print(f"Error fetching maintenance parts: {e}")
        return jsonify({"error": "Failed to fetch maintenance parts"}), 500

@app.route('/api/maintenance_parts', methods=['POST'])
def add_maintenance_part(): # Renamed for clarity
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Missing part name"}), 400
    try:
        new_part = MaintenancePart(
            name=data['name'],
            status=data.get('status', 'Available'),
            last_maintenance=datetime.fromisoformat(data['last_maintenance'].replace('Z', '+00:00')) if data.get('last_maintenance') else None,
            next_maintenance=datetime.fromisoformat(data['next_maintenance'].replace('Z', '+00:00')) if data.get('next_maintenance') else None
        )
        db.session.add(new_part)
        db.session.commit()
        return jsonify(new_part.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding maintenance part: {e}")
        return jsonify({"error": "Failed to add maintenance part", "details": str(e)}), 500

@app.route('/api/maintenance_parts/<int:part_id>', methods=['PUT']) # New PUT endpoint
def update_maintenance_part(part_id):
    data = request.json
    try:
        part = MaintenancePart.query.get(part_id)
        if not part:
            return jsonify({"error": "Maintenance part not found"}), 404

        part.name = data.get('name', part.name)
        part.status = data.get('status', part.status)
        if 'last_maintenance' in data:
            part.last_maintenance = datetime.fromisoformat(data['last_maintenance'].replace('Z', '+00:00')) if data['last_maintenance'] else None
        if 'next_maintenance' in data:
            part.next_maintenance = datetime.fromisoformat(data['next_maintenance'].replace('Z', '+00:00')) if data['next_maintenance'] else None

        db.session.commit()
        return jsonify(part.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating maintenance part {part_id}: {e}")
        return jsonify({"error": "Failed to update maintenance part", "details": str(e)}), 500

@app.route('/api/maintenance_parts/<int:part_id>', methods=['DELETE']) # New DELETE endpoint
def delete_maintenance_part(part_id):
    try:
        part = MaintenancePart.query.get(part_id)
        if not part:
            return jsonify({"error": "Maintenance part not found"}), 404
        db.session.delete(part)
        db.session.commit()
        return jsonify({"status": "Maintenance part deleted"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting maintenance part {part_id}: {e}")
        return jsonify({"error": "Failed to delete maintenance part", "details": str(e)}), 500


@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    try:
        incidents = Incident.query.order_by(Incident.timestamp.desc()).all()
        return jsonify([i.to_dict() for i in incidents]), 200
    except Exception as e:
        print(f"Error fetching incidents: {e}")
        return jsonify({"error": "Failed to fetch incidents"}), 500

@app.route('/api/incidents', methods=['POST'])
def add_incident(): # Renamed for clarity
    data = request.json
    if not data or 'message' not in data:
        return jsonify({"error": "Missing incident message"}), 400
    try:
        new_incident = Incident(
            type=data.get('type', 'info'),
            message=data['message'],
            timestamp=datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')) if data.get('timestamp') else datetime.now(timezone.utc),
            resolved=data.get('resolved', False),
            when=datetime.fromisoformat(data['when'].replace('Z', '+00:00')) if data.get('when') else None,
            place=data.get('place', ''),
            drone=data.get('drone', ''),
            reason=data.get('reason', ''),
            region=data.get('region', ''),
            issue=data.get('issue', '')
        )
        db.session.add(new_incident)
        db.session.commit()
        return jsonify(new_incident.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding incident: {e}")
        return jsonify({"error": "Failed to add incident", "details": str(e)}), 500

@app.route('/api/incidents/<int:incident_id>', methods=['PUT']) # New PUT endpoint
def update_incident(incident_id):
    data = request.json
    try:
        incident = Incident.query.get(incident_id)
        if not incident:
            return jsonify({"error": "Incident not found"}), 404

        incident.type = data.get('type', incident.type)
        incident.message = data.get('message', incident.message)
        if 'timestamp' in data:
            incident.timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')) if data['timestamp'] else None
        incident.resolved = data.get('resolved', incident.resolved)
        if 'when' in data:
            incident.when = datetime.fromisoformat(data['when'].replace('Z', '+00:00')) if data['when'] else None
        incident.place = data.get('place', incident.place)
        incident.drone = data.get('drone', incident.drone)
        incident.reason = data.get('reason', incident.reason)
        incident.region = data.get('region', incident.region)
        incident.issue = data.get('issue', incident.issue)

        db.session.commit()
        return jsonify(incident.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating incident {incident_id}: {e}")
        return jsonify({"error": "Failed to update incident", "details": str(e)}), 500

@app.route('/api/incidents/<int:incident_id>', methods=['DELETE']) # New DELETE endpoint
def delete_incident(incident_id):
    try:
        incident = Incident.query.get(incident_id)
        if not incident:
            return jsonify({"error": "Incident not found"}), 404
        db.session.delete(incident)
        db.session.commit()
        return jsonify({"status": "Incident deleted"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting incident {incident_id}: {e}")
        return jsonify({"error": "Failed to delete incident", "details": str(e)}), 500

# --- User Profile Endpoints ---
# These are conceptual. You'd link them to Firebase Auth UIDs in a real app.
@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    # In a real app, you'd get user_id from auth token
    # For now, return a dummy or first user profile
    try:
        user_profile = UserProfile.query.first() # Get the first user for simplicity
        if user_profile:
            return jsonify(user_profile.to_dict()), 200
        return jsonify({"error": "User profile not found"}), 404
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return jsonify({"error": "Failed to fetch user profile", "details": str(e)}), 500

@app.route('/api/user/profile', methods=['PUT'])
def update_user_profile():
    data = request.json
    try:
        user_profile = UserProfile.query.first() # Get the first user for simplicity
        if not user_profile:
            # If no user profile exists, create one (e.g., linked to a dummy UID)
            user_profile = UserProfile(
                firebase_uid="dummy_firebase_uid_123", # Replace with actual UID from auth
                name=data.get('name', 'New User'),
                email=data.get('email', 'new@example.com')
            )
            db.session.add(user_profile)
        
        user_profile.name = data.get('name', user_profile.name)
        user_profile.email = data.get('email', user_profile.email)
        user_profile.profile_picture_url = data.get('profile_picture_url', user_profile.profile_picture_url)
        # Update flight stats if sent from frontend (e.g., from missions completion)
        user_profile.total_flights = data.get('total_flights', user_profile.total_flights)
        user_profile.total_flight_time_hours = data.get('total_flight_time_hours', user_profile.total_flight_time_hours)
        user_profile.average_flight_time_hours = data.get('average_flight_time_hours', user_profile.average_flight_time_hours)

        db.session.commit()
        return jsonify(user_profile.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating user profile: {e}")
        return jsonify({"error": "Failed to update user profile", "details": str(e)}), 500

@app.route('/api/user/change_password', methods=['POST'])
def change_password():
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    # In a real app, you'd verify current_password against hashed password in DB
    # and then hash and save the new_password.
    # For this example, we just simulate success.
    if current_password and new_password and new_password != current_password:
        return jsonify({"status": "Password changed successfully (simulated)"}), 200
    return jsonify({"error": "Failed to change password (simulated)"}), 400

@app.route('/api/user/profile_picture', methods=['POST'])
def update_profile_picture():
    data = request.json
    profile_picture_url = data.get('profile_picture_url')
    if not profile_picture_url:
        return jsonify({"error": "Missing profile picture URL"}), 400
    try:
        user_profile = UserProfile.query.first()
        if not user_profile:
            # Create a dummy profile if none exists
            user_profile = UserProfile(firebase_uid="dummy_firebase_uid_123", name="New User", email="new@example.com")
            db.session.add(user_profile)
            db.session.commit() # Commit to get an ID if new
        
        user_profile.profile_picture_url = profile_picture_url
        db.session.commit()
        return jsonify(user_profile.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating profile picture: {e}")
        return jsonify({"error": "Failed to update profile picture", "details": str(e)}), 500


@app.route('/api/drone_status/<string:drone_id>', methods=['GET'])
def get_drone_status(drone_id):
    try:
        drone_doc = Drone.query.get(drone_id)
        if drone_doc:
            return jsonify({"drone_id": drone_id, "telemetry": drone_doc.last_telemetry, "liveStreamUrl": drone_doc.live_stream_url}), 200
        return jsonify({"error": "Drone not found or offline"}), 404
    except Exception as e:
        print(f"Error fetching drone status for {drone_id} from DB: {e}")
        return jsonify({"error": "Failed to fetch drone status", "details": str(e)}), 500

@app.route('/api/connected_drones', methods=['GET'])
def get_connected_drones():
    return jsonify(list(drone_gateway_sids.keys())), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Add a default user profile if none exists
        if not UserProfile.query.first():
            print("Adding initial dummy user profile...")
            db.session.add(UserProfile(
                firebase_uid="initial_user_uid", # Placeholder UID
                name="M Osman",
                email="m.osman@example.com",
                profile_picture_url="https://placehold.co/150x150/a78bfa/ffffff?text=Profile",
                total_flights=150,
                total_flight_time_hours=250.5,
                average_flight_time_hours=1.67
            ))
            db.session.commit()
            print("Dummy user profile added.")

        # Add initial dummy data for other models if tables are empty
        if not Drone.query.first():
            print("Adding initial dummy data for drones, missions, media, etc...")
            db.session.add(Drone(id='DRN-SIM-001', name='Simulated Drone 1', status='Offline', battery=0, location='Simulated', flight_hours=0, last_telemetry={}, live_stream_url='http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'))
            db.session.add(Drone(id='DRN-002', name='SkyWatcher Elite', status='Offline', battery=0, location='Hangar 1', flight_hours=0, last_telemetry={}))
            db.session.add(Mission(id='m1', name='Site Survey - North Campus', status='Scheduled', drone_id='DRN-001', progress=0, details='Initial survey.', waypoints=10, area='50 acres', payload='RGB Camera', start_time=datetime.now(timezone.utc), end_time=datetime.now(timezone.utc)))
            db.session.add(Media(drone_id='DRN-SIM-001', media_url='https://placehold.co/600x400/3498db/ffffff?text=Simulated+Video', type='video', title='Initial Test Video', description='First simulated video.', timestamp=datetime.now(timezone.utc)))
            db.session.add(MaintenancePart(name='Propeller Set A', status='Available', last_maintenance=datetime.now(timezone.utc)))
            db.session.add(Incident(type='info', message='System startup.', timestamp=datetime.now(timezone.utc), when=datetime.now(timezone.utc), place='HQ', drone='N/A', reason='System Init', region='Global', issue='Startup'))
            db.session.commit()
            print("Dummy data added.")

    print("Starting Flask-SocketIO server...")
    socketio.run(app, debug=True, port=5000, host='0.0.0.0')
