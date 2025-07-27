import os
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from werkzeug.security import generate_password_hash, check_password_hash

# --- Load Environment & Initialize App ---
load_dotenv()
app = Flask(__name__)

# --- Configurations ---
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'admin-secret-key-super-secure')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/dronedb')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Initializations ---
CORS(app, resources={r"/api/admin/*": {"origins": "*"}})
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# --- Helper ---
def parse_iso_date(date_string):
    if not date_string: return None
    try: return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
    except (ValueError, TypeError): return None

# --- Re-defined Database Models (to make this app self-contained) ---
class Drone(db.Model):
    __tablename__ = 'drones'
    id = Column(String, primary_key=True)
    name = Column(String(100), nullable=False)
    model = Column(String(100))
    manufacturer = Column(String(100))
    status = Column(String(50), default='Offline')
    location = Column(String(100))
    flight_hours = Column(Float, default=0.0)
    def to_dict(self): return {k: getattr(self, k) for k in self.__table__.columns.keys()}

class Mission(db.Model):
    __tablename__ = 'missions'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default='Scheduled')
    drone_id = Column(String(50), nullable=False)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    details = Column(Text)
    def to_dict(self): return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in self.__dict__.items() if not k.startswith('_')}

class Media(db.Model):
    __tablename__ = 'media'
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    type = Column(String(50))
    url = Column(String(500), nullable=False)
    drone_id = Column(String(50))
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    description = Column(Text)
    def to_dict(self): return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in self.__dict__.items() if not k.startswith('_')}

class Incident(db.Model):
    __tablename__ = 'incidents'
    id = Column(Integer, primary_key=True)
    message = Column(Text, nullable=False)
    type = Column(String(50), default='alert')
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved = Column(Boolean, default=False)
    def to_dict(self): return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in self.__dict__.items() if not k.startswith('_')}

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    def to_dict(self): return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

class Admin(db.Model):
    __tablename__ = 'admins'
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    def set_password(self, password): self.password_hash = generate_password_hash(password)
    def check_password(self, password): return check_password_hash(self.password_hash, password)

class Asset(db.Model):
    __tablename__ = 'assets'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    status = Column(String(50), default='Available')
    model = Column(String(100))
    manufacturer = Column(String(100))
    user_id = Column(Integer, ForeignKey('user_profiles.id'))
    def to_dict(self): return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

class Checklist(db.Model):
    __tablename__ = 'checklists'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    items = Column(JSONB)
    user_id = Column(Integer, ForeignKey('user_profiles.id'))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    def to_dict(self): return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in self.__dict__.items() if not k.startswith('_')}

# --- Admin API Endpoints ---
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    admin = Admin.query.filter_by(username=data.get('username')).first()
    if admin and admin.check_password(data.get('password')):
        return jsonify({"message": "Admin login successful"}), 200
    return jsonify({"error": "Invalid admin credentials"}), 401

@app.route('/api/admin/stats', methods=['GET'])
def get_stats():
    return jsonify({
        "totalDrones": db.session.query(Drone).count(),
        "totalMissions": db.session.query(Mission).count(),
        "openIncidents": db.session.query(Incident).filter_by(resolved=False).count(),
        "totalUsers": db.session.query(UserProfile).count()
    }), 200

# --- Reusable CRUD Functions ---
def get_all_items(model):
    items = model.query.all()
    return jsonify([item.to_dict() for item in items]), 200

# --- Admin API Routes ---
@app.route('/api/admin/drones', methods=['GET'])
def handle_drones(): return get_all_items(Drone)

@app.route('/api/admin/missions', methods=['GET'])
def handle_missions(): return get_all_items(Mission)

@app.route('/api/admin/incidents', methods=['GET'])
def handle_incidents(): return get_all_items(Incident)

@app.route('/api/admin/media', methods=['GET'])
def handle_media(): return get_all_items(Media)

@app.route('/api/admin/assets', methods=['GET'])
def handle_assets(): return get_all_items(Asset)

@app.route('/api/admin/checklists', methods=['GET'])
def handle_checklists(): return get_all_items(Checklist)

@app.route('/api/admin/user_profiles', methods=['GET'])
def handle_users(): return get_all_items(UserProfile)

# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not Admin.query.first():
            print("Creating default admin user...")
            default_admin = Admin(username='admin')
            default_admin.set_password('password')
            db.session.add(default_admin)
            db.session.commit()
            print("Default admin created: user='admin', pass='password'")
    socketio.run(app, debug=True, port=5001)