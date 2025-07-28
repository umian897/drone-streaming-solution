from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import uuid
import datetime
import random
import time
import threading
from functools import wraps
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")


db = {
    "users": {
        "user1": {
            "id": "user1",
            "username": "admin",
            "password": "password123",  # In production, hash passwords!
            "name": "Admin User",
            "email": "admin@airvibe.com",
            "profilePicture": "https://placehold.co/150x150/5cb85c/ffffff?text=ADM",
            "totalFlights": 150,
            "totalFlightTime": "320h",
            "averageFlightTime": "2.1h",
            "role": "admin" # NEW: Admin role
        },
        "user2": {
            "id": "user2",
            "username": "john.doe",
            "password": "password123",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "profilePicture": "https://placehold.co/150x150/3498db/ffffff?text=JD",
            "totalFlights": 50,
            "totalFlightTime": "80h",
            "averageFlightTime": "1.6h",
            "role": "user" # NEW: Regular user role
        }
    },
    "drones": [
        {
            "id": "d1",
            "name": "AirVibe Falcon 100",
            "model": "AV-F100",
            "manufacturer": "AirVibe Tech",
            "uniqueId": "DRN-AV-001",
            "status": "Available",
            "lastLocation": "Hangar 3, Muscat",
            "flightHours": 125.5,
            "payloadCapacity": 2.5,
            "imageUrl": "https://placehold.co/400x300/4a90e2/ffffff?text=AirVibe+F100",
            "type": "Drone",
            "maintenanceHistory": [
                {"date": "2025-06-01", "description": "Annual check-up, firmware update.", "performedBy": "Tech Team A", "cost": 150},
                {"date": "2025-03-10", "description": "Propeller replacement after minor incident.", "performedBy": "Tech Team B", "cost": 75},
            ],
        },
        {
            "id": "d2",
            "name": "SkyGuard Sentinel",
            "model": "SG-S200",
            "manufacturer": "SkyGuard Systems",
            "uniqueId": "DRN-SG-002",
            "status": "Deployed",
            "lastLocation": "Mission Alpha, Site C",
            "flightHours": 89.2,
            "payloadCapacity": 1.8,
            "imageUrl": "https://placehold.co/400x300/7ed321/ffffff?text=SkyGuard+S200",
            "type": "Drone",
            "maintenanceHistory": [
                {"date": "2025-07-05", "description": "Pre-deployment system check.", "performedBy": "Pilot John Doe"},
            ],
        },
        {
            "id": "d3",
            "name": "AeroScout Pro",
            "model": "ASP-300",
            "manufacturer": "AeroDyne Solutions",
            "uniqueId": "DRN-AD-003",
            "status": "In Maintenance",
            "lastLocation": "Workshop Bay 1",
            "flightHours": 210.0,
            "payloadCapacity": 3.0,
            "imageUrl": "https://placehold.co/400x300/f5a623/ffffff?text=AeroScout+P300",
            "type": "Drone",
            "maintenanceHistory": [
                {"date": "2025-07-18", "description": "Scheduled 200-hour service and sensor calibration.", "performedBy": "Certified Service"},
            ],
        },
    ],
    "ground_stations": [
        {
            "id": "gs1",
            "name": "BaseLink Pro",
            "model": "BL-P500",
            "manufacturer": "CommLink Corp",
            "uniqueId": "GS-CL-001",
            "status": "Available",
            "coverageArea": "5 km radius",
            "powerSource": "Solar/Battery",
            "imageUrl": "https://placehold.co/400x300/9b59b6/ffffff?text=BaseLink+Pro",
            "type": "Ground Station",
            "maintenanceHistory": [
                {"date": "2025-05-20", "description": "System diagnostic and antenna alignment.", "performedBy": "Field Engineer"},
                {"date": "2024-11-15", "description": "Firmware upgrade and battery replacement.", "performedBy": "Service Partner", "cost": 300},
            ],
        },
        {
            "id": "gs2",
            "name": "FieldNode X",
            "model": "FN-X100",
            "manufacturer": "GeoConnect",
            "uniqueId": "GS-GC-002",
            "status": "Deployed",
            "coverageArea": "2 km radius",
            "powerSource": "Generator",
            "imageUrl": "https://placehold.co/400x300/34495e/ffffff?text=FieldNode+X",
            "type": "Ground Station",
            "maintenanceHistory": [
                {"date": "2025-07-01", "description": "Routine power supply check.", "performedBy": "Local Team"},
            ],
        },
    ],
    "equipment": [
        {
            "id": "eq1",
            "name": "High-Res Camera X1",
            "model": "HRC-X1",
            "manufacturer": "OptiLens",
            "uniqueId": "EQ-OL-001",
            "status": "Available",
            "equipmentType": "Camera",
            "compatibility": "AV-F100, SG-S200",
            "imageUrl": "https://placehold.co/400x300/1abc9c/ffffff?text=Camera+X1",
            "type": "Equipment",
            "maintenanceHistory": [
                {"date": "2025-04-01", "description": "Lens cleaning and sensor calibration.", "performedBy": "Internal Tech"},
            ],
        },
        {
            "id": "eq2",
            "name": "Thermal Sensor T3",
            "model": "TS-T3",
            "manufacturer": "InfraScan",
            "uniqueId": "EQ-IS-002",
            "status": "In Maintenance",
            "equipmentType": "Sensor",
            "compatibility": "AV-F100",
            "imageUrl": "https://placehold.co/400x300/e67e22/ffffff?text=Thermal+Sensor",
            "type": "Equipment",
            "maintenanceHistory": [
                {"date": "2025-07-10", "description": "Thermal array recalibration.", "performedBy": "Manufacturer Service", "cost": 250},
            ],
        },
    ],
    "batteries": [
        {
            "id": "bat1",
            "name": "Drone Battery XL",
            "model": "DB-XL5000",
            "manufacturer": "PowerCell Inc.",
            "uniqueId": "BAT-PC-001",
            "status": "Available",
            "capacity": 5000,
            "cycleCount": 45,
            "lastCharged": "2025-07-19",
            "imageUrl": "https://placehold.co/400x300/3498db/ffffff?text=Battery+XL",
            "type": "Battery",
            "maintenanceHistory": [
                {"date": "2025-06-15", "description": "Routine cycle check, cell balancing.", "performedBy": "Internal Tech"},
            ],
        },
        {
            "id": "bat2",
            "name": "Compact Drone Battery",
            "model": "CDB-2500",
            "manufacturer": "VoltTech",
            "uniqueId": "BAT-VT-002",
            "status": "In Maintenance",
            "capacity": 2500,
            "cycleCount": 120,
            "lastCharged": "2025-07-10",
            "imageUrl": "https://placehold.co/400x300/f1c40f/ffffff?text=Battery+CDB",
            "type": "Battery",
            "maintenanceHistory": [
                {"date": "2025-07-12", "description": "Capacity degradation test, cell replacement.", "performedBy": "Specialized Repair", "cost": 100},
            ],
        },
    ],
    "missions": [
        {
            "id": "m1",
            "name": "Coastal Survey Oman",
            "drone_id": "d1",
            "start_time": "2025-08-01T09:00:00Z",
            "end_time": "2025-08-01T12:00:00Z",
            "details": "High-resolution mapping of the northern Omani coastline.",
            "status": "Scheduled",
            "progress": 0
        },
        {
            "id": "m2",
            "name": "Oil Pipeline Inspection",
            "drone_id": "d2",
            "start_time": "2025-07-27T14:30:00Z",
            "end_time": "2025-07-27T16:00:00Z",
            "details": "Infrared inspection of critical pipeline sections.",
            "status": "Active",
            "progress": 75
        }
    ],
    "media": [
        {
            "id": "media1",
            "title": "Muscat Port Overview",
            "type": "image",
            "url": "https://placehold.co/600x400/3498db/ffffff?text=Muscat+Port",
            "thumbnail": "https://placehold.co/300x200/3498db/ffffff?text=Muscat+Port+Thumb",
            "droneId": "d1",
            "missionId": "m1",
            "timestamp": "2025-07-26T10:30:00Z",
            "gps": "23.6139° N, 58.5922° E",
            "tags": ["port", "survey", "city"],
            "description": "Aerial view of Muscat port captured during routine survey.",
            "date": "2025-07-26"
        },
        {
            "id": "media2",
            "title": "Desert Patrol Footage",
            "type": "video",
            "url": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "thumbnail": "https://placehold.co/300x200/cccccc/333333?text=Video+Placeholder",
            "droneId": "d2",
            "missionId": "m2",
            "timestamp": "2025-07-25T15:10:00Z",
            "gps": "22.5000° N, 57.0000° E",
            "tags": ["patrol", "desert", "inspection"],
            "description": "Footage from a desert surveillance mission.",
            "date": "2025-07-25"
        },
        {
            "id": "media3",
            "title": "Infrastructure Damage",
            "type": "image",
            "url": "https://placehold.co/600x400/e74c3c/ffffff?text=Damage+Report",
            "thumbnail": "https://placehold.co/300x200/e74c3c/ffffff?text=Damage+Report+Thumb",
            "droneId": "d1",
            "missionId": "m1",
            "timestamp": "2025-07-28T09:15:00Z",
            "gps": "23.6130° N, 58.5910° E",
            "tags": ["incident", "damage", "report"],
            "description": "Minor damage spotted on coastal infrastructure.",
            "date": "2025-07-28"
        }
    ],
    "files": [
        {
            "id": "f1",
            "name": "Drone X1 Flight Manual",
            "type": "PDF",
            "url": "https://www.africau.edu/images/default/sample.pdf",
            "category": "Flight Manuals",
            "uploadDate": "2025-01-10",
            "description": "Official flight manual for Drone X1 model."
        },
        {
            "id": "f2",
            "name": "Safety Protocol V2.0",
            "type": "PDF",
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "category": "Safety Protocols",
            "uploadDate": "2025-03-05",
            "description": "Updated safety guidelines for all drone operations.",
        },
        {
            "id": "f3",
            "name": "Incident Report Template",
            "type": "DOCX",
            "url": "https://docs.google.com/document/d/1B_e0dY0_q_s_J_h_2_x_f_3_y_4_z_5_a_6_b_7_c_8_d_9_e_0",
            "category": "Templates",
            "uploadDate": "2025-06-20",
            "description": "Standard template for reporting operational incidents.",
        },
    ],
    "checklists": [
        {
            "id": "cl1",
            "name": "Pre-Flight Checklist (Standard)",
            "description": "Standard checks before every drone flight.",
            "items": [
                {"id": "item1", "text": "Battery charged and secured", "completed": False, "notes": ""},
                {"id": "item2", "text": "Propellers attached correctly", "completed": False, "notes": ""},
                {"id": "item3", "text": "Gimbal lock removed", "completed": False, "notes": ""},
                {"id": "item4", "text": "GPS signal acquired", "completed": False, "notes": ""},
                {"id": "item5", "text": "Clearance for takeoff", "completed": False, "notes": ""},
            ],
            "type": "template",
            "dateCompleted": None,
            "completedBy": None,
            "completionNotes": None,
        },
        {
            "id": "cl2",
            "name": "Post-Flight Inspection",
            "description": "Checks to perform after landing and before storage.",
            "items": [
                {"id": "item6", "text": "Drone powered off", "completed": False, "notes": ""},
                {"id": "item7", "text": "Battery removed and cooled", "completed": False, "notes": ""},
                {"id": "item8", "text": "Visual inspection for damage", "completed": False, "notes": ""},
            ],
            "type": "template",
            "dateCompleted": None,
            "completedBy": None,
            "completionNotes": None,
        },
        {
            "id": "cl3",
            "name": "Maintenance Check (Weekly)",
            "description": "Weekly maintenance routine for drone fleet.",
            "items": [
                {"id": "item9", "text": "Clean drone body", "completed": True, "notes": "Used compressed air."},
                {"id": "item10", "text": "Check motor bearings", "completed": True, "notes": "All good."},
                {"id": "item11", "text": "Software update check", "completed": False, "notes": ""},
            ],
            "type": "completed",
            "dateCompleted": "2025-07-10",
            "completedBy": "Tech John",
            "completionNotes": "All routine checks passed, minor dust cleaning performed."
        },
    ],
    "tags": [
        {"id": "t1", "name": "Security", "description": "Tags related to security operations."},
        {"id": "t2", "name": "Inspection", "description": "Tags for inspection missions and media."},
        {"id": "t3", "name": "Maintenance", "description": "Tags for maintenance activities and assets."},
        {"id": "t4", "name": "Aerial Survey", "description": "Tags for general aerial surveying."},
    ],
    "incidents": [
        {
            "id": "inc1",
            "type": "alert",
            "message": "Drone d2 battery critical (10%) during mission m2.",
            "timestamp": "2025-07-27T15:45:00Z",
            "resolved": False
        },
        {
            "id": "inc2",
            "type": "warning",
            "message": "Unauthorized drone activity detected near restricted airspace.",
            "timestamp": "2025-07-26T22:00:00Z",
            "resolved": True
        }
    ],
    "maintenance_parts": [
        {
            "id": "mp1",
            "name": "Propeller Set A",
            "status": "Available",
            "lastMaintenance": "2025-07-01T00:00:00Z",
            "nextMaintenance": "2025-09-01T00:00:00Z",
        },
        {
            "id": "mp2",
            "name": "Gimbal Stabilizer Unit",
            "status": "In Repair",
            "lastMaintenance": "2025-07-20T00:00:00Z",
            "nextMaintenance": "2025-08-10T00:00:00Z",
        }
    ],
    "notifications": [
        {
            "id": "notif1",
            "message": "Drone d1 gateway connected.",
            "type": "info",
            "read": False,
            "timestamp": "2025-07-28T09:05:00Z"
        },
        {
            "id": "notif2",
            "message": "New mission 'Coastal Survey Oman' scheduled.",
            "type": "success",
            "read": False,
            "timestamp": "2025-07-27T18:00:00Z"
        },
        {
            "id": "notif3",
            "message": "System update successfully applied.",
            "type": "info",
            "read": True,
            "timestamp": "2025-07-20T10:00:00Z"
        }
    ],
    "connected_drones": ["d1"],
    "live_telemetry": {
        "d1": {"altitude": 50, "speed": 10, "battery_percent": 85, "latitude": 23.5859, "longitude": 58.4059, "status": "flying"},
        "d2": {"altitude": 0, "speed": 0, "battery_percent": 90, "latitude": 24.0000, "longitude": 57.0000, "status": "landed"},
        "d3": {"altitude": 0, "speed": 0, "battery_percent": 70, "latitude": 23.0000, "longitude": 56.0000, "status": "maintenance"},
    }
}
# --- Helper Functions ---
def find_item_by_id(item_list, item_id):
    """Finds an item in a list by its 'id' key."""
    return next((item for item in item_list if item["id"] == item_id), None)
def update_item_by_id(item_list, item_id, new_data):
    """Updates an item in a list by its 'id' key and returns the updated item."""
    for i, item in enumerate(item_list):
        if item["id"] == item_id:
            item.update(new_data)
            return item
    return None
def delete_item_by_id(item_list, item_id):
    """Deletes an item from a list by its 'id' key."""
    initial_len = len(item_list)
    updated_list = [item for item in item_list if item["id"] != item_id]
    if len(updated_list) < initial_len:
        return updated_list, True
    return item_list, False
def get_current_user_from_request():
    auth_token = request.headers.get('X-Auth-Token')
    if auth_token == "mock-jwt-token-123":
        return db["users"]["user1"] # Admin user
    elif auth_token == "mock-jwt-token-user":
        return db["users"]["user2"] # Regular user
    return None
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = get_current_user_from_request()
        if current_user is None:
            return jsonify({"error": "Authentication required"}), 401
        # Store user in Flask's global context if needed for the request
        request.current_user = current_user
        return f(*args, **kwargs)
    return decorated_function
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = get_current_user_from_request()
        if current_user is None:
            return jsonify({"error": "Authentication required"}), 401
        if current_user.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        request.current_user = current_user # Store for use in endpoint
        return f(*args, **kwargs)
    return decorated_function
# --- Authentication Endpoint ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    # Find user by username
    user_found = None
    for user_id, user_data in db["users"].items():
        if user_data["username"] == username:
            user_found = user_data
            break
    if user_found and user_found["password"] == password:
        # In a real app, generate a JWT with user_id and role
        # For this demo, we'll return different tokens for admin/user
        token = "mock-jwt-token-123" if user_found["role"] == "admin" else "mock-jwt-token-user"
        user_response = user_found.copy()
        user_response.pop("password", None) # Don't send password to frontend
        return jsonify({"message": "Login successful", "token": token, "user": user_response}), 200
    return jsonify({"error": "Invalid credentials"}), 401
# --- Admin-Specific API Endpoints (Protected) ---
@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    users_list = []
    for user_id, user_data in db["users"].items():
        user_copy = user_data.copy()
        user_copy.pop("password", None) # Never send passwords
        users_list.append(user_copy)
    return jsonify(list(users_list)), 200 # Convert dict_values to list
@app.route('/api/admin/users', methods=['POST'])
@admin_required
def create_user():
    data = request.json
    new_user_id = str(uuid.uuid4())
    new_user = {
        "id": new_user_id,
        "username": data.get("username"),
        "password": data.get("password"), # In real app, hash this!
        "name": data.get("name"),
        "email": data.get("email"),
        "profilePicture": data.get("profilePicture", "https://placehold.co/150x150/random/random?text=New+User"),
        "totalFlights": data.get("totalFlights", 0),
        "totalFlightTime": data.get("totalFlightTime", "0h"),
        "averageFlightTime": data.get("averageFlightTime", "0h"),
        "role": data.get("role", "user") # Default to 'user' if not specified
    }
    if not new_user["username"] or not new_user["password"] or not new_user["name"]:
        return jsonify({"error": "Username, password, and name are required"}), 400
    # Check if username already exists
    for user_id, user_data in db["users"].items():
        if user_data["username"] == new_user["username"]:
            return jsonify({"error": "Username already exists"}), 409 # Conflict
    db["users"][new_user_id] = new_user
    user_response = new_user.copy()
    user_response.pop("password", None)
    return jsonify(user_response), 201
@app.route('/api/admin/users/<string:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    data = request.json
    user = db["users"].get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    # Prevent changing own role if not admin (more complex logic for self-management)
    # For simplicity, admin can change any user's role.
    user.update(data)
    # If password is in data, it means it's being updated (in real app, hash it)
    user_response = user.copy()
    user_response.pop("password", None)
    return jsonify(user_response), 200
@app.route('/api/admin/users/<string:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    if user_id not in db["users"]:
        return jsonify({"error": "User not found"}), 404
    if user_id == request.current_user["id"]: # Prevent admin from deleting themselves
        return jsonify({"error": "Cannot delete your own admin account"}), 403
    del db["users"][user_id]
    return jsonify({"message": "User deleted"}), 204
# --- General API Endpoints (Can be protected with @login_required if needed) ---
# Drones
@app.route('/api/drones', methods=['GET'])
# @login_required # Uncomment to protect
def get_drones():
    return jsonify(db["drones"]), 200
@app.route('/api/drones', methods=['POST'])
# @login_required
def add_drone():
    data = request.json
    new_drone = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "model": data.get("model"),
        "manufacturer": data.get("manufacturer"),
        "uniqueId": data.get("uniqueId"),
        "status": data.get("status", "Available"),
        "lastLocation": data.get("lastLocation", "N/A"),
        "flightHours": data.get("flightHours", 0.0),
        "payloadCapacity": data.get("payloadCapacity", 0.0),
        "imageUrl": data.get("imageUrl", f"https://placehold.co/400x300/random/random?text={data.get('name', 'Drone').replace(' ', '+')}"),
        "type": "Drone",
        "maintenanceHistory": data.get("maintenanceHistory", []),
    }
    db["drones"].append(new_drone)
    return jsonify(new_drone), 201
@app.route('/api/drones/<string:drone_id>', methods=['GET'])
# @login_required
def get_drone(drone_id):
    drone = find_item_by_id(db["drones"], drone_id)
    if drone:
        return jsonify(drone), 200
    return jsonify({"error": "Drone not found"}), 404
@app.route('/api/drones/<string:drone_id>', methods=['PUT'])
# @login_required
def update_drone(drone_id):
    data = request.json
    updated_drone = update_item_by_id(db["drones"], drone_id, data)
    if updated_drone:
        return jsonify(updated_drone), 200
    return jsonify({"error": "Drone not found"}), 404
@app.route('/api/drones/<string:drone_id>', methods=['DELETE'])
# @login_required
def delete_drone(drone_id):
    global db
    new_drones_list, success = delete_item_by_id(db["drones"], drone_id)
    if success:
        db["drones"] = new_drones_list
        return jsonify({"message": "Drone deleted"}), 204
    return jsonify({"error": "Drone not found"}), 404
# Ground Stations
@app.route('/api/ground_stations', methods=['GET'])
# @login_required
def get_ground_stations():
    return jsonify(db["ground_stations"]), 200
@app.route('/api/ground_stations', methods=['POST'])
# @login_required
def add_ground_station():
    data = request.json
    new_gs = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "model": data.get("model"),
        "manufacturer": data.get("manufacturer"),
        "uniqueId": data.get("uniqueId"),
        "status": data.get("status", "Available"),
        "coverageArea": data.get("coverageArea", "N/A"),
        "powerSource": data.get("powerSource", "N/A"),
        "imageUrl": data.get("imageUrl", f"https://placehold.co/400x300/random/random?text={data.get('name', 'Ground+Station').replace(' ', '+')}"),
        "type": "Ground Station",
        "maintenanceHistory": data.get("maintenanceHistory", []),
    }
    db["ground_stations"].append(new_gs)
    return jsonify(new_gs), 201
@app.route('/api/ground_stations/<string:gs_id>', methods=['GET'])
# @login_required
def get_ground_station(gs_id):
    gs = find_item_by_id(db["ground_stations"], gs_id)
    if gs:
        return jsonify(gs), 200
    return jsonify({"error": "Ground Station not found"}), 404
@app.route('/api/ground_stations/<string:gs_id>', methods=['PUT'])
# @login_required
def update_ground_station(gs_id):
    data = request.json
    updated_gs = update_item_by_id(db["ground_stations"], gs_id, data)
    if updated_gs:
        return jsonify(updated_gs), 200
    return jsonify({"error": "Ground Station not found"}), 404
@app.route('/api/ground_stations/<string:gs_id>', methods=['DELETE'])
# @login_required
def delete_ground_station(gs_id):
    global db
    new_gs_list, success = delete_item_by_id(db["ground_stations"], gs_id)
    if success:
        db["ground_stations"] = new_gs_list
        return jsonify({"message": "Ground Station deleted"}), 204
    return jsonify({"error": "Ground Station not found"}), 404
# Equipment
@app.route('/api/equipment', methods=['GET'])
# @login_required
def get_equipment():
    return jsonify(db["equipment"]), 200
@app.route('/api/equipment', methods=['POST'])
# @login_required
def add_equipment():
    data = request.json
    new_eq = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "model": data.get("model"),
        "manufacturer": data.get("manufacturer"),
        "uniqueId": data.get("uniqueId"),
        "status": data.get("status", "Available"),
        "equipmentType": data.get("equipmentType", "General"),
        "compatibility": data.get("compatibility", "N/A"),
        "imageUrl": data.get("imageUrl", f"https://placehold.co/400x300/random/random?text={data.get('name', 'Equipment').replace(' ', '+')}"),
        "type": "Equipment",
        "maintenanceHistory": data.get("maintenanceHistory", []),
    }
    db["equipment"].append(new_eq)
    return jsonify(new_eq), 201
@app.route('/api/equipment/<string:eq_id>', methods=['GET'])
# @login_required
def get_single_equipment(eq_id):
    eq = find_item_by_id(db["equipment"], eq_id)
    if eq:
        return jsonify(eq), 200
    return jsonify({"error": "Equipment not found"}), 404
@app.route('/api/equipment/<string:eq_id>', methods=['PUT'])
# @login_required
def update_equipment(eq_id):
    data = request.json
    updated_eq = update_item_by_id(db["equipment"], eq_id, data)
    if updated_eq:
        return jsonify(updated_eq), 200
    return jsonify({"error": "Equipment not found"}), 404
@app.route('/api/equipment/<string:eq_id>', methods=['DELETE'])
# @login_required
def delete_equipment(eq_id):
    global db
    new_eq_list, success = delete_item_by_id(db["equipment"], eq_id)
    if success:
        db["equipment"] = new_eq_list
        return jsonify({"message": "Equipment deleted"}), 204
    return jsonify({"error": "Equipment not found"}), 404
# Batteries
@app.route('/api/batteries', methods=['GET'])
# @login_required
def get_batteries():
    return jsonify(db["batteries"]), 200
@app.route('/api/batteries', methods=['POST'])
# @login_required
def add_battery():
    data = request.json
    new_bat = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "model": data.get("model"),
        "manufacturer": data.get("manufacturer"),
        "uniqueId": data.get("uniqueId"),
        "status": data.get("status", "Available"),
        "capacity": data.get("capacity", 0),
        "cycleCount": data.get("cycleCount", 0),
        "lastCharged": data.get("lastCharged", ""),
        "imageUrl": data.get("imageUrl", f"https://placehold.co/400x300/random/random?text={data.get('name', 'Battery').replace(' ', '+')}"),
        "type": "Battery",
        "maintenanceHistory": data.get("maintenanceHistory", []),
    }
    db["batteries"].append(new_bat)
    return jsonify(new_bat), 201
@app.route('/api/batteries/<string:bat_id>', methods=['GET'])
# @login_required
def get_battery(bat_id):
    bat = find_item_by_id(db["batteries"], bat_id)
    if bat:
        return jsonify(bat), 200
    return jsonify({"error": "Battery not found"}), 404
@app.route('/api/batteries/<string:bat_id>', methods=['PUT'])
# @login_required
def update_battery(bat_id):
    data = request.json
    updated_bat = update_item_by_id(db["batteries"], bat_id, data)
    if updated_bat:
        return jsonify(updated_bat), 200
    return jsonify({"error": "Battery not found"}), 404
@app.route('/api/batteries/<string:bat_id>', methods=['DELETE'])
# @login_required
def delete_battery(bat_id):
    global db
    new_bat_list, success = delete_item_by_id(db["batteries"], bat_id)
    if success:
        db["batteries"] = new_bat_list
        return jsonify({"message": "Battery deleted"}), 204
    return jsonify({"error": "Battery not found"}), 404
# Missions
@app.route('/api/missions', methods=['GET'])
# @login_required
def get_missions():
    return jsonify(db["missions"]), 200
@app.route('/api/missions', methods=['POST'])
# @login_required
def add_mission():
    data = request.json
    new_mission = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "drone_id": data.get("drone_id"),
        "start_time": data.get("start_time"),
        "end_time": data.get("end_time"),
        "details": data.get("details"),
        "status": data.get("status", "Scheduled"),
        "progress": data.get("progress", 0)
    }
    db["missions"].append(new_mission)
    return jsonify(new_mission), 201
@app.route('/api/missions/<string:mission_id>', methods=['GET'])
# @login_required
def get_mission(mission_id):
    mission = find_item_by_id(db["missions"], mission_id)
    if mission:
        return jsonify(mission), 200
    return jsonify({"error": "Mission not found"}), 404
@app.route('/api/missions/<string:mission_id>', methods=['PUT'])
# @login_required
def update_mission(mission_id):
    data = request.json
    updated_mission = update_item_by_id(db["missions"], mission_id, data)
    if updated_mission:
        return jsonify(updated_mission), 200
    return jsonify({"error": "Mission not found"}), 404
@app.route('/api/missions/<string:mission_id>', methods=['DELETE'])
# @login_required
def delete_mission(mission_id):
    global db
    new_missions_list, success = delete_item_by_id(db["missions"], mission_id)
    if success:
        db["missions"] = new_missions_list
        return jsonify({"message": "Mission deleted"}), 204
    return jsonify({"error": "Mission not found"}), 404
# Media
@app.route('/api/media', methods=['GET'])
# @login_required
def get_media():
    return jsonify(db["media"]), 200
@app.route('/api/media', methods=['POST'])
# @login_required
def add_media():
    data = request.json
    new_media = {
        "id": str(uuid.uuid4()),
        "title": data.get("title"),
        "type": data.get("type"),
        "url": data.get("url"),
        "thumbnail": data.get("thumbnail"),
        "droneId": data.get("drone_id"),
        "missionId": data.get("mission_id"),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z',
        "gps": data.get("gps", "N/A"),
        "tags": data.get("tags", []),
        "description": data.get("description", ""),
        "date": datetime.date.today().isoformat()
    }
    db["media"].append(new_media)
    socketio.emit('new_media_available', new_media)
    return jsonify(new_media), 201
@app.route('/api/media/<string:media_id>', methods=['GET'])
# @login_required
def get_single_media(media_id):
    media_item = find_item_by_id(db["media"], media_id)
    if media_item:
        return jsonify(media_item), 200
    return jsonify({"error": "Media item not found"}), 404
@app.route('/api/media/<string:media_id>', methods=['PUT'])
# @login_required
def update_media(media_id):
    data = request.json
    if 'tags' in data and isinstance(data['tags'], str):
        data['tags'] = [tag.strip() for tag in data['tags'].split(',') if tag.strip()]
    updated_media = update_item_by_id(db["media"], media_id, data)
    if updated_media:
        return jsonify(updated_media), 200
    return jsonify({"error": "Media item not found"}), 404
@app.route('/api/media/<string:media_id>', methods=['DELETE'])
# @login_required
def delete_media(media_id):
    global db
    new_media_list, success = delete_item_by_id(db["media"], media_id)
    if success:
        db["media"] = new_media_list
        return jsonify({"message": "Media item deleted"}), 204
    return jsonify({"error": "Media item not found"}), 404
# Files
@app.route('/api/files', methods=['GET'])
# @login_required
def get_files():
    return jsonify(db["files"]), 200
@app.route('/api/files', methods=['POST'])
# @login_required
def add_file():
    data = request.json
    new_file = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "type": data.get("type"),
        "url": data.get("url"),
        "category": data.get("category"),
        "uploadDate": datetime.date.today().isoformat(),
        "description": data.get("description", ""),
        "size": data.get("size", f"{random.randint(1, 10)}MB")
    }
    db["files"].append(new_file)
    return jsonify(new_file), 201
@app.route('/api/files/<string:file_id>', methods=['GET'])
# @login_required
def get_file(file_id):
    file_item = find_item_by_id(db["files"], file_id)
    if file_item:
        return jsonify(file_item), 200
    return jsonify({"error": "File not found"}), 404
@app.route('/api/files/<string:file_id>', methods=['PUT'])
# @login_required
def update_file(file_id):
    data = request.json
    updated_file = update_item_by_id(db["files"], file_id, data)
    if updated_file:
        return jsonify(updated_file), 200
    return jsonify({"error": "File not found"}), 404
@app.route('/api/files/<string:file_id>', methods=['DELETE'])
# @login_required
def delete_file(file_id):
    global db
    new_files_list, success = delete_item_by_id(db["files"], file_id)
    if success:
        db["files"] = new_files_list
        return jsonify({"message": "File deleted"}), 204
    return jsonify({"error": "File not found"}), 404
# Checklists
@app.route('/api/checklists', methods=['GET'])
# @login_required
def get_checklists():
    return jsonify(db["checklists"]), 200
@app.route('/api/checklists', methods=['POST'])
# @login_required
def add_checklist():
    data = request.json
    new_checklist = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "description": data.get("description", ""),
        "items": data.get("items", []),
        "type": data.get("type", "template"),
        "dateCompleted": data.get("dateCompleted"),
        "completedBy": data.get("completedBy"),
        "completionNotes": data.get("completionNotes")
    }
    db["checklists"].append(new_checklist)
    return jsonify(new_checklist), 201
@app.route('/api/checklists/<string:checklist_id>', methods=['GET'])
# @login_required
def get_checklist(checklist_id):
    checklist = find_item_by_id(db["checklists"], checklist_id)
    if checklist:
        return jsonify(checklist), 200
    return jsonify({"error": "Checklist not found"}), 404
@app.route('/api/checklists/<string:checklist_id>', methods=['PUT'])
# @login_required
def update_checklist(checklist_id):
    data = request.json
    updated_checklist = update_item_by_id(db["checklists"], checklist_id, data)
    if updated_checklist:
        return jsonify(updated_checklist), 200
    return jsonify({"error": "Checklist not found"}), 404
@app.route('/api/checklists/<string:checklist_id>', methods=['DELETE'])
# @login_required
def delete_checklist(checklist_id):
    global db
    new_checklists_list, success = delete_item_by_id(db["checklists"], checklist_id)
    if success:
        db["checklists"] = new_checklists_list
        return jsonify({"message": "Checklist deleted"}), 204
    return jsonify({"error": "Checklist not found"}), 404
# Tags
@app.route('/api/tags', methods=['GET'])
# @login_required
def get_tags():
    return jsonify(db["tags"]), 200
@app.route('/api/tags', methods=['POST'])
# @login_required
def add_tag():
    data = request.json
    new_tag = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "description": data.get("description", "")
    }
    db["tags"].append(new_tag)
    return jsonify(new_tag), 201
@app.route('/api/tags/<string:tag_id>', methods=['GET'])
# @login_required
def get_tag(tag_id):
    tag = find_item_by_id(db["tags"], tag_id)
    if tag:
        return jsonify(tag), 200
    return jsonify({"error": "Tag not found"}), 404
@app.route('/api/tags/<string:tag_id>', methods=['PUT'])
# @login_required
def update_tag(tag_id):
    data = request.json
    updated_tag = update_item_by_id(db["tags"], tag_id, data)
    if updated_tag:
        return jsonify(updated_tag), 200
    return jsonify({"error": "Tag not found"}), 404
@app.route('/api/tags/<string:tag_id>', methods=['DELETE'])
# @login_required
def delete_tag(tag_id):
    global db
    new_tags_list, success = delete_item_by_id(db["tags"], tag_id)
    if success:
        db["tags"] = new_tags_list
        return jsonify({"message": "Tag deleted"}), 204
    return jsonify({"error": "Tag not found"}), 404
# Incidents
@app.route('/api/incidents', methods=['GET'])
# @login_required
def get_incidents():
    return jsonify(db["incidents"]), 200
@app.route('/api/incidents', methods=['POST'])
# @login_required
def add_incident():
    data = request.json
    new_incident = {
        "id": str(uuid.uuid4()),
        "type": data.get("type", "info"),
        "message": data.get("message"),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z',
        "resolved": data.get("resolved", False)
    }
    db["incidents"].append(new_incident)
    socketio.emit('new_notification', new_incident)
    return jsonify(new_incident), 201
@app.route('/api/incidents/<string:incident_id>', methods=['GET'])
# @login_required
def get_incident(incident_id):
    incident = find_item_by_id(db["incidents"], incident_id)
    if incident:
        return jsonify(incident), 200
    return jsonify({"error": "Incident not found"}), 404
@app.route('/api/incidents/<string:incident_id>', methods=['PUT'])
# @login_required
def update_incident(incident_id):
    data = request.json
    updated_incident = update_item_by_id(db["incidents"], incident_id, data)
    if updated_incident:
        return jsonify(updated_incident), 200
    return jsonify({"error": "Incident not found"}), 40
@app.route('/api/incidents/<string:incident_id>', methods=['DELETE'])
# @login_required
def delete_incident(incident_id):
    global db
    new_incidents_list, success = delete_item_by_id(db["incidents"], incident_id)
    if success:
        db["incidents"] = new_incidents_list
        return jsonify({"message": "Incident deleted"}), 204
    return jsonify({"error": "Incident not found"}), 404
# Maintenance Parts
@app.route('/api/maintenance_parts', methods=['GET'])
# @login_required
def get_maintenance_parts():
    return jsonify(db["maintenance_parts"]), 200
@app.route('/api/maintenance_parts', methods=['POST'])
# @login_required
def add_maintenance_part():
    data = request.json
    new_part = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "status": data.get("status", "Available"),
        "lastMaintenance": data.get("last_maintenance", datetime.date.today().isoformat() + 'Z'),
        "nextMaintenance": data.get("next_maintenance", "")
    }
    db["maintenance_parts"].append(new_part)
    return jsonify(new_part), 201
@app.route('/api/maintenance_parts/<string:part_id>', methods=['GET'])
# @login_required
def get_maintenance_part(part_id):
    part = find_item_by_id(db["maintenance_parts"], part_id)
    if part:
        return jsonify(part), 200
    return jsonify({"error": "Maintenance part not found"}), 404
@app.route('/api/maintenance_parts/<string:part_id>', methods=['PUT'])
# @login_required
def update_maintenance_part(part_id):
    data = request.json
    updated_part = update_item_by_id(db["maintenance_parts"], part_id, data)
    if updated_part:
        return jsonify(updated_part), 200
    return jsonify({"error": "Maintenance part not found"}), 404
@app.route('/api/maintenance_parts/<string:part_id>', methods=['DELETE'])
# @login_required
def delete_maintenance_part(part_id):
    global db
    new_parts_list, success = delete_item_by_id(db["maintenance_parts"], part_id)
    if success:
        db["maintenance_parts"] = new_parts_list
        return jsonify({"message": "Maintenance part deleted"}), 204
    return jsonify({"error": "Maintenance part not found"}), 404
# Notifications
@app.route('/api/notifications', methods=['GET'])
# @login_required
def get_notifications():
    sorted_notifications = sorted(db["notifications"], key=lambda x: x.get('timestamp', ''), reverse=True)
    return jsonify(sorted_notifications), 200
@app.route('/api/notifications/mark_read/<string:notification_id>', methods=['POST'])
# @login_required
def mark_notification_read(notification_id):
    notif_to_update = find_item_by_id(db["notifications"], notification_id)
    if notif_to_update:
        notif_to_update["read"] = True
        socketio.emit('notification_updated', notif_to_update)
        return jsonify(notif_to_update), 200
    return jsonify({"error": "Notification not found"}), 404
@app.route('/api/notifications/mark_all_read', methods=['POST'])
# @login_required
def mark_all_notifications_read():
    for notif in db["notifications"]:
        notif["read"] = True
    socketio.emit('notifications_updated', db["notifications"])
    return jsonify({"message": "All notifications marked as read"}), 200
@app.route('/api/notifications/delete/<string:notification_id>', methods=['DELETE'])
# @login_required
def delete_notification(notification_id):
    global db
    new_notifications_list, success = delete_item_by_id(db["notifications"], notification_id)
    if success:
        db["notifications"] = new_notifications_list
        socketio.emit('notification_deleted', {"id": notification_id})
        return jsonify({"message": "Notification deleted"}), 204
    return jsonify({"error": "Notification not found"}), 404
@app.route('/api/notifications/delete_read', methods=['DELETE'])
# @login_required
def delete_all_read_notifications():
    global db
    initial_len = len(db["notifications"])
    db["notifications"] = [n for n in db["notifications"] if not n["read"]]
    if len(db["notifications"]) < initial_len:
        socketio.emit('notifications_updated', db["notifications"])
        return jsonify({"message": "All read notifications deleted"}), 204
    return jsonify({"message": "No read notifications to delete"}), 200
# User Profile
@app.route('/api/user/profile', methods=['GET'])
# @login_required

def get_user_profile():
    current_user_data = get_current_user_from_request()
    if current_user_data:
        user_copy = current_user_data.copy()
        user_copy.pop("password", None)
        return jsonify(user_copy), 200
    return jsonify({"error": "User profile not found"}), 404
@app.route('/api/user/profile', methods=['PUT'])
# @login_required
def update_user_profile():
    data = request.json
    current_user_data = get_current_user_from_request()
    if current_user_data:
        user_id = current_user_data["id"]
        user = db["users"].get(user_id)
        if user:
            if 'name' in data:
                user['name'] = data['name']
            if 'email' in data:
                user['email'] = data['email']
            user_copy = user.copy()
            user_copy.pop("password", None)
            return jsonify(user_copy), 200
    return jsonify({"error": "User not found"}), 404
@app.route('/api/user/change_password', methods=['POST'])
# @login_required
def change_password():
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    current_user_data = get_current_user_from_request()
    if current_user_data and current_user_data["password"] == current_password:
        user_id = current_user_data["id"]
        db["users"][user_id]["password"] = new_password
        return jsonify({"message": "Password changed successfully"}), 200
    return jsonify({"error": "Incorrect current password or user not found"}), 401
@app.route('/api/user/profile_picture', methods=['POST'])

# @login_required

def update_profile_picture():
    data = request.json
    new_url = data.get('profile_picture_url')
    current_user_data = get_current_user_from_request()
    if current_user_data:
        user_id = current_user_data["id"]
        db["users"][user_id]['profilePicture'] = new_url
        user_copy = db["users"][user_id].copy()
        user_copy.pop("password", None)
        return jsonify(user_copy), 200
    return jsonify({"error": "User not found"}), 404
@app.route('/api/connected_drones', methods=['GET'])
def get_connected_drones_api():
    return jsonify(db["connected_drones"]), 200
@app.route('/api/command_drone/<string:drone_id>', methods=['POST'])
def command_drone(drone_id):
    data = request.json
    command = data.get('command')
    params = data.get('params', {})
    if drone_id not in db["connected_drones"]:
        return jsonify({"error": f"Drone {drone_id} is not connected."}), 400
    print(f"Received command for drone {drone_id}: {command} with params {params}")
    current_telemetry = db["live_telemetry"].get(drone_id, {})
    drone_in_db = next((d for d in db["drones"] if d["id"] == drone_id), None)
    if command == "takeoff":
        current_telemetry["altitude"] = params.get("altitude", 10)
        current_telemetry["status"] = "flying"
        if drone_in_db: drone_in_db["status"] = "Deployed"
        socketio.emit('new_notification', {
            "id": str(uuid.uuid4()), "message": f"Drone {drone_id} took off to {current_telemetry['altitude']}m.",
            "type": "info", "read": False, "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z'
        })
    elif command == "land":
        current_telemetry["altitude"] = 0
        current_telemetry["status"] = "landed"
        if drone_in_db: drone_in_db["status"] = "Available"
        socketio.emit('new_notification', {
            "id": str(uuid.uuid4()), "message": f"Drone {drone_id} has landed.",
            "type": "info", "read": False, "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z'
        })
    elif command == "take_photo":
        new_media_id = str(uuid.uuid4())
        new_media_item = {
            "id": new_media_id,
            "title": f"Photo from {drone_id} ({datetime.datetime.now().strftime('%Y-%m-%d %H:%M')})",
            "type": "image",
            "url": f"https://picsum.photos/600/400?random={random.randint(1,1000)}",
            "thumbnail": f"https://picsum.photos/300/200?random={random.randint(1,1000)}",
            "droneId": drone_id,
            "missionId": "N/A",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z',
            "gps": f"{current_telemetry.get('latitude', 'N/A')}° N, {current_telemetry.get('longitude', 'N/A')}° E",
            "tags": ["captured", "drone", "photo"],
            "description": "Captured during live operation.",
            "date": datetime.date.today().isoformat()
        }
        db["media"].append(new_media_item)
        socketio.emit('new_media_available', new_media_item)
        socketio.emit('new_notification', {
            "id": str(uuid.uuid4()), "message": f"New photo captured by drone {drone_id}.",
            "type": "success", "read": False, "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z'
        })
        print(f"New media captured: {new_media_id}")
    db["live_telemetry"][drone_id] = current_telemetry
    socketio.emit('drone_telemetry_update', {"drone_id": drone_id, "telemetry": current_telemetry})
    return jsonify({"message": f"Command '{command}' sent to drone {drone_id}"}), 200

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
@socketio.on('register_as_frontend')
def register_frontend():
    print(f"Frontend registered with SID: {request.sid}")
def simulate_drone_telemetry():
    while True:
        for mission in db["missions"]:
            if mission["status"] == "Active" and mission["drone_id"] not in db["connected_drones"]:
                db["connected_drones"].append(mission["drone_id"])
                socketio.emit('new_notification', {
                    "id": str(uuid.uuid4()),
                    "message": f"Drone {mission['drone_id']} gateway connected for mission '{mission['name']}'.",
                    "type": "info",
                    "read": False,
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z'
                })
                for d in db["drones"]:
                    if d["id"] == mission["drone_id"]:
                        d["status"] = "Deployed"
                        break
            if mission["status"] == "Active" and mission["progress"] < 100:
                mission["progress"] += random.randint(1, 5)
                if mission["progress"] >= 100:
                    mission["progress"] = 100
                    mission["status"] = "Completed"
                    socketio.emit('new_notification', {
                        "id": str(uuid.uuid4()),
                        "message": f"Mission '{mission['name']}' completed!",
                        "type": "success",
                        "read": False,
                        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z'
                    })
                    if mission["drone_id"] in db["connected_drones"]:
                         db["connected_drones"].remove(mission["drone_id"])
                         socketio.emit('new_notification', {
                            "id": str(uuid.uuid4()),
                            "message": f"Drone {mission['drone_id']} gateway disconnected after mission completion.",
                            "type": "info",
                            "read": False,
                            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z'
                        })
                         for d in db["drones"]:
                            if d["id"] == mission["drone_id"]:
                                d["status"] = "Available"
                                break

        for drone_id in db["connected_drones"]:
            telemetry = db["live_telemetry"].get(drone_id, {
                "altitude": random.uniform(0, 100),
                "speed": random.uniform(0, 20),
                "battery_percent": random.randint(20, 100),
                "latitude": random.uniform(23.5, 23.7),
                "longitude": random.uniform(58.3, 58.6),
                "status": "flying"
            })
            if telemetry["status"] == "flying":
                telemetry["altitude"] = max(0, min(150, telemetry["altitude"] + random.uniform(-5, 5)))
                telemetry["speed"] = max(5, min(25, telemetry["speed"] + random.uniform(-1, 1)))
                telemetry["battery_percent"] = max(0, telemetry["battery_percent"] - random.uniform(0.5, 1.5))
            elif telemetry["status"] == "landed":
                telemetry["altitude"] = 0
                telemetry["speed"] = 0
                telemetry["battery_percent"] = min(100, telemetry["battery_percent"] + random.uniform(0.1, 0.5))
            elif telemetry["status"] == "maintenance":
                telemetry["altitude"] = 0
                telemetry["speed"] = 0
                telemetry["battery_percent"] = 100
            telemetry["latitude"] = telemetry["latitude"] + random.uniform(-0.0005, 0.0005)
            telemetry["longitude"] = telemetry["longitude"] + random.uniform(-0.0005, 0.0005)

            for d in db["drones"]:
                if d["id"] == drone_id:

                    d["status"] = "Deployed" if telemetry["status"] == "flying" else "Available"
                    d["battery"] = telemetry["battery_percent"]
                    d["lastLocation"] = f"Lat: {telemetry['latitude']:.4f}, Lng: {telemetry['longitude']:.4f}"

                    break

            if telemetry["battery_percent"] < 15 and not any(inc['message'].startswith(f"Drone {drone_id} battery critical") for inc in db["incidents"]):
                new_incident = {
                    "id": str(uuid.uuid4()),
                    "type": "alert",
                    "message": f"Drone {drone_id} battery critical ({int(telemetry['battery_percent'])}%). Initiate return to base.",
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z',
                    "resolved": False
                }
                db["incidents"].append(new_incident)
                socketio.emit('new_notification', new_incident)
                print(f"Emitting new incident: {new_incident['message']}")
            db["live_telemetry"][drone_id] = telemetry
            socketio.emit('drone_telemetry_update', {"drone_id": drone_id, "telemetry": telemetry})
        time.sleep(2)
threading.Thread(target=simulate_drone_telemetry, daemon=True).start()
if __name__ == '__main__':

    socketio.run(app, debug=True, port=5000)