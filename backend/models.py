# backend/models.py

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

db = SQLAlchemy()

class Drone(db.Model):
    __tablename__ = 'drones'
    id = Column(String, primary_key=True)
    name = Column(String(100), nullable=False)
    model = Column(String(100))
    manufacturer = Column(String(100))
    status = Column(String(50), default='Offline')
    location = Column(String(100))
    flight_hours = Column(Float, default=0.0)
    live_stream_url = Column(String(500), nullable=True)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Mission(db.Model):
    __tablename__ = 'missions'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default='Scheduled')
    drone_id = Column(String(50), nullable=False)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    details = Column(Text)
    def to_dict(self):
        return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in self.__dict__.items() if not k.startswith('_')}

class Media(db.Model):
    __tablename__ = 'media'
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    type = Column(String(50))
    url = Column(String(500), nullable=False)
    drone_id = Column(String(50))
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    description = Column(Text)
    def to_dict(self):
        data = {k: v.isoformat() if isinstance(v, datetime) else v for k, v in self.__dict__.items() if not k.startswith('_')}
        data['thumbnail'] = data.get('url') # Add thumbnail for frontend
        return data

class Incident(db.Model):
    __tablename__ = 'incidents'
    id = Column(Integer, primary_key=True)
    message = Column(Text, nullable=False)
    type = Column(String(50), default='alert')
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved = Column(Boolean, default=False)
    def to_dict(self):
        return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in self.__dict__.items() if not k.startswith('_')}

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

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
    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

class Checklist(db.Model):
    __tablename__ = 'checklists'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    items = Column(JSONB)
    user_id = Column(Integer, ForeignKey('user_profiles.id'))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    def to_dict(self):
        return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in self.__dict__.items() if not k.startswith('_')}