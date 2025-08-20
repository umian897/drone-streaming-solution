import os
import random
import uuid
import datetime
import threading
import subprocess
import shutil
import time
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS
from sqlalchemy.dialects.sqlite import JSON
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import atexit
import sys
import click

# --- App Initialization ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# --- Database Configuration ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'dronedata.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Live Data and Configuration ---
connected_drones = ["d1"]
live_telemetry = {
    "d1": {"altitude": 50, "speed": 10, "battery_percent": 85, "latitude": 23.5859,
           "longitude": 58.4059, "status": "flying"},
    "d2": {"altitude": 0, "speed": 0, "battery_percent": 90, "latitude": 24.0000,
           "longitude": 57.0000, "status": "landed"},
    "d3": {"altitude": 0, "speed": 0, "battery_percent": 70, "latitude": 23.0000,
           "longitude": 56.0000, "status": "maintenance"},
}

HLS_ROOT = os.path.join(basedir, 'hls_streams')
if not os.path.exists(HLS_ROOT):
    os.makedirs(HLS_ROOT)
active_ffmpeg_processes = {}

FFMPEG_PATH = shutil.which('ffmpeg') or '/usr/bin/ffmpeg'
RTMP_SERVER_URL = "rtmp://nginx_rtmp:1935/live"

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
            "id": self.id, "username": self.username, "name": self.name, "email":
            self.email,
            "profilePicture": self.profilePicture, "totalFlights": self.totalFlights,
            "totalFlightTime": self.totalFlightTime, "averageFlightTime":
            self.averageFlightTime,
            "role": self.role
        }

class Pilot(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=True)
    mission_id = db.Column(db.String(36), db.ForeignKey('mission.id'), nullable=True)
    checklist_id = db.Column(db.String(36), db.ForeignKey('checklist.id'), nullable=True)
    drone_ids = db.Column(JSON)

    user = db.relationship('User', backref=db.backref('pilots', lazy=True))
    mission = db.relationship('Mission', backref=db.backref('pilots', lazy=True))
    checklist = db.relationship('Checklist', backref=db.backref('pilots', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "userId": self.user_id,
            "missionId": self.mission_id,
            "checklistId": self.checklist_id,
            "droneIds": self.drone_ids,
            "missionName": self.mission.name if self.mission else None,
            "checklistName": self.checklist.name if self.checklist else None
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
    mission_id = db.Column(db.String(36), db.ForeignKey('mission.id'), nullable=True)
    pilot_id = db.Column(db.String(36), db.ForeignKey('pilot.id'), nullable=True)

    mission = db.relationship('Mission', backref=db.backref('drones', lazy=True), foreign_keys=[mission_id])
    pilot = db.relationship('Pilot', backref=db.backref('drones_assigned', lazy=True))
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "model": self.model,
            "manufacturer": self.manufacturer,
            "uniqueld": self.uniqueld,
            "status": self.status,
            "lastLocation": self.lastLocation,
            "flightHours": self.flightHours,
            "payloadCapacity": self.payloadCapacity,
            "imageUrl": self.imageUrl,
            "type": self.type,
            "maintenanceHistory": self.maintenanceHistory,
            "missionId": self.mission_id,
            "missionName": self.mission.name if self.mission else None,
            "pilotId": self.pilot_id,
            "pilotName": self.pilot.name if self.pilot else None
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
            "id": self.id, "name": self.name, "model": self.model, "manufacturer":
            self.manufacturer,
            "uniqueld": self.uniqueld, "status": self.status, "coverageArea":
            self.coverageArea,
            "powerSource": self.powerSource, "imageUrl": self.imageUrl, "type":
            self.type,
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
            "id": self.id, "name": self.name, "model": self.model, "manufacturer":
            self.manufacturer,
            "uniqueld": self.uniqueld, "status": self.status, "equipmentType":
            self.equipmentType,
            "compatibility": self.compatibility, "imageUrl": self.imageUrl, "type":
            self.type,
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
            "id": self.id, "name": self.name, "model": self.model, "manufacturer":
            self.manufacturer,
            "uniqueld": self.uniqueld, "status": self.status, "capacity":
            self.capacity,
            "cycleCount": self.cycleCount, "lastCharged": self.lastCharged,
            "imageUrl": self.imageUrl, "type": self.type, "maintenanceHistory":
            self.maintenanceHistory
        }

class Mission(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    drone_ids = db.Column(JSON)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    details = db.Column(db.Text)
    status = db.Column(db.String(50))
    progress = db.Column(db.Integer)
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "droneIds": self.drone_ids if self.drone_ids else [],
            "startTime": self.start_time.isoformat() + 'Z' if self.start_time else None,
            "endTime": self.end_time.isoformat() + 'Z' if self.end_time else None,
            "details": self.details,
            "status": self.status,
            "progress": self.progress
        }

class Media(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(120))
    type = db.Column(db.String(50))
    url = db.Column(db.String(255))
    thumbnail = db.Column(db.String(255))
    droneId = db.Column(db.String(36))
    missionId = db.Column(db.String(36))
    pilotId = db.Column(db.String(36))
    timestamp = db.Column(db.DateTime)
    gps = db.Column(db.String(100))
    tags = db.Column(JSON)
    description = db.Column(db.Text)
    date = db.Column(db.Date)
    def to_dict(self):
        return {
            "id": self.id, "title": self.title, "type": self.type, "url": self.url,
            "thumbnail": self.thumbnail, "droneId": self.droneId, "missionId":
            self.missionId, "pilotId": self.pilotId,
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
            "category": self.category, "description": self.description, "size":
            self.size,
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
            "id": self.id, "name": self.name, "description": self.description, "items":
            self.items,
            "type": self.type, "completedBy": self.completedBy, "completionNotes":
            self.completionNotes,
            "dateCompleted": self.dateCompleted.isoformat() if self.dateCompleted else
            None
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
    drone_id = db.Column(db.String(36), db.ForeignKey('drone.id'), nullable=True)
    def to_dict(self):
        return {
            "id": self.id, "type": self.type, "message": self.message, "resolved":
            self.resolved,
            "timestamp": self.timestamp.isoformat() + 'Z' if self.timestamp else None,
            "droneId": self.drone_id
        }

class MaintenancePart(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120))
    status = db.Column(db.String(50))
    lastMaintenance = db.Column(db.Date)
    nextMaintenance = db.Column(db.Date)
    drone_id = db.Column(db.String(36), db.ForeignKey('drone.id'), nullable=True)
    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "status": self.status,
            "lastMaintenance": self.lastMaintenance.isoformat() if self.lastMaintenance
            else None,
            "nextMaintenance": self.nextMaintenance.isoformat() if self.nextMaintenance
            else None,
            "droneId": self.drone_id
        }

class Notification(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message = db.Column(db.Text)
    type = db.Column(db.String(50))
    read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime)
    def to_dict(self):
        return {
            "id": self.id, "message": self.message, "type": self.type, "read":
            self.read,
            "timestamp": self.timestamp.isoformat() + 'Z' if self.timestamp else None
        }

# --- Database Setup Command ---
@app.cli.command("init-db")
def init_db_command():
    """Creates all database tables and seeds them with initial data."""
    with app.app_context():
        db.create_all()
        if not User.query.first():
            print("Seeding database with initial data...")
            admin_password_hash = generate_password_hash("adminpassword")
            admin_user = User(
                username='admin',
                password=admin_password_hash,
                name='Admin User',
                email='admin@firnasair.com',
                role='admin'
            )
            db.session.add(admin_user)
            db.session.commit()
            print("Database initialized and seeded.")
        else:
            print("Database already contains data.")

# --- Admin Creation Command ---
@app.cli.command("create-admin")
@click.argument("username")
@click.argument("password")
@click.argument("email")
def create_admin_command(username, password, email):
    """Creates a new admin user."""
    with app.app_context():
        user = User.query.filter_by(username=username).first()
        if user:
            print(f"Error: Username '{username}' already exists.")
            sys.exit(1)
        
        hashed_password = generate_password_hash(password)
        new_admin = User(
            username=username,
            password=hashed_password,
            name=username,
            email=email,
            role='admin'
        )
        db.session.add(new_admin)
        db.session.commit()
        print(f"New admin user '{username}' created successfully!")
        
# --- Authentication and Authorization ---
def get_current_user_from_request():
    """
    Retrieves the current user based on the mock token in the request header.
    """
    auth_token = request.headers.get('X-Auth-Token')
    if not auth_token:
        return None
    if auth_token == "mock-admin-token":
        admin_user = User.query.filter_by(role='admin').first()
        return admin_user
    elif auth_token.startswith("mock-token-"):
        user = User.query.filter_by(role='user').first()
        return user
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

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_datetime_str(iso_string):
    if not iso_string:
        return None
    try:
        return datetime.datetime.fromisoformat(iso_string)
    except ValueError:
        return None

def parse_date_str(iso_string):
    if not iso_string: return None
    try:
        return datetime.date.fromisoformat(iso_string.split('T')[0])
    except (ValueError, IndexError):
        return None

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
        processed_data = data.copy()

        if model == Mission:
            start_time_str = processed_data.get('startTime')
            end_time_str = processed_data.get('endTime')
            processed_data['start_time'] = parse_datetime_str(start_time_str)
            processed_data['end_time'] = parse_datetime_str(end_time_str)
            if 'droneIds' in processed_data:
                processed_data['drone_ids'] = processed_data.pop('droneIds')
        elif model == Incident:
            if 'droneId' in processed_data:
                processed_data['drone_id'] = processed_data.pop('droneId')
            processed_data['timestamp'] = datetime.datetime.now(datetime.timezone.utc)
        elif model == MaintenancePart:
            if 'droneId' in processed_data:
                processed_data['drone_id'] = processed_data.pop('droneId')
            if 'lastMaintenance' in processed_data:
                processed_data['lastMaintenance'] = parse_date_str(processed_data.pop('lastMaintenance'))
            if 'nextMaintenance' in processed_data:
                processed_data['nextMaintenance'] = parse_date_str(processed_data.pop('nextMaintenance'))
        elif model == Pilot:
            if 'userId' in processed_data: processed_data['user_id'] = processed_data.pop('userId')
            if 'missionId' in processed_data: processed_data['mission_id'] = processed_data.pop('missionId')
            if 'checklistId' in processed_data: processed_data['checklist_id'] = processed_data.pop('checklistId')
            if 'droneIds' in processed_data: processed_data['drone_ids'] = processed_data.pop('droneIds')
        
        if model == Media:
            processed_data['timestamp'] = datetime.datetime.now(datetime.timezone.utc)
            processed_data['date'] = datetime.date.today()
        elif model == File:
            processed_data['uploadDate'] = datetime.date.today()
        
        if model == User and 'password' in processed_data:
            processed_data['password'] = generate_password_hash(processed_data['password'])

        data_for_db = {k: v for k, v in processed_data.items() if v is not None}
        
        if request.method == 'POST':
            if model == Mission:
                if 'name' not in data_for_db or 'start_time' not in data_for_db or 'end_time' not in data_for_db:
                    return jsonify({"error": "Missing required mission fields."}), 400
                new_item = model(
                    name=data_for_db['name'],
                    start_time=data_for_db['start_time'],
                    end_time=data_for_db['end_time'],
                    details=data_for_db.get('details'),
                    status=data_for_db.get('status'),
                    progress=data_for_db.get('progress', 0),
                    drone_ids=data_for_db.get('drone_ids')
                )
            elif model == MaintenancePart:
                new_item = model(
                    name=data_for_db['name'],
                    status=data_for_db.get('status', 'Available'),
                    lastMaintenance=data_for_db.get('lastMaintenance'),
                    nextMaintenance=data_for_db.get('nextMaintenance'),
                    drone_id=data_for_db.get('drone_id')
                )
            else:
                new_item = model(**data_for_db)

            db.session.add(new_item)
            db.session.commit()
            if model == Media:
                socketio.emit('new_media_available', new_item.to_dict())
            return jsonify(new_item.to_dict()), 201
            
        elif request.method == 'PUT':
            item = model.query.get_or_404(item_id)
            for key, value in data_for_db.items():
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
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    new_token = "mock-admin-token" if user.role == 'admin' else f"mock-token-{str(uuid.uuid4())}"
    return jsonify({"message": "Login successful", "token": new_token, "user": user.to_dict()}), 200

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({"error": "Username, password, and email are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409
    
    hashed_password = generate_password_hash(password)
    
    new_user = User(username=username, password=hashed_password, name=username, email=email, role='user')
    db.session.add(new_user)
    db.session.commit()
    
    new_token = f"mock-token-{str(uuid.uuid4())}"
    return jsonify({"message": "Registration successful", "token": new_token, "user": new_user.to_dict()}), 201

# User Endpoints
@app.route('/api/admin/users', methods=['GET', 'POST'])
@admin_required
def manage_users(): return handle_crud(User)

@app.route('/api/admin/users/<string:user_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_user(user_id): return handle_crud(User, item_id=user_id)

# Pilot Endpoints
@app.route('/api/pilots', methods=['GET', 'POST'])
@login_required
def manage_pilots():
    if request.method == 'POST':
        data = request.get_json()
        new_item = Pilot(
            name=data.get('name'),
            user_id=data.get('userId'),
            mission_id=data.get('missionId'),
            checklist_id=data.get('checklistId'),
            drone_ids=data.get('droneIds')
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.to_dict()), 201
    return handle_crud(Pilot)

@app.route('/api/pilots/<string:pilot_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_pilot(pilot_id):
    if request.method == 'PUT':
        data = request.get_json()
        item = Pilot.query.get_or_404(pilot_id)
        if 'name' in data: item.name = data['name']
        if 'userId' in data: item.user_id = data['userId']
        if 'missionId' in data: item.mission_id = data['missionId']
        if 'checklistId' in data: item.checklist_id = data['checklistId']
        if 'droneIds' in data: item.drone_ids = data['droneIds']
        db.session.commit()
        return jsonify(item.to_dict())
    return handle_crud(Pilot, item_id=pilot_id)

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
def manage_media_all():
    if request.method == 'GET':
        media_items = db.session.query(Media, Drone, Mission, Pilot).\
            outerjoin(Drone, Media.droneId == Drone.id).\
            outerjoin(Mission, Media.missionId == Mission.id).\
            outerjoin(Pilot, Media.pilotId == Pilot.id).\
            order_by(Media.timestamp.desc()).all()
        result = []
        for media, drone, mission, pilot in media_items:
            media_dict = media.to_dict()
            media_dict['droneName'] = drone.name if drone else 'N/A'
            media_dict['missionName'] = mission.name if mission else 'N/A'
            media_dict['pilotName'] = pilot.name if pilot else 'N/A'
            result.append(media_dict)
        return jsonify(result)
    return handle_crud(Media)

@app.route('/api/media/by_drone/<string:drone_id>', methods=['GET'])
@login_required
def get_media_by_drone(drone_id):
    media_items = db.session.query(Media, Drone, Mission).\
        outerjoin(Drone, Media.droneId == Drone.id).\
        outerjoin(Mission, Media.missionId == Mission.id).\
        filter(Media.droneId == drone_id).\
        order_by(Media.timestamp.desc()).all()
    result = []
    for media, drone, mission in media_items:
        media_dict = media.to_dict()
        media_dict['droneName'] = drone.name if drone else 'N/A'
        media_dict['missionName'] = mission.name if mission else 'N/A'
        result.append(media_dict)
    return jsonify(result)

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
    if check_password_hash(user.password, data.get('current_password')):
        user.password = generate_password_hash(data.get('new_password'))
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
    
# --- File Upload Endpoints ---
@app.route('/api/upload_profile_picture', methods=['POST'])
@login_required
def upload_profile_picture():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(app.root_path, 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        return jsonify({"url": f"/uploads/{filename}"}), 200
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(os.path.join(app.root_path, 'uploads'), filename)

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
            new_media = Media(title=f"Photo from {drone_id}", type="image",
                              droneId=drone_id,
                              date=datetime.date.today(),
                              timestamp=datetime.datetime.now(datetime.timezone.utc))
            db.session.add(new_media)
            socketio.emit('new_media_available', new_media.to_dict())
            db.session.commit()
        socketio.emit('drone_telemetry_update', {"drone_id": drone_id, "telemetry":
                                                 live_telemetry.get(drone_id, {})})
        return jsonify({"message": f"Command '{command}' sent to drone {drone_id}"}), 200

# --- Live Streaming Endpoints ---
@app.route('/api/stream/<string:drone_id>/start', methods=['POST'])
def start_stream(drone_id):
    print(f"DEBUG: Attempting to start stream for drone {drone_id}", flush=True)
    if FFMPEG_PATH is None:
        return jsonify({"error": "FFmpeg executable not found. Please install it."}), 500
    if drone_id in active_ffmpeg_processes and active_ffmpeg_processes[drone_id].poll() is None:
        return jsonify({"message": f"Stream for drone {drone_id} is already active."}), 200
    stream_dir = os.path.join(app.root_path, 'hls_streams', drone_id)
    if os.path.exists(stream_dir):
        shutil.rmtree(stream_dir)
    os.makedirs(stream_dir)
    hls_playlist_path = os.path.join(stream_dir, 'index.m3u8')
    rtmp_stream_url = f"{RTMP_SERVER_URL}/{drone_id}"
    command = [
        FFMPEG_PATH,
        '-i', rtmp_stream_url,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-ac', '1',
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '5',
        '-hls_flags', 'delete_segments',
        hls_playlist_path
    ]
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(1)
        if process.poll() is not None:
            error_output = process.stderr.read().decode('utf-8')
            print(f"FFmpeg failed to start for drone {drone_id}. Error: {error_output}", file=sys.stderr)
            return jsonify({"error": "Failed to start FFmpeg. Check backend logs for details."}), 500
        active_ffmpeg_processes[drone_id] = process
        print(f"Started FFmpeg for drone {drone_id}. HLS available at hls_streams/{drone_id}/index.m3u8")
        return jsonify({"message": f"Stream for drone {drone_id} started."}), 200
    except FileNotFoundError:
        return jsonify({"error": "FFmpeg not found. Please ensure it's installed and in your PATH."}), 500
    except Exception as e:
        print(f"Error starting FFmpeg for drone {drone_id}: {e}", file=sys.stderr)
        return jsonify({"error": f"Failed to start stream: {str(e)}"}), 500

@app.route('/api/stream/<string:drone_id>/stop', methods=['POST'])
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
        stream_dir = os.path.join(app.root_path, 'hls_streams', drone_id)
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
    return send_from_directory(os.path.join(app.root_path, 'hls_streams'), filename)

# --- Background Telemetry Simulation ---
def simulate_drone_telemetry():
    print("Starting telemetry simulation thread...")
    while True:
        time.sleep(2)
        with app.app_context():
            active_missions = Mission.query.filter_by(status='Active').all()
            for mission in active_missions:
                for drone_id in mission.drone_ids:
                    if drone_id not in connected_drones:
                        connected_drones.append(drone_id)
                if mission.progress < 100:
                    mission.progress = min(100, mission.progress + random.randint(1, 5))
                if mission.progress >= 100:
                    completed_mission_name = mission.name
                    mission.status = "Completed"
                    for drone_id in mission.drone_ids:
                        if drone_id in connected_drones:
                            connected_drones.remove(drone_id)
                        drone = Drone.query.get(drone_id)
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
                process.kill()
        stream_dir = os.path.join(app.root_path, 'hls_streams', drone_id)
        if os.path.exists(stream_dir):
            shutil.rmtree(stream_dir)
    print("All FFmpeg processes shut down.")
atexit.register(shutdown_ffmpeg_processes)

# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    threading.Thread(target=simulate_drone_telemetry, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)