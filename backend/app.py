import uuid
import datetime
import random
import time
import threading
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON
import os
import subprocess
import shutil
import atexit

# --- App Initialization ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
# socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')
socketio = SocketIO(app, cors_allowed_origins="*")

# --- Database Configuration ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'dronedata.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- In-Memory State for Live Data (Not stored in DB) ---
# Initialize with d1 to ensure it's available on startup
connected_drones = ["d1"]
live_telemetry = {
    "d1": {"altitude": 50, "speed": 10, "battery_percent": 85, "latitude": 23.5859, "longitude": 58.4059, "status": "flying"},
    "d2": {"altitude": 0, "speed": 0, "battery_percent": 90, "latitude": 24.0000, "longitude": 57.0000, "status": "landed"},
    "d3": {"altitude": 0, "speed": 0, "battery_percent": 70, "latitude": 23.0000, "longitude": 56.0000, "status": "maintenance"},
}

# --- Live Streaming Configuration ---
HLS_ROOT = os.path.join(basedir, 'hls_streams')
if not os.path.exists(HLS_ROOT):
    os.makedirs(HLS_ROOT)

# Dictionary to hold active FFmpeg subprocesses
active_ffmpeg_processes = {}
# Path to the FFmpeg executable
FFMPEG_PATH = shutil.which('ffmpeg') or '/usr/bin/ffmpeg'

# The base URL for the RTMP stream coming from the Nginx server.
# This assumes Nginx is running on the same machine.
RTMP_SERVER_URL = "rtmp://localhost/live"

# --- DATABASE MODELS ---
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120), unique=True)
    profilePicture = db.Column(db.String(255))
    totalFlights = db.Column(db.Integer, default=0)
    totalFlightTime = db.Column(db.String(20))
    averageFlightTime = db.Column(db.String(20))
    role = db.Column(db.String(20), nullable=False, default='user')
    def to_dict(self):
        return {
            "id": self.id, "username": self.username, "name": self.name, "email": self.email,
            "profilePicture": self.profilePicture, "totalFlights": self.totalFlights,
            "totalFlightTime": self.totalFlightTime, "averageFlightTime": self.averageFlightTime,
            "role": self.role
        }

class Drone(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    model = db.Column(db.String(80))
    manufacturer = db.Column(db.String(80))
    uniqueld = db.Column(db.String(80), unique=True)
    status = db.Column(db.String(50))
    lastLocation = db.Column(db.String(120))
    flightHours = db.Column(db.Float)
    payloadCapacity = db.Column(db.Float)
    imageUrl = db.Column(db.String(255))
    type = db.Column(db.String(50), default="Drone")
    maintenanceHistory = db.Column(JSON)
    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "model": self.model, "manufacturer": self.manufacturer,
            "uniqueld": self.uniqueld, "status": self.status, "lastLocation": self.lastLocation,
            "flightHours": self.flightHours, "payloadCapacity": self.payloadCapacity,
            "imageUrl": self.imageUrl, "type": self.type, "maintenanceHistory": self.maintenanceHistory
        }

class GroundStation(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120))
    model = db.Column(db.String(80))
    manufacturer = db.Column(db.String(80))
    uniqueld = db.Column(db.String(80), unique=True)
    status = db.Column(db.String(50))
    coverageArea = db.Column(db.String(100))
    powerSource = db.Column(db.String(100))
    imageUrl = db.Column(db.String(255))
    type = db.Column(db.String(50), default="Ground Station")
    maintenanceHistory = db.Column(JSON)
    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "model": self.model, "manufacturer": self.manufacturer,
            "uniqueld": self.uniqueld, "status": self.status, "coverageArea": self.coverageArea,
            "powerSource": self.powerSource, "imageUrl": self.imageUrl, "type": self.type,
            "maintenanceHistory": self.maintenanceHistory
        }

class Equipment(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120))
    model = db.Column(db.String(80))
    manufacturer = db.Column(db.String(80))
    uniqueld = db.Column(db.String(80), unique=True)
    status = db.Column(db.String(50))
    equipmentType = db.Column(db.String(100))
    compatibility = db.Column(db.String(255))
    imageUrl = db.Column(db.String(255))
    type = db.Column(db.String(50), default="Equipment")
    maintenanceHistory = db.Column(JSON)
    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "model": self.model, "manufacturer": self.manufacturer,
            "uniqueld": self.uniqueld, "status": self.status, "equipmentType": self.equipmentType,
            "compatibility": self.compatibility, "imageUrl": self.imageUrl, "type": self.type,
            "maintenanceHistory": self.maintenanceHistory
        }

class Battery(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120))
    model = db.Column(db.String(80))
    manufacturer = db.Column(db.String(80))
    uniqueld = db.Column(db.String(80), unique=True)
    status = db.Column(db.String(50))
    capacity = db.Column(db.Integer)
    cycleCount = db.Column(db.Integer)
    lastCharged = db.Column(db.String(50))
    imageUrl = db.Column(db.String(255))
    type = db.Column(db.String(50), default="Battery")
    maintenanceHistory = db.Column(JSON)
    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "model": self.model, "manufacturer": self.manufacturer,
            "uniqueld": self.uniqueld, "status": self.status, "capacity": self.capacity,
            "cycleCount": self.cycleCount, "lastCharged": self.lastCharged,
            "imageUrl": self.imageUrl, "type": self.type, "maintenanceHistory": self.maintenanceHistory
        }

class Mission(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    drone_id = db.Column(db.String(36), db.ForeignKey('drone.id'))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    details = db.Column(db.Text)
    status = db.Column(db.String(50))
    progress = db.Column(db.Integer)
    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "droneId": self.drone_id,
            "startTime": self.start_time.isoformat() + 'Z' if self.start_time else None,
            "endTime": self.end_time.isoformat() + 'Z' if self.end_time else None,
            "details": self.details, "status": self.status, "progress": self.progress
        }

class Media(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(120))
    type = db.Column(db.String(50))
    url = db.Column(db.String(255))
    thumbnail = db.Column(db.String(255))
    droneId = db.Column(db.String(36))
    missionId = db.Column(db.String(36))
    timestamp = db.Column(db.DateTime)
    gps = db.Column(db.String(100))
    tags = db.Column(JSON)
    description = db.Column(db.Text)
    date = db.Column(db.Date)
    def to_dict(self):
        return {
            "id": self.id, "title": self.title, "type": self.type, "url": self.url,
            "thumbnail": self.thumbnail, "droneId": self.droneId, "missionId": self.missionId,
            "timestamp": self.timestamp.isoformat() + 'Z' if self.timestamp else None,
            "gps": self.gps, "tags": self.tags, "description": self.description,
            "date": self.date.isoformat() if self.date else None
        }

class File(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120))
    type = db.Column(db.String(50))
    url = db.Column(db.String(255))
    category = db.Column(db.String(100))
    uploadDate = db.Column(db.Date)
    description = db.Column(db.Text)
    size = db.Column(db.String(50))
    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "type": self.type, "url": self.url,
            "category": self.category, "description": self.description, "size": self.size,
            "uploadDate": self.uploadDate.isoformat() if self.uploadDate else None
        }

class Checklist(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120))
    description = db.Column(db.Text)
    items = db.Column(JSON)
    type = db.Column(db.String(50))
    dateCompleted = db.Column(db.Date)
    completedBy = db.Column(db.String(100))
    completionNotes = db.Column(db.Text)
    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "description": self.description, "items": self.items,
            "type": self.type, "completedBy": self.completedBy, "completionNotes": self.completionNotes,
            "dateCompleted": self.dateCompleted.isoformat() if self.dateCompleted else None
        }

class Tag(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100))
    description = db.Column(db.Text)
    def to_dict(self):
        return {"id": self.id, "name": self.name, "description": self.description}

class Incident(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = db.Column(db.String(50))
    message = db.Column(db.Text)
    timestamp = db.Column(db.DateTime)
    resolved = db.Column(db.Boolean, default=False)
    def to_dict(self):
        return {
            "id": self.id, "type": self.type, "message": self.message, "resolved": self.resolved,
            "timestamp": self.timestamp.isoformat() + 'Z' if self.timestamp else None
        }

class MaintenancePart(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120))
    status = db.Column(db.String(50))
    lastMaintenance = db.Column(db.Date)
    nextMaintenance = db.Column(db.Date)
    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "status": self.status,
            "lastMaintenance": self.lastMaintenance.isoformat() if self.lastMaintenance else None,
            "nextMaintenance": self.nextMaintenance.isoformat() if self.nextMaintenance else None
        }

class Notification(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message = db.Column(db.Text)
    type = db.Column(db.String(50))
    read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime)
    def to_dict(self):
        return {
            "id": self.id, "message": self.message, "type": self.type, "read": self.read,
            "timestamp": self.timestamp.isoformat() + 'Z' if self.timestamp else None
        }

# --- Database Setup Command ---
@app.cli.command("init-db")
def init_db_command():
    """Creates all database tables and seeds them with initial data."""
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(username='admin').first():
            print("Seeding database with initial data...")
            # Seeding logic remains the same
            db.session.commit()
            print("Database initialized and seeded.")
        else:
            print("Database already contains data.")
# --- Authentication and Authorization ---
def get_current_user_from_request():
    """
    Retrieves the current user based on the mock token in the request header.
    In a real application, this would involve validating a JWT token.
    """
    auth_token = request.headers.get('X-Auth-Token')
    if not auth_token:
        # If no token is provided, a user is not authenticated.
        return None
    
    # For development, we use mock tokens to simulate different user roles.
    if auth_token == "mock-admin-token":
        return User.query.filter_by(role='admin').first()
    elif auth_token.startswith("mock-token-"):
        # This assumes any token starting with 'mock-token-' is a valid standard user.
        return User.query.filter_by(role='user').first()
        
    return None

def login_required(f):
    """Decorator to protect routes that require authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)
        user = get_current_user_from_request()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to protect routes that require administrator access."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)
        user = get_current_user_from_request()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        if user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def parse_datetime_str(iso_string):
    if not iso_string: return None
    return datetime.datetime.fromisoformat(iso_string.replace('Z', ""))

def parse_date_str(iso_string):
    if not iso_string: return None
    return datetime.date.fromisoformat(iso_string.split('T')[0])

# --- Generic CRUD Functions ---
def handle_crud(model, item_id=None):
    if request.method == 'GET':
        if item_id:
            item = model.query.get_or_404(item_id)
            return jsonify(item.to_dict())
        else:
            items = model.query.all()
            return jsonify([item.to_dict() for item in items])
    if request.method == 'POST' or request.method == 'PUT':
        data = request.get_json()
        if request.method == 'POST':
            if model == Drone:
                data['status'] = data.get('status', 'Offline')
            if model == Mission:
                data['start_time'] = parse_datetime_str(data.get('startTime'))
                data['end_time'] = parse_datetime_str(data.get('endTime'))
            elif model == Media:
                data['timestamp'] = datetime.datetime.now(datetime.timezone.utc)
                data['date'] = datetime.date.today()
            elif model == File:
                data['uploadDate'] = datetime.date.today()
            elif model == Incident:
                data['timestamp'] = datetime.datetime.now(datetime.timezone.utc)
            elif model == MaintenancePart:
                data['lastMaintenance'] = parse_date_str(data.get('lastMaintenance'))
                data['nextMaintenance'] = parse_date_str(data.get('nextMaintenance'))
            new_item = model(**data)
            db.session.add(new_item)
            db.session.commit()
            if model == Media:
                socketio.emit('new_media_available', new_item.to_dict())
            return jsonify(new_item.to_dict()), 201
        elif request.method == 'PUT':
            item = model.query.get_or_404(item_id)
            if model == Mission:
                if data.get('startTime'): data['start_time'] = parse_datetime_str(data['startTime'])
                if data.get('endTime'): data['end_time'] = parse_datetime_str(data['endTime'])
            elif model == MaintenancePart:
                if data.get('lastMaintenance'): data['lastMaintenance'] = parse_date_str(data['lastMaintenance'])
                if data.get('nextMaintenance'): data['nextMaintenance'] = parse_date_str(data['nextMaintenance'])
            for key, value in data.items():
                if hasattr(item, key):
                    setattr(item, key, value)
            db.session.commit()
            return jsonify(item.to_dict())
        elif request.method == 'DELETE':
            item = model.query.get_or_404(item_id)
            db.session.delete(item)
            db.session.commit()
            return "", 204

# --- API Endpoints ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()
    
    # If user doesn't exist or is not an admin, we just create a new user and log them in
    if not user or user.role != 'admin':
        
        new_token = f"mock-token-{str(uuid.uuid4())}"
        
        # Check if username is 'admin' to set the role
        role = 'admin' if username == 'admin' else 'user'
        
        if not user:
            # If the user doesn't exist, create a new one
            new_user = User(username=username, password=password, role=role, name=username, email=f"{username}@example.com")
            db.session.add(new_user)
            db.session.commit()
            user_to_return = new_user.to_dict()
        else:
            # If the user exists but is not an admin, just get their data
            user_to_return = user.to_dict()
            
        return jsonify({"message": "Login successful", "token": new_token, "user": user_to_return}), 200

    # For the admin user, we still use the hardcoded password and a different token
    if user.password == password:
        return jsonify({"message": "Login successful", "token": "mock-admin-token", "user": user.to_dict()}), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    username = data.get('username')
    
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    new_user = User(username=username, password=data.get('password'),
                    name=data.get('name'), email=data.get('email'), role='user')
    db.session.add(new_user)
    db.session.commit()
    
    # A generic token for new users
    new_token = f"mock-token-{str(uuid.uuid4())}"
    
    return jsonify({"message": "Registration successful", "token": new_token, "user": new_user.to_dict()}), 201


# User Endpoints
@app.route('/api/admin/users', methods=['GET', 'POST'])
@admin_required
def manage_users(): return handle_crud(User)

@app.route('/api/admin/users/<string:user_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_user(user_id): return handle_crud(User, item_id=user_id)

# Drone Endpoints
@app.route('/api/drones', methods=['GET', 'POST'])
@login_required
def manage_drones(): return handle_crud(Drone)

@app.route('/api/drones/<string:drone_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_drone(drone_id): return handle_crud(Drone, item_id=drone_id)

@app.route('/api/drones/<string:drone_id>/status', methods=['POST'])
@login_required
def update_drone_status(drone_id):
    data = request.get_json()
    new_status = data.get('status')
    if not new_status or new_status not in ['Online', 'Offline', 'Available', 'Deployed', 'In Maintenance']:
        return jsonify({"error": "Invalid status provided"}), 400
    drone = Drone.query.get_or_404(drone_id)
    drone.status = new_status
    if new_status in ['Online', 'Deployed'] and drone.id not in connected_drones:
        connected_drones.append(drone.id)
    elif new_status in ['Offline', 'Available', 'In Maintenance'] and drone.id in connected_drones:
        try:
            connected_drones.remove(drone.id)
        except ValueError:
            pass
    db.session.commit()
    socketio.emit('drone_status_updated', drone.to_dict())
    return jsonify(drone.to_dict())

# Ground Station Endpoints
@app.route('/api/ground_stations', methods=['GET', 'POST'])
@login_required
def manage_ground_stations(): return handle_crud(GroundStation)

@app.route('/api/ground_stations/<string:gs_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_ground_station(gs_id): return handle_crud(GroundStation, item_id=gs_id)

# Equipment Endpoints
@app.route('/api/equipment', methods=['GET', 'POST'])
@login_required
def manage_equipment_all(): return handle_crud(Equipment)

@app.route('/api/equipment/<string:eq_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_equipment(eq_id): return handle_crud(Equipment, item_id=eq_id)

# Battery Endpoints
@app.route('/api/batteries', methods=['GET', 'POST'])
@login_required
def manage_batteries(): return handle_crud(Battery)

@app.route('/api/batteries/<string:bat_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_battery(bat_id): return handle_crud(Battery, item_id=bat_id)

# Mission Endpoints
@app.route('/api/missions', methods=['GET', 'POST'])
@login_required
def manage_missions(): return handle_crud(Mission)

@app.route('/api/missions/<string:mission_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_mission(mission_id): return handle_crud(Mission, item_id=mission_id)

# Media Endpoints
@app.route('/api/media', methods=['GET', 'POST'])
@login_required
def manage_media_all(): return handle_crud(Media)

@app.route('/api/media/<string:media_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_media(media_id): return handle_crud(Media, item_id=media_id)

# File Endpoints
@app.route('/api/files', methods=['GET', 'POST'])
@login_required
def manage_files(): return handle_crud(File)

@app.route('/api/files/<string:file_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_file(file_id): return handle_crud(File, item_id=file_id)

# Checklist Endpoints
@app.route('/api/checklists', methods=['GET', 'POST'])
@login_required
def manage_checklists(): return handle_crud(Checklist)

@app.route('/api/checklists/<string:checklist_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_checklist(checklist_id): return handle_crud(Checklist, item_id=checklist_id)

# Tag Endpoints
@app.route('/api/tags', methods=['GET', 'POST'])
@login_required
def manage_tags(): return handle_crud(Tag)

@app.route('/api/tags/<string:tag_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_tag(tag_id): return handle_crud(Tag, item_id=tag_id)

# Incident Endpoints
@app.route('/api/incidents', methods=['GET', 'POST'])
@login_required
def manage_incidents(): return handle_crud(Incident)

@app.route('/api/incidents/<string:incident_id>', methods=['PUT', 'DELETE'])
@login_required
def manage_incident(incident_id): return handle_crud(Incident, item_id=incident_id)

# Maintenance Part Endpoints
@app.route('/api/maintenance_parts', methods=['GET', 'POST'])
@login_required
def manage_maintenance_parts(): return handle_crud(MaintenancePart)

@app.route('/api/maintenance_parts/<string:part_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_maintenance_part(part_id): return handle_crud(MaintenancePart, item_id=part_id)

# Notification Endpoints
@app.route('/api/notifications', methods=['GET'])
@login_required
def get_notifications():
    notifications = Notification.query.order_by(Notification.timestamp.desc()).all()
    return jsonify([n.to_dict() for n in notifications])

@app.route('/api/notifications/mark_read/<string:notification_id>', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    notif = Notification.query.get_or_404(notification_id)
    notif.read = True
    db.session.commit()
    socketio.emit('notification_updated', notif.to_dict())
    return jsonify(notif.to_dict())

# User Profile Endpoints
@app.route('/api/user/profile', methods=['GET', 'PUT'])
@login_required
def manage_user_profile():
    user = request.current_user
    if request.method == 'GET': return jsonify(user.to_dict())
    data = request.json
    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify(user.to_dict())

@app.route('/api/user/change_password', methods=['POST'])
@login_required
def change_password():
    user = request.current_user
    data = request.json
    if user.password == data.get('current_password'):
        user.password = data.get('new_password')
        db.session.commit()
        return jsonify({"message": "Password changed successfully"})
    return jsonify({"error": "Incorrect current password"}), 401

@app.route('/api/user/profile_picture', methods=['POST'])
@login_required
def update_profile_picture():
    user = request.current_user
    data = request.json
    user.profilePicture = data.get('profile_picture_url', user.profilePicture)
    db.session.commit()
    return jsonify(user.to_dict())

# Live Data Endpoints
@app.route('/api/connected_drones', methods=['GET'])
def get_connected_drones_api():
    return jsonify(connected_drones)

@app.route('/api/command_drone/<string:drone_id>', methods=['POST'])
@login_required
def command_drone(drone_id):
    data = request.json
    command = data.get('command')
    if drone_id not in connected_drones:
        return jsonify({"error": f"Drone {drone_id} is not connected."}), 400
    with app.app_context():
        drone_in_db = Drone.query.get(drone_id)
        if command == "takeoff":
            if drone_in_db: drone_in_db.status = "Deployed"
        elif command == "land":
            if drone_in_db: drone_in_db.status = "Available"
        elif command == "take_photo":
            new_media = Media(title=f"Photo from {drone_id}", type="image", droneId=drone_id,
                              date=datetime.date.today(), timestamp=datetime.datetime.now(datetime.timezone.utc))
            db.session.add(new_media)
            socketio.emit('new_media_available', new_media.to_dict())
        db.session.commit()
    socketio.emit('drone_telemetry_update', {"drone_id": drone_id, "telemetry": live_telemetry.get(drone_id, {})})
    return jsonify({"message": f"Command '{command}' sent to drone {drone_id}"}), 200

# --- Live Streaming Endpoints ---
@app.route('/api/stream/<string:drone_id>/start', methods=['POST'])
@login_required
def start_stream(drone_id):
    """
    Starts an FFmpeg process to pull an RTMP stream from a local Nginx server
    and transcode it into an HLS stream for the web client.
    """
    global active_ffmpeg_processes
    stream_dir = os.path.join(HLS_ROOT, drone_id)
    hls_playlist_path = os.path.join(stream_dir, 'index.m3u8')
    rtmp_stream_url = f"{RTMP_SERVER_URL}/{drone_id}"
    
    if FFMPEG_PATH is None:
        return jsonify({"error": "FFmpeg executable not found. Please install it."}), 500

    if drone_id in active_ffmpeg_processes and active_ffmpeg_processes[drone_id].poll() is None:
        return jsonify({"message": f"Stream for drone {drone_id} is already active."}), 200

    # Ensure the output directory is clean
    if os.path.exists(stream_dir):
        shutil.rmtree(stream_dir)
    os.makedirs(stream_dir)

    # FFmpeg command to transcode RTMP to HLS
    command = [
        FFMPEG_PATH,
        '-i', rtmp_stream_url,
        '-c:v', 'libx264',  # Re-encode video for broad HLS compatibility
        '-c:a', 'aac',      # Re-encode audio
        '-ac', '1',         # Mono audio
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '3',
        '-hls_flags', 'delete_segments',
        hls_playlist_path
    ]

    try:
        # Use Popen to run FFmpeg as a separate process
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        active_ffmpeg_processes[drone_id] = process
        print(f"Started FFmpeg for drone {drone_id}. HLS available at /hls_streams/{drone_id}/index.m3u8")
        return jsonify({"message": f"Stream for drone {drone_id} started."}), 200
    except FileNotFoundError:
        return jsonify({"error": "FFmpeg not found. Please ensure it's installed and in your PATH."}), 500
    except Exception as e:
        print(f"Error starting FFmpeg for drone {drone_id}: {e}")
        return jsonify({"error": f"Failed to start stream: {str(e)}"}), 500

@app.route('/api/stream/<string:drone_id>/stop', methods=['POST'])
@login_required
def stop_stream(drone_id):
    """
    Stops the FFmpeg process for a given drone and cleans up the HLS files.
    """
    global active_ffmpeg_processes
    if drone_id in active_ffmpeg_processes:
        process = active_ffmpeg_processes[drone_id]
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        del active_ffmpeg_processes[drone_id]

        stream_dir = os.path.join(HLS_ROOT, drone_id)
        if os.path.exists(stream_dir):
            shutil.rmtree(stream_dir)
        print(f"Stopped FFmpeg for drone {drone_id} and cleaned up HLS files.")
        return jsonify({"message": f"Stream for drone {drone_id} stopped."}), 200
    else:
        return jsonify({"error": f"No active stream found for drone {drone_id}."}), 404

@app.route('/hls_streams/<path:filename>')
def serve_hls_stream(filename):
    """
    Serves the HLS manifest and video segments.
    """
    return send_from_directory(HLS_ROOT, filename)

# --- Background Telemetry Simulation ---
def simulate_drone_telemetry():
    print("Starting telemetry simulation thread...")
    while True:
        time.sleep(2)
        with app.app_context():
            active_missions = Mission.query.filter_by(status='Active').all()
            for mission in active_missions:
                if mission.drone_id not in connected_drones:
                    connected_drones.append(mission.drone_id)
                if mission.progress < 100:
                    mission.progress = min(100, mission.progress + random.randint(1, 5))
                if mission.progress >= 100:
                    completed_mission_name = mission.name
                    mission.status = "Completed"
                    if mission.drone_id in connected_drones:
                        connected_drones.remove(mission.drone_id)
                    drone = Drone.query.get(mission.drone_id)
                    if drone:
                        drone.status = "Available"
                    socketio.emit('new_notification', {'message': f"Mission '{completed_mission_name}' completed!"})
                    db.session.commit()
            for drone_id in list(connected_drones):
                telemetry = live_telemetry.get(drone_id, {})
                telemetry["altitude"] = max(0, telemetry.get("altitude", 50) + random.uniform(-5, 5))
                telemetry["battery_percent"] = max(0, telemetry.get("battery_percent", 90) - 0.5)
                live_telemetry[drone_id] = telemetry
                socketio.emit('drone_telemetry_update', {"drone_id": drone_id, "telemetry": telemetry})

# --- Shutdown Hook ---
def shutdown_ffmpeg_processes():
    print("Shutting down all active FFmpeg processes...")
    for drone_id, process in list(active_ffmpeg_processes.items()):
        if process.poll() is None:
            print(f"Terminating FFmpeg process for drone {drone_id}...")
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print(f"Force killing FFmpeg process for drone {drone_id} due to timeout...")
                process.kill()
        stream_dir = os.path.join(HLS_ROOT, drone_id)
        if os.path.exists(stream_dir):
            shutil.rmtree(stream_dir)
    print("All FFmpeg processes shut down.")

atexit.register(shutdown_ffmpeg_processes)

# --- Main Execution ---
if __name__ == '__main__':
    threading.Thread(target=simulate_drone_telemetry, daemon=True).start()
    socketio.run(app, debug=True, port=5000, host='0.0.0.0')