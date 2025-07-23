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
CORS(app)

# --- Flask-SQLAlchemy Configuration ---
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://your_username:your_password@localhost:5432/your_database_name')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Flask-Migrate Initialization ---
migrate = Migrate(app, db) # ADD THIS LINE: Initialize Flask-Migrate

# --- Flask-SocketIO Configuration ---
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_super_secret_key_here')
socketio = SocketIO(app, cors_allowed_origins="*")

# --- SQLAlchemy Database Models ---
class Drone(db.Model):
    __tablename__ = 'drones'
    id = Column(String, primary_key=True)
    name = Column(String(100), nullable=False)
    status = Column(String(50))
    battery = Column(Integer)
    location = Column(String(100))
    last_flight = Column(DateTime)
    flight_hours = Column(Float)
    last_telemetry = Column(JSONB)
    last_updated = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'battery': self.battery,
            'location': self.location,
            'last_flight': self.last_flight.isoformat() if self.last_flight else None,
            'flight_hours': self.flight_hours,
            'last_telemetry': self.last_telemetry,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True)
    message = Column(Text, nullable=False)
    type = Column(String(50))
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
    drone_id = Column(String(50))
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
            'drone': self.drone_id,
            'startTime': self.start_time.isoformat() if self.start_time else None,
            'endTime': self.end_time.isoformat() if self.end_time else None,
            'progress': self.progress,
            'details': self.details,
            'waypoints': self.waypoints,
            'area': self.area,
            'payload': self.payload
        }

class Media(db.Model):
    __tablename__ = 'media'
    id = Column(Integer, primary_key=True)
    drone_id = Column(String(50), nullable=False)
    media_url = Column(String(500), nullable=False)
    type = Column(String(50))
    title = Column(String(255))
    description = Column(Text)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'droneId': self.drone_id,
            'src': self.media_url,
            'type': self.type,
            'title': self.title,
            'description': self.description,
            'date': self.timestamp.isoformat() if self.timestamp else None,
            'thumb': self.media_url
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
            'lastMaintenance': self.last_maintenance.isoformat() if self.last_maintenance else None,
            'nextMaintenance': self.next_maintenance.isoformat() if self.next_maintenance else None
        }

class Incident(db.Model):
    __tablename__ = 'incidents'
    id = Column(Integer, primary_key=True)
    type = Column(String(50))
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))
    resolved = Column(Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'message': self.message,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'resolved': self.resolved
        }

# --- In-memory cache for active gateway SIDs (not stored in DB) ---
drone_gateway_sids = {}

# --- Helper function for notifications (now uses SQLAlchemy) ---
def add_notification(message, type='info'):
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
            last_flight=datetime.fromisoformat(data['last_flight'].replace('Z', '+00:00')) if 'last_flight' in data else None,
            flight_hours=data.get('flight_hours', 0.0)
        )
        db.session.add(new_drone)
        db.session.commit()
        return jsonify(new_drone.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding drone: {e}")
        return jsonify({"error": "Failed to add drone"}), 500

@app.route('/api/missions', methods=['GET'])
def get_missions():
    try:
        missions = Mission.query.all()
        return jsonify([m.to_dict() for m in missions]), 200
    except Exception as e:
        print(f"Error fetching missions: {e}")
        return jsonify({"error": "Failed to fetch missions"}), 500

@app.route('/api/media', methods=['GET'])
def get_media():
    try:
        media_items = Media.query.order_by(Media.timestamp.desc()).all()
        return jsonify([m.to_dict() for m in media_items]), 200
    except Exception as e:
        print(f"Error fetching media: {e}")
        return jsonify({"error": "Failed to fetch media"}), 500

@app.route('/api/maintenance_parts', methods=['GET'])
def get_maintenance_parts():
    try:
        parts = MaintenancePart.query.all()
        return jsonify([p.to_dict() for p in parts]), 200
    except Exception as e:
        print(f"Error fetching maintenance parts: {e}")
        return jsonify({"error": "Failed to fetch maintenance parts"}), 500

@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    try:
        incidents = Incident.query.order_by(Incident.timestamp.desc()).all()
        return jsonify([i.to_dict() for i in incidents]), 200
    except Exception as e:
        print(f"Error fetching incidents: {e}")
        return jsonify({"error": "Failed to fetch incidents"}), 500

@app.route('/api/drone_status/<string:drone_id>', methods=['GET']) # Changed to string:drone_id
def get_drone_status(drone_id):
    try:
        drone_doc = Drone.query.get(drone_id)
        if drone_doc:
            return jsonify({"drone_id": drone_id, "telemetry": drone_doc.last_telemetry}), 200
        return jsonify({"error": "Drone not found or offline"}), 404
    except Exception as e:
        print(f"Error fetching drone status for {drone_id} from DB: {e}")
        return jsonify({"error": "Failed to fetch drone status"}), 500

@app.route('/api/connected_drones', methods=['GET'])
def get_connected_drones():
    return jsonify(list(drone_gateway_sids.keys())), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not Drone.query.first():
            print("Adding initial dummy data...")
            db.session.add(Drone(id='DRN-SIM-001', name='Simulated Drone 1', status='Offline', battery=0, location='Simulated', flight_hours=0, last_telemetry={}))
            db.session.add(Drone(id='DRN-002', name='SkyWatcher Elite', status='Offline', battery=0, location='Hangar 1', flight_hours=0, last_telemetry={}))
            db.session.add(Mission(id='m1', name='Site Survey - North Campus', status='Scheduled', drone_id='DRN-001', progress=0, details='Initial survey.', waypoints=10, area='50 acres', payload='RGB Camera', start_time=datetime.now(timezone.utc), end_time=datetime.now(timezone.utc)))
            db.session.add(Media(drone_id='DRN-SIM-001', media_url='https://placehold.co/600x400/3498db/ffffff?text=Simulated+Video', type='video', title='Initial Test Video', description='First simulated video.'))
            db.session.add(MaintenancePart(name='Propeller Set A', status='Available', last_maintenance=datetime.now(timezone.utc)))
            db.session.add(Incident(type='info', message='System startup.', timestamp=datetime.now(timezone.utc)))
            db.session.commit()
            print("Dummy data added.")

    print("Starting Flask-SocketIO server...")
    socketio.run(app, debug=True, port=5000, host='0.0.0.0')
