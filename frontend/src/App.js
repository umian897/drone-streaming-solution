 import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Video, Rocket, Package, Drone, HardDrive, BatteryCharging,
  Book, FileText, CheckSquare, Tag, Settings, AlertCircle, Wrench, Bell, UserCircle,
  LogOut, ChevronDown, ChevronUp, PlusCircle, MoreVertical, Trash2, MapPin, Activity, Clock, Image,
  Gauge, Battery, Signal, Compass, Camera, Video as VideoIcon, Home, Calendar, Users, Map, ListChecks, File, PlayCircle,
  Upload, Info, Factory, BatteryMedium, Plus, Edit, Eye, History, XCircle, Download, Search, Play, Pause, FastForward, Rewind, Volume2,
  List, Check, Square, MinusCircle, Folder, Image as ImageIcon, // Added Folder and ImageIcon for media folders
  BellIcon
} from 'lucide-react';

// Import the authentication page component. Path is correct.
import AuthPage from './pages/auth/AuthPage';

// --- INLINED Sidebar Component ---
const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const isActive = (path) => location.pathname === path;
  const isDropdownActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col min-h-screen shadow-lg">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <UserCircle className="w-10 h-10 text-blue-300 mr-3" />
        <span className="text-lg font-semibold">m osman</span>
      </div>

      <div className="p-4 border-b border-gray-700">
        <button className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition duration-150 transform hover:scale-105 shadow-md">
          <PlusCircle className="w-5 h-5 mr-2" /> Create mission
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link to="/" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </Link>

        <Link to="/live-operations" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/live-operations') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <Video className="w-5 h-5 mr-3" />
          Live Operations
        </Link>

        <Link to="/missions" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/missions') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <Rocket className="w-5 h-5 mr-3" />
          Missions
        </Link>

        <div>
          <button
            onClick={() => toggleDropdown('assets')}
            className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/assets']) || openDropdown === 'assets' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <span className="flex items-center">
              <Package className="w-5 h-5 mr-3" />
              Assets
            </span>
            {openDropdown === 'assets' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openDropdown === 'assets' && (
            <div className="pl-8 py-1 space-y-1">
              <Link to="/assets/drones" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/assets/drones') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <Drone className="w-4 h-4 mr-2" /> Drones
              </Link>
              <Link to="/assets/ground-stations" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/assets/ground-stations') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <HardDrive className="w-4 h-4 mr-2" /> Ground stations
              </Link>
              <Link to="/assets/equipment" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/assets/equipment') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <Wrench className="w-4 h-4 mr-2" /> Equipment
              </Link>
              <Link to="/assets/batteries" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/assets/batteries') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <BatteryCharging className="w-4 h-4 mr-2" /> Batteries
              </Link>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleDropdown('library')}
            className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/library']) || openDropdown === 'library' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <span className="flex items-center">
              <Book className="w-5 h-5 mr-3" />
              Library
            </span>
            {openDropdown === 'library' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openDropdown === 'library' && (
            <div className="pl-8 py-1 space-y-1">
              <Link to="/library/media" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/library/media') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <Video className="w-4 h-4 mr-2" /> Media
              </Link>
              <Link to="/library/files" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/library/files') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <FileText className="w-4 h-4 mr-2" /> Files
              </Link>
              <Link to="/library/checklists" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/library/checklists') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <CheckSquare className="w-4 h-4 mr-2" /> Checklists
              </Link>
              <Link to="/library/tags" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/library/tags') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <Tag className="w-4 h-4 mr-2" /> Tags
              </Link>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleDropdown('manage')}
            className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/manage']) || openDropdown === 'manage' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <span className="flex items-center">
              <Settings className="w-5 h-5 mr-3" />
              Manage
            </span>
            {openDropdown === 'manage' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openDropdown === 'manage' && (
            <div className="pl-8 py-1 space-y-1">
              <Link to="/manage/incidents" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/manage/incidents') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <AlertCircle className="w-4 h-4 mr-2" /> Incidents
              </Link>
              <Link to="/manage/maintenance" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/manage/maintenance') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <Wrench className="w-4 h-4 mr-2" /> Maintenance
              </Link>
            </div>
          )}
        </div>

        <Link to="/manage/profile-settings" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/manage/profile-settings') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <UserCircle className="w-5 h-5 mr-3" />
          Account
        </Link>

        <Link to="/manage/notification-preferences" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/manage/notification-preferences') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <Bell className="w-5 h-5 mr-3" />
          Notifications
        </Link>

      </nav>

     

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium transition duration-150 transform hover:scale-105 shadow-md"
        >
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

// --- INLINED CardWidget Component ---
const CardWidget = ({ title, children, onDelete, onMoreOptions ,  }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex space-x-2">
          {onMoreOptions && (
            <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

// --- INLINED Dashboard Component ---
const Dashboard = () => {
  const naviagte = useNavigate()
  const recentMedia = [
    { id: 1, type: 'video', thumbnail: 'https://placehold.co/100x60/a78bfa/ffffff?text=Video1', title: 'Mission Alpha Capture' },
    { id: 2, type: 'image', thumbnail: 'https://placehold.co/100x60/818cf8/ffffff?text=Image1', title: 'Inspection Photo 1' },
    { id: 3, type: 'video', thumbnail: 'https://placehold.co/100x60/6366f1/ffffff?text=Video2', title: 'Evening Flight' },
  ];

  const incidents = [
    { id: 1, type: 'warning', description: 'Drone Battery Low', time: '10:30 AM' },
    { id: 2, type: 'alert', description: 'Unexpected Wind Gust', time: '09:15 AM' },
  ];

  const handleCardDelete = (cardName) => {
    // In a real app, this would trigger a modal or a more robust delete process
    console.log(`Delete icon clicked for ${cardName} card.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CardWidget title="User Profile" onDelete={() => handleCardDelete('User Profile')}>
        <div 
        
     
        className="flex flex-col items-center justify-center h-full text-center">
          <UserCircle className="w-20 h-20 text-gray-400 mb-4" />
          <h4 className="text-xl font-bold text-gray-800">m osman</h4>
          <div className="mt-4 text-gray-600 text-sm space-y-2">
            <p className="flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-500" /> Total flight time: -</p>
            <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-indigo-500" /> Average flight time: -</p>
            <p className="flex items-center"><Rocket className="w-4 h-4 mr-2 text-purple-500" /> Number of flights: -</p>
          </div>
          <button 
             onClick={()=>{
          naviagte("/manage/profile-settings")
        }}
          className="mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm">Open profile</button>
        </div>
      </CardWidget>

      <CardWidget title="Live Airspace" onDelete={() => handleCardDelete('Live Airspace')}>
        <div className="flex flex-col items-center justify-center h-full bg-gray-200 rounded-lg">
          <MapPin className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-gray-600">Live drone tracking map will appear here.</p>
          <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">View all</button>
        </div>
      </CardWidget>

      <CardWidget title="Incidents" onDelete={() => handleCardDelete('Incidents')}>
        <ul className="space-y-3">
          {incidents.length > 0 ? (
            incidents.map(incident => (
              <li key={incident.id} className="flex items-center p-2 bg-red-50 rounded-md text-sm text-red-800">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{incident.description}</p>
                  <p className="text-xs text-red-600">{incident.time}</p>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No recent incidents.</p>
          )}
        </ul>
        <button 
        
        onClick={()=>{naviagte("/manage/incidents")}}

        className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">View all</button>
      </CardWidget>

      <CardWidget title="Recent media" onDelete={() => handleCardDelete('Recent Media')}>
        <div className="grid grid-cols-2 gap-4"
        
        >
          {recentMedia.length > 0 ? (
            recentMedia.map(media => (
              <div key={media.id} className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <img src={media.thumbnail} alt={media.title} className="w-full h-24 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent text-white text-xs p-2 truncate">{media.title}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent media.</p>
          )}
        </div>
        <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">View all</button>
      </CardWidget>

      <CardWidget title="Maintenance" onDelete={() => handleCardDelete('Maintenance')}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Wrench className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">Upcoming maintenance schedules and logs will be displayed here.</p>
          <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
        onClick={()=>{naviagte("/manage/maintenance")}}
          
          >View all</button>
        </div>
    
      </CardWidget>
    </div>
  );
};

// --- INLINED LiveOperations Component ---
const LiveOperations = ({ onCaptureMedia }) => { // Receive onCaptureMedia prop
  const [selectedDrone, setSelectedDrone] = useState('drone1');
  const [telemetry, setTelemetry] = useState({
    altitude: 150,
    speed: 12,
    battery: 85,
    signal: 'Excellent',
    flightMode: 'Auto',
    latitude: 34.0522,
    longitude: -118.2437,
    heading: 'North-East'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        altitude: Math.floor(Math.random() * 200) + 50,
        speed: (Math.random() * 20 + 5).toFixed(1),
        battery: Math.max(0, prev.battery - Math.floor(Math.random() * 2)),
        latitude: (34.0522 + (Math.random() - 0.5) * 0.01).toFixed(4),
        longitude: (-118.2437 + (Math.random() - 0.5) * 0.01).toFixed(4),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const drones = [
    { id: 'drone1', name: 'Drone Alpha', videoUrl: 'https://placehold.co/600x400/3498db/ffffff?text=Drone+Alpha+Feed' },
    { id: 'drone2', name: 'Drone Beta', videoUrl: 'https://placehold.co/600x400/2ecc71/ffffff?text=Drone+Beta+Feed' },
    { id: 'drone3', name: 'Drone Gamma', videoUrl: 'https://placehold.co/600x400/e74c3c/ffffff?text=Drone+Gamma+Feed' },
  ];

  const currentDrone = drones.find(d => d.id === selectedDrone);

  const handleTakePhoto = () => {
    const newImage = {
      title: `${currentDrone.name} Photo - ${new Date().toLocaleString()}`,
      type: 'image',
      url: `https://placehold.co/600x400/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=Captured+Image`,
      thumbnail: `https://placehold.co/300x200/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=Captured+Image`,
      droneId: selectedDrone,
      missionId: 'Live Capture', // Placeholder mission ID for live captures
      timestamp: new Date().toISOString(),
      gps: `${telemetry.latitude}, ${telemetry.longitude}`,
      tags: ['live-capture', 'image'],
      description: 'Image captured live during operation.',
    };
    onCaptureMedia(newImage);
    alert('Photo captured and saved to Media Library!');
  };

  const handleRecordVideo = () => {
    const newVideo = {
      title: `${currentDrone.name} Video - ${new Date().toLocaleString()}`,
      type: 'video',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Example video URL
      thumbnail: `https://placehold.co/300x200/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=Captured+Video`,
      droneId: selectedDrone,
      missionId: 'Live Capture', // Placeholder mission ID for live captures
      timestamp: new Date().toISOString(),
      gps: `${telemetry.latitude}, ${telemetry.longitude}`,
      tags: ['live-capture', 'video'],
      description: 'Video recorded live during operation.',
    };
    onCaptureMedia(newVideo);
    alert('Video recorded and saved to Media Library!');
  };


  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Live Operations</h2>

      {/* Drone Selection and Controls */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <label htmlFor="drone-select" className="text-gray-700 font-medium">Select Drone:</label>
          <select
            id="drone-select"
            value={selectedDrone}
            onChange={(e) => setSelectedDrone(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          >
            {drones.map(drone => (
              <option key={drone.id} value={drone.id}>{drone.name}</option>
            ))}
          </select>
        </div>
        <div className="flex space-x-4">
          <button onClick={handleTakePhoto} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-md">
            <Camera className="w-5 h-5 mr-2" /> Take Photo
          </button>
          <button onClick={handleRecordVideo} className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-md">
            <VideoIcon className="w-5 h-5 mr-2" /> Record Video
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md">
            <Home className="w-5 h-5 mr-2" /> Return to Home
          </button>
        </div>
      </div>

      {/* Main Content Grid: Video Feed, Map, Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Main Video Feed */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl shadow-md overflow-hidden relative">
          {currentDrone ? (
            <img src={currentDrone.videoUrl} alt={`${currentDrone.name} Live Feed`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
              No drone selected or feed unavailable.
            </div>
          )}
          {/* Telemetry Overlay (optional, can be moved to a separate panel) */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white p-3 rounded-lg text-sm space-y-1">
            <p className="flex items-center"><Gauge className="w-4 h-4 mr-2" /> Alt: {telemetry.altitude}m</p>
            <p className="flex items-center"><Gauge className="w-4 h-4 mr-2" /> Speed: {telemetry.speed} m/s</p>
            <p className="flex items-center"><Battery className="w-4 h-4 mr-2" /> Bat: {telemetry.battery}%</p>
            <p className="flex items-center"><Signal className="w-4 h-4 mr-2" /> Signal: {telemetry.signal}</p>
          </div>
        </div>

        {/* Right Panel: Map and Detailed Telemetry */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          {/* Interactive Map Placeholder */}
          <div className="bg-white rounded-xl shadow-md p-4 flex-1 flex flex-col items-center justify-center text-gray-600">
            <MapPin className="w-16 h-16 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
            <p className="text-center text-sm">Drone location and flight path will be displayed here.</p>
            <p className="text-xs text-gray-500 mt-2">Current GPS: Lat {telemetry.latitude}, Lng {telemetry.longitude}</p>
            <p className="text-xs text-gray-500">Heading: {telemetry.heading}</p>
            <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">View Full Map</button>
          </div>

          {/* Detailed Telemetry Panel */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Telemetry</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <p className="flex items-center"><Gauge className="w-4 h-4 mr-2 text-blue-500" /> Altitude: <span className="font-medium ml-1">{telemetry.altitude}m</span></p>
              <p className="flex items-center"><Gauge className="w-4 h-4 mr-2 text-green-500" /> Speed: <span className="font-medium ml-1">{telemetry.speed} m/s</span></p>
              <p className="flex items-center"><Battery className="w-4 h-4 mr-2 text-red-500" /> Battery: <span className="font-medium ml-1">{telemetry.battery}%</span></p>
              <p className="flex items-center"><Signal className="w-4 h-4 mr-2 text-purple-500" /> Signal: <span className="font-medium ml-1">{telemetry.signal}</span></p>
              <p className="flex items-center col-span-2"><Compass className="w-4 h-4 mr-2 text-yellow-500" /> Flight Mode: <span className="font-medium ml-1">{telemetry.flightMode}</span></p>
              <p className="flex items-center col-span-2"><MapPin className="w-4 h-4 mr-2 text-indigo-500" /> Lat/Lng: <span className="font-medium ml-1">{telemetry.latitude}, {telemetry.longitude}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Smaller Video Feeds / Multi-Drone View */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Other Active Drones</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {drones.filter(d => d.id !== selectedDrone).map(drone => (
            <div key={drone.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDrone(drone.id)}>
              <img src={drone.videoUrl} alt={`${drone.name} Feed`} className="w-full h-32 object-cover" />
              <div className="p-2 text-white text-sm font-medium">{drone.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- INLINED Missions Component ---
const Missions = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create-pilot', 'create-ground', 'details'
  const [selectedMission, setSelectedMission] = useState(null); // For viewing details

  // Simulated mission data
  const [missions, setMissions] = useState([
    {
      id: 'm1',
      name: 'Site Survey - North Campus',
      type: 'Pilot',
      status: 'Completed',
      drone: 'Drone Alpha',
      operator: 'Pilot John Doe',
      startDate: '2025-07-15',
      endDate: '2025-07-15',
      objectives: 'Comprehensive visual survey for construction progress.',
      progress: 100,
      media: [
        { id: 1, type: 'image', url: 'https://placehold.co/100x60/a78bfa/ffffff?text=Img1', caption: 'Roof overview' },
        { id: 2, type: 'video', url: 'https://placehold.co/100x60/818cf8/ffffff?text=Vid1', caption: 'Perimeter flight' },
      ],
      incidents: [],
    },
    {
      id: 'm2',
      name: 'Automated Security Patrol - Factory',
      type: 'Ground Station',
      status: 'Ongoing',
      drone: 'Drone Beta',
      operator: 'Ground Station Gamma',
      startDate: '2025-07-20',
      endDate: 'Ongoing',
      objectives: 'Daily automated security checks of factory perimeter.',
      progress: 75,
      media: [],
      incidents: [{ id: 1, description: 'Unexpected bird interference', time: '11:00 AM' }],
    },
    {
      id: 'm3',
      name: 'Planned Infrastructure Inspection',
      type: 'Pilot',
      status: 'Planned',
      drone: 'Drone Alpha',
      operator: 'Pilot Jane Smith',
      startDate: '2025-07-25',
      endDate: '2025-07-25',
      objectives: 'Inspect bridge structure for cracks and integrity.',
      progress: 0,
      media: [],
      incidents: [],
    },
  ]);

  const handleCreateMission = (type) => {
    setCurrentView(`create-${type}`);
  };

  const handleViewDetails = (missionId) => {
    const mission = missions.find(m => m.id === missionId);
    setSelectedMission(mission);
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedMission(null);
  };

  const handleSaveNewMission = (newMissionData) => {
    const newId = `m${missions.length + 1}`;
    setMissions([...missions, { id: newId, ...newMissionData, status: 'Planned', progress: 0, media: [], incidents: [] }]);
    setCurrentView('list');
  };

  // Sub-component for Create Pilot Mission Form
  const CreatePilotMissionForm = () => {
    const [name, setName] = useState('');
    const [objectives, setObjectives] = useState('');
    const [assignedDrone, setAssignedDrone] = useState('');
    const [assignedOperator, setAssignedOperator] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSaveNewMission({
        name,
        objectives,
        type: 'Pilot',
        drone: assignedDrone,
        operator: assignedOperator,
        startDate,
        endDate,
      });
    };

    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Create Pilot Mission</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Mission Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">Objectives</label>
            <textarea id="objectives" value={objectives} onChange={(e) => setObjectives(e.target.value)} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
          <div>
            <label htmlFor="drone" className="block text-sm font-medium text-gray-700">Assigned Drone</label>
            <select id="drone" value={assignedDrone} onChange={(e) => setAssignedDrone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
              <option value="">Select Drone</option>
              <option value="Drone Alpha">Drone Alpha</option>
              <option value="Drone Beta">Drone Beta</option>
            </select>
          </div>
          <div>
            <label htmlFor="operator" className="block text-sm font-medium text-gray-700">Assigned Operator</label>
            <select id="operator" value={assignedOperator} onChange={(e) => setAssignedOperator(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
              <option value="">Select Operator</option>
              <option value="Pilot John Doe">Pilot John Doe</option>
              <option value="Pilot Jane Smith">Pilot Jane Smith</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={handleBackToList} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">
              Save Pilot Mission
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Sub-component for Create Ground Station Mission Form
  const CreateGroundStationMissionForm = () => {
    const [name, setName] = useState('');
    const [objectives, setObjectives] = useState('');
    const [assignedDrone, setAssignedDrone] = useState('');
    const [assignedGS, setAssignedGS] = useState('');
    const [schedule, setSchedule] = useState('One-time');
    const [flightPath, setFlightPath] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSaveNewMission({
        name,
        objectives,
        type: 'Ground Station',
        drone: assignedDrone,
        groundStation: assignedGS,
        schedule,
        flightPath,
        startDate: new Date().toISOString().slice(0, 10), // Auto-set current date for simplicity
        endDate: 'Ongoing', // Or calculate based on schedule
      });
    };

    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Create Ground Station Mission</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Mission Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">Objectives</label>
            <textarea id="objectives" value={objectives} onChange={(e) => setObjectives(e.target.value)} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
          <div>
            <label htmlFor="drone" className="block text-sm font-medium text-gray-700">Assigned Drone</label>
            <select id="drone" value={assignedDrone} onChange={(e) => setAssignedDrone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
              <option value="">Select Drone</option>
              <option value="Drone Beta">Drone Beta</option>
              <option value="Drone Gamma">Drone Gamma</option>
            </select>
          </div>
          <div>
            <label htmlFor="groundStation" className="block text-sm font-medium text-gray-700">Assigned Ground Station</label>
            <select id="groundStation" value={assignedGS} onChange={(e) => setAssignedGS(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
              <option value="">Select Ground Station</option>
              <option value="Ground Station Alpha">Ground Station Alpha</option>
              <option value="Ground Station Gamma">Ground Station Gamma</option>
            </select>
          </div>
          <div>
            <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">Schedule</label>
            <select id="schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="One-time">One-time</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label htmlFor="flightPath" className="block text-sm font-medium text-gray-700">Flight Path (Coordinates/Description)</label>
            <textarea id="flightPath" value={flightPath} onChange={(e) => setFlightPath(e.target.value)} rows="2" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={handleBackToList} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">
              Save Ground Station Mission
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Sub-component for Mission Details View
  const MissionDetailsView = ({ mission, onBack }) => {
    if (!mission) return <div className="text-center text-gray-500">Mission not found.</div>;

    const getStatusColor = (status) => {
      switch (status) {
        case 'Planned': return 'bg-blue-100 text-blue-800';
        case 'Ongoing': return 'bg-yellow-100 text-yellow-800';
        case 'Completed': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Mission Details: {mission.name}</h3>
          <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Back to Missions
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Type: <span className="font-medium text-gray-800">{mission.type} Mission</span></p>
            <p className="text-sm text-gray-600 mb-2">Status: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(mission.status)}`}>{mission.status}</span></p>
            <p className="text-sm text-gray-600 mb-2">Assigned Drone: <span className="font-medium text-gray-800">{mission.drone}</span></p>
            {mission.type === 'Pilot' && <p className="text-sm text-gray-600 mb-2">Assigned Operator: <span className="font-medium text-gray-800">{mission.operator}</span></p>}
            {mission.type === 'Ground Station' && <p className="text-sm text-gray-600 mb-2">Assigned Ground Station: <span className="font-medium text-gray-800">{mission.groundStation}</span></p>}
            <p className="text-sm text-gray-600 mb-2">Start Date: <span className="font-medium text-gray-800">{mission.startDate}</span></p>
            {mission.endDate && <p className="text-sm text-gray-600">End Date: <span className="font-medium text-gray-800">{mission.endDate}</span></p>}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Objectives:</h4>
            <p className="text-sm text-gray-700">{mission.objectives}</p>
            {mission.flightPath && <p className="text-sm text-gray-700 mt-2">Flight Path: <span className="font-medium">{mission.flightPath}</span></p>}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Mission Progress:</h4>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${mission.progress}%` }}></div>
          </div>
          <p className="text-right text-sm text-gray-600 mt-1">{mission.progress}% Completed</p>
        </div>

        {mission.media.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Recorded Media:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mission.media.map(media => (
                <div key={media.id} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <img src={media.url} alt={media.caption} className="w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {media.type === 'video' ? <PlayCircle className="w-8 h-8 text-white" /> : <Image className="w-8 h-8 text-white" />}
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent text-white text-xs p-2 truncate">{media.caption}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {mission.incidents.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Incident Reports:</h4>
            <ul className="space-y-2">
              {mission.incidents.map(incident => (
                <li key={incident.id} className="flex items-start p-3 bg-red-50 rounded-md text-sm text-red-800">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{incident.description}</p>
                    <p className="text-xs text-red-600 mt-1">Time: {incident.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700">
            Generate Report
          </button>
          {mission.status !== 'Completed' && (
            <button className="px-4 py-2 bg-yellow-500 text-white rounded-md shadow-sm text-sm font-medium hover:bg-yellow-600">
              Edit Mission
            </button>
          )}
          <button className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700">
            Delete Mission
          </button>
        </div>
      </div>
    );
  };


  // Main render logic for Missions component
  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      {currentView === 'list' && (
        <>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Missions Overview</h2>

          {/* Create Mission Buttons */}
          <div className="flex space-x-4 mb-6">
            <div
              onClick={() => handleCreateMission('pilot')}
              className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl shadow-sm text-center w-64 h-48 hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white"
            >
              <PlusCircle className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">Create Pilot Mission</h3>
              <p className="text-sm text-gray-600 mt-2">Manual flight operations.</p>
            </div>
            <div
              onClick={() => handleCreateMission('ground')}
              className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl shadow-sm text-center w-64 h-48 hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white"
            >
              <PlusCircle className="w-12 h-12 text-teal-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">Create Ground Station Mission</h3>
              <p className="text-sm text-gray-600 mt-2">Automated scheduled operations.</p>
            </div>
          </div>

          {/* Mission List */}
          <div className="bg-white rounded-xl shadow-md p-6 flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">All Missions</h3>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              {['All', 'Planned', 'Ongoing', 'Completed'].map(status => (
                <button
                  key={status}
                  className={`px-4 py-2 text-sm font-medium ${
                    // For now, 'All' is the only active filter. Extend this with state for actual filtering.
                    status === 'All' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {missions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No missions found. Start by creating a new mission!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mission Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drone</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator/GS</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {missions.map((mission) => (
                      <tr key={mission.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mission.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mission.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            mission.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {mission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.drone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.operator || mission.groundStation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.startDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleViewDetails(mission.id)} className="text-blue-600 hover:text-blue-900 mr-3">View Details</button>
                          <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {currentView === 'create-pilot' && <CreatePilotMissionForm />}
      {currentView === 'create-ground' && <CreateGroundStationMissionForm />}
      {currentView === 'details' && selectedMission && <MissionDetailsView mission={selectedMission} onBack={handleBackToList} />}
    </div>
  );
};

// --- INLINED ConfirmationModal Component ---
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Confirm Action</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// --- INLINED MaintenanceHistoryView Component ---
const MaintenanceHistoryView = ({ asset, onBack }) => {
  if (!asset) return <div className="text-center text-gray-500">Asset not found.</div>;

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{asset.name} Maintenance History</h2>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Back to Details
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 flex-1">
        {asset.maintenanceHistory && asset.maintenanceHistory.length > 0 ? (
          <ul className="space-y-4">
            {asset.maintenanceHistory.map((record, index) => (
              <li key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-lg font-semibold text-gray-800 mb-1">Date: {record.date}</p>
                <p className="text-gray-700 mb-1">Description: {record.description}</p>
                <p className="text-gray-600 text-sm">Performed By: {record.performedBy}</p>
                {record.cost && <p className="text-gray-600 text-sm">Cost: ${record.cost}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-8">No maintenance history found for this asset.</p>
        )}
      </div>
    </div>
  );
};

// --- INLINED Asset Management Helper Functions and Components ---

// Generic Asset List Component
const AssetList = ({ title, assets, onAddItem, onViewDetails, assetTypeIcon: AssetIcon }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onAddItem}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors transform hover:scale-105 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New {title.replace(' Inventory', '').replace(' Management', '')}
        </button>
        <input
          type="text"
          placeholder="Search assets by name, model, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
        />
      </div>

      {filteredAssets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
          <p className="text-gray-500 text-lg">No {title.toLowerCase().replace(' inventory', '').replace(' management', '')} found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
              onClick={() => onViewDetails(asset.id)}
            >
              <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                {asset.imageUrl ? (
                  <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <AssetIcon className="w-24 h-24 text-gray-400" />
                )}
                <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
                  asset.status === 'Available' ? 'bg-green-100 text-green-800' :
                  asset.status === 'Deployed' ? 'bg-blue-100 text-blue-800' :
                  asset.status === 'In Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {asset.status}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{asset.name}</h3>
                  <p className="text-sm text-gray-600">ID: {asset.uniqueId}</p>
                  <p className="text-sm text-gray-600">Mfr: {asset.manufacturer}</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                    <Eye className="w-4 h-4 mr-1" /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Generic Asset Details Component
const AssetDetails = ({ asset, onBack, onEdit, onDelete, onViewMaintenanceHistory, assetTypeIcon: AssetIcon }) => {
  if (!asset) return <div className="text-center text-gray-500">Asset not found.</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Deployed': return 'bg-blue-100 text-blue-800';
      case 'In Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{asset.name} Details</h2>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Back to List
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Section */}
        <div className="lg:col-span-1 flex items-center justify-center bg-gray-100 rounded-lg p-4">
          {asset.imageUrl ? (
            <img src={asset.imageUrl} alt={asset.name} className="max-w-full h-auto rounded-lg shadow-md" />
          ) : (
            <AssetIcon className="w-48 h-48 text-gray-400" />
          )}
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">{asset.name} <span className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(asset.status)}`}>{asset.status}</span></h3>
          <p className="text-gray-700 text-lg">Model: <span className="font-semibold">{asset.model}</span></p>
          <p className="text-gray-700 text-lg">Manufacturer: <span className="font-semibold">{asset.manufacturer}</span></p>
          <p className="text-gray-700 text-lg">Unique ID: <span className="font-semibold">{asset.uniqueId}</span></p>

          {asset.type === 'Drone' && (
            <>
              <p className="text-gray-700 text-lg">Last Location: <span className="font-semibold">{asset.lastLocation}</span></p>
              <p className="text-gray-700 text-lg">Total Flight Hours: <span className="font-semibold">{asset.flightHours} hrs</span></p>
              <p className="text-gray-700 text-lg">Payload Capacity: <span className="font-semibold">{asset.payloadCapacity} kg</span></p>
            </>
          )}
          {asset.type === 'Ground Station' && (
            <>
              <p className="text-gray-700 text-lg">Coverage Area: <span className="font-semibold">{asset.coverageArea}</span></p>
              <p className="text-gray-700 text-lg">Power Source: <span className="font-semibold">{asset.powerSource}</span></p>
            </>
          )}
          {asset.type === 'Equipment' && (
            <>
              <p className="text-gray-700 text-lg">Equipment Type: <span className="font-semibold">{asset.equipmentType}</span></p>
              <p className="text-gray-700 text-lg">Compatibility: <span className="font-semibold">{asset.compatibility}</span></p>
            </>
          )}
          {asset.type === 'Battery' && (
            <>
              <p className="text-gray-700 text-lg">Capacity: <span className="font-semibold">{asset.capacity} mAh</span></p>
              <p className="text-gray-700 text-lg">Cycle Count: <span className="font-semibold">{asset.cycleCount}</span></p>
              <p className="text-gray-700 text-lg">Last Charged: <span className="font-semibold">{asset.lastCharged}</span></p>
            </>
          )}

          <div className="flex space-x-4 mt-6">
            <button onClick={onEdit} className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md shadow-sm text-sm font-medium hover:bg-yellow-600">
              <Edit className="w-4 h-4 mr-2" /> Edit Details
            </button>
            <button onClick={onDelete} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Asset
            </button>
            <button onClick={onViewMaintenanceHistory} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-purple-700">
              <History className="w-4 h-4 mr-2" /> View Maintenance History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generic Add Item Form Component
const AddItemForm = ({ title, onSave, onCancel, assetType, initialData = null }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [manufacturer, setManufacturer] = useState(initialData?.manufacturer || '');
  const [uniqueId, setUniqueId] = useState(initialData?.uniqueId || '');
  const [status, setStatus] = useState(initialData?.status || 'Available');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');

  // Specific fields for Drones
  const [lastLocation, setLastLocation] = useState(initialData?.lastLocation || '');
  const [flightHours, setFlightHours] = useState(initialData?.flightHours || '');
  const [payloadCapacity, setPayloadCapacity] = useState(initialData?.payloadCapacity || '');

  // Specific fields for Ground Stations
  const [coverageArea, setCoverageArea] = useState(initialData?.coverageArea || '');
  const [powerSource, setPowerSource] = useState(initialData?.powerSource || '');

  // Specific fields for Equipment
  const [equipmentType, setEquipmentType] = useState(initialData?.equipmentType || '');
  const [compatibility, setCompatibility] = useState(initialData?.compatibility || '');

  // Specific fields for Batteries
  const [capacity, setCapacity] = useState(initialData?.capacity || '');
  const [cycleCount, setCycleCount] = useState(initialData?.cycleCount || '');
  const [lastCharged, setLastCharged] = useState(initialData?.lastCharged || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: initialData?.id || `new-${Date.now()}`, // Use existing ID if editing, otherwise generate new
      name,
      model,
      manufacturer,
      uniqueId,
      status,
      imageUrl,
      type: assetType,
      maintenanceHistory: initialData?.maintenanceHistory || [], // Preserve existing history
    };

    if (assetType === 'Drone') {
      Object.assign(newItem, { lastLocation, flightHours, payloadCapacity });
    } else if (assetType === 'Ground Station') {
      Object.assign(newItem, { coverageArea, powerSource });
    } else if (assetType === 'Equipment') {
      Object.assign(newItem, { equipmentType, compatibility });
    } else if (assetType === 'Battery') {
      Object.assign(newItem, { capacity, cycleCount, lastCharged });
    }

    onSave(newItem);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{initialData ? `Edit ${title}` : `Add New ${title}`}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Placeholder)</label>
          <input type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., https://placehold.co/400x300/..." />
          <p className="mt-1 text-xs text-gray-500">For real implementation, this would be a file upload.</p>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
          <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">Manufacturer</label>
          <input type="text" id="manufacturer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="uniqueId" className="block text-sm font-medium text-gray-700">Unique ID</label>
          <input type="text" id="uniqueId" value={uniqueId} onChange={(e) => setUniqueId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="Available">Available</option>
            <option value="Deployed">Deployed</option>
            <option value="In Maintenance">In Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        {assetType === 'Drone' && (
          <>
            <div>
              <label htmlFor="lastLocation" className="block text-sm font-medium text-gray-700">Last Known Location</label>
              <input type="text" id="lastLocation" value={lastLocation} onChange={(e) => setLastLocation(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="flightHours" className="block text-sm font-medium text-gray-700">Total Flight Hours</label>
              <input type="number" id="flightHours" value={flightHours} onChange={(e) => setFlightHours(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="payloadCapacity" className="block text-sm font-medium text-gray-700">Payload Capacity (kg)</label>
              <input type="number" id="payloadCapacity" value={payloadCapacity} onChange={(e) => setPayloadCapacity(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </>
        )}
        {assetType === 'Ground Station' && (
          <>
            <div>
              <label htmlFor="coverageArea" className="block text-sm font-medium text-gray-700">Coverage Area</label>
              <input type="text" id="coverageArea" value={coverageArea} onChange={(e) => setCoverageArea(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="powerSource" className="block text-sm font-medium text-gray-700">Power Source</label>
              <input type="text" id="powerSource" value={powerSource} onChange={(e) => setPowerSource(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </>
        )}
        {assetType === 'Equipment' && (
          <>
            <div>
              <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700">Equipment Type</label>
              <input type="text" id="equipmentType" value={equipmentType} onChange={(e) => setEquipmentType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="compatibility" className="block text-sm font-medium text-gray-700">Compatibility</label>
              <input type="text" id="compatibility" value={compatibility} onChange={(e) => setCompatibility(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </>
        )}
        {assetType === 'Battery' && (
          <>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity (mAh)</label>
              <input type="number" id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="cycleCount" className="block text-sm font-medium text-gray-700">Cycle Count</label>
              <input type="number" id="cycleCount" value={cycleCount} onChange={(e) => setCycleCount(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="lastCharged" className="block text-sm font-medium text-gray-700">Last Charged Date</label>
              <input type="date" id="lastCharged" value={lastCharged} onChange={(e) => setLastCharged(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">
            {initialData ? `Save Changes` : `Save ${title}`}
          </button>
        </div>
      </form>
    </div>
  );
};


// --- INLINED Drones Component ---
const Drones = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add-drone', 'edit-drone', 'details', 'maintenance-history'
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [confirmingDeleteDrone, setConfirmingDeleteDrone] = useState(null);

  const [drones, setDrones] = useState([
    {
      id: 'd1',
      name: 'AirVibe Falcon 100',
      model: 'AV-F100',
      manufacturer: 'AirVibe Tech',
      uniqueId: 'DRN-AV-001',
      status: 'Available',
      lastLocation: 'Hangar 3, Muscat',
      flightHours: 125.5,
      payloadCapacity: 2.5,
      imageUrl: 'https://placehold.co/400x300/4a90e2/ffffff?text=AirVibe+F100',
      type: 'Drone',
      maintenanceHistory: [
        { date: '2025-06-01', description: 'Annual check-up, firmware update.', performedBy: 'Tech Team A', cost: 150 },
        { date: '2025-03-10', description: 'Propeller replacement after minor incident.', performedBy: 'Tech Team B', cost: 75 },
      ],
    },
    {
      id: 'd2',
      name: 'SkyGuard Sentinel',
      model: 'SG-S200',
      manufacturer: 'SkyGuard Systems',
      uniqueId: 'DRN-SG-002',
      status: 'Deployed',
      lastLocation: 'Mission Alpha, Site C',
      flightHours: 89.2,
      payloadCapacity: 1.8,
      imageUrl: 'https://placehold.co/400x300/7ed321/ffffff?text=SkyGuard+S200',
      type: 'Drone',
      maintenanceHistory: [
        { date: '2025-07-05', description: 'Pre-deployment system check.', performedBy: 'Pilot John Doe' },
      ],
    },
    {
      id: 'd3',
      name: 'AeroScout Pro',
      model: 'ASP-300',
      manufacturer: 'AeroDyne Solutions',
      uniqueId: 'DRN-AD-003',
      status: 'In Maintenance',
      lastLocation: 'Workshop Bay 1',
      flightHours: 210.0,
      payloadCapacity: 3.0,
      imageUrl: 'https://placehold.co/400x300/f5a623/ffffff?text=AeroScout+P300',
      type: 'Drone',
      maintenanceHistory: [
        { date: '2025-07-18', description: 'Scheduled 200-hour service and sensor calibration.', performedBy: 'Certified Service' },
      ],
    },
  ]);

  const handleAddDrone = () => setCurrentView('add-drone');
  const handleViewDroneDetails = (id) => {
    setSelectedDrone(drones.find(drone => drone.id === id));
    setCurrentView('details');
  };
  const handleEditDrone = () => {
    setCurrentView('edit-drone');
  };
  const handleDeleteDrone = () => {
    setConfirmingDeleteDrone(selectedDrone.id);
  };
  const handleConfirmDeleteDrone = () => {
    setDrones(drones.filter(drone => drone.id !== confirmingDeleteDrone));
    setConfirmingDeleteDrone(null);
    setSelectedDrone(null); // Clear selected drone if it was the one deleted
    setCurrentView('list');
  };
  const handleCancelDeleteDrone = () => {
    setConfirmingDeleteDrone(null);
  };
  const handleViewDroneMaintenanceHistory = () => {
    setCurrentView('maintenance-history');
  };

  const handleSaveDrone = (updatedDrone) => {
    if (currentView === 'add-drone') {
      setDrones([...drones, updatedDrone]);
    } else if (currentView === 'edit-drone') {
      setDrones(drones.map(drone => (drone.id === updatedDrone.id ? updatedDrone : drone)));
      setSelectedDrone(updatedDrone); // Update selected drone in state
    }
    setCurrentView('list');
  };

  const handleBackToDroneList = () => {
    setCurrentView('list');
    setSelectedDrone(null);
  };

  if (currentView === 'add-drone') {
    return <AddItemForm title="Drone" onSave={handleSaveDrone} onCancel={handleBackToDroneList} assetType="Drone" />;
  }
  if (currentView === 'edit-drone') {
    return <AddItemForm title="Drone" onSave={handleSaveDrone} onCancel={handleBackToDroneList} assetType="Drone" initialData={selectedDrone} />;
  }
  if (currentView === 'details') {
    return (
      <>
        <AssetDetails
          asset={selectedDrone}
          onBack={handleBackToDroneList}
          onEdit={handleEditDrone}
          onDelete={handleDeleteDrone}
          onViewMaintenanceHistory={handleViewDroneMaintenanceHistory}
          assetTypeIcon={Drone}
        />
        {confirmingDeleteDrone && (
          <ConfirmationModal
            message={`Are you sure you want to delete drone "${selectedDrone?.name}"? This action cannot be undone.`}
            onConfirm={handleConfirmDeleteDrone}
            onCancel={handleCancelDeleteDrone}
          />
        )}
      </>
    );
  }
  if (currentView === 'maintenance-history') {
    return <MaintenanceHistoryView asset={selectedDrone} onBack={() => setCurrentView('details')} />;
  }

  return (
    <AssetList
      title="Drone Inventory"
      assets={drones}
      onAddItem={handleAddDrone}
      onViewDetails={handleViewDroneDetails}
      assetTypeIcon={Drone}
    />
  );
};

// --- INLINED GroundStations Component ---
const GroundStations = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add-gs', 'edit-gs', 'details', 'maintenance-history'
  const [selectedGS, setSelectedGS] = useState(null);
  const [confirmingDeleteGS, setConfirmingDeleteGS] = useState(null);

  const [groundStations, setGroundStations] = useState([
    {
      id: 'gs1',
      name: 'BaseLink Pro',
      model: 'BL-P500',
      manufacturer: 'CommLink Corp',
      uniqueId: 'GS-CL-001',
      status: 'Available',
      coverageArea: '5 km radius',
      powerSource: 'Solar/Battery',
      imageUrl: 'https://placehold.co/400x300/9b59b6/ffffff?text=BaseLink+Pro',
      type: 'Ground Station',
      maintenanceHistory: [
        { date: '2025-05-20', description: 'System diagnostic and antenna alignment.', performedBy: 'Field Engineer' },
        { date: '2024-11-15', description: 'Firmware upgrade and battery replacement.', performedBy: 'Service Partner', cost: 300 },
      ],
    },
    {
      id: 'gs2',
      name: 'FieldNode X',
      model: 'FN-X100',
      manufacturer: 'GeoConnect',
      uniqueId: 'GS-GC-002',
      status: 'Deployed',
      coverageArea: '2 km radius',
      powerSource: 'Generator',
      imageUrl: 'https://placehold.co/400x300/34495e/ffffff?text=FieldNode+X',
      type: 'Ground Station',
      maintenanceHistory: [
        { date: '2025-07-01', description: 'Routine power supply check.', performedBy: 'Local Team' },
      ],
    },
  ]);

  const handleAddGS = () => setCurrentView('add-gs');
  const handleViewGSDetails = (id) => {
    setSelectedGS(groundStations.find(gs => gs.id === id));
    setCurrentView('details');
  };
  const handleEditGS = () => {
    setCurrentView('edit-gs');
  };
  const handleDeleteGS = () => {
    setConfirmingDeleteGS(selectedGS.id);
  };
  const handleConfirmDeleteGS = () => {
    setGroundStations(groundStations.filter(gs => gs.id !== confirmingDeleteGS));
    setConfirmingDeleteGS(null);
    setSelectedGS(null);
    setCurrentView('list');
  };
  const handleCancelDeleteGS = () => {
    setConfirmingDeleteGS(null);
  };
  const handleViewGSMaintenanceHistory = () => {
    setCurrentView('maintenance-history');
  };

  const handleSaveGS = (updatedGS) => {
    if (currentView === 'add-gs') {
      setGroundStations([...groundStations, updatedGS]);
    } else if (currentView === 'edit-gs') {
      setGroundStations(groundStations.map(gs => (gs.id === updatedGS.id ? updatedGS : gs)));
      setSelectedGS(updatedGS);
    }
    setCurrentView('list');
  };

  const handleBackToGSList = () => {
    setCurrentView('list');
    setSelectedGS(null);
  };

  if (currentView === 'add-gs') {
    return <AddItemForm title="Ground Station" onSave={handleSaveGS} onCancel={handleBackToGSList} assetType="Ground Station" />;
  }
  if (currentView === 'edit-gs') {
    return <AddItemForm title="Ground Station" onSave={handleSaveGS} onCancel={handleBackToGSList} assetType="Ground Station" initialData={selectedGS} />;
  }
  if (currentView === 'details') {
    return (
      <>
        <AssetDetails
          asset={selectedGS}
          onBack={handleBackToGSList}
          onEdit={handleEditGS}
          onDelete={handleDeleteGS}
          onViewMaintenanceHistory={handleViewGSMaintenanceHistory}
          assetTypeIcon={Factory}
        />
        {confirmingDeleteGS && (
          <ConfirmationModal
            message={`Are you sure you want to delete ground station "${selectedGS?.name}"? This action cannot be undone.`}
            onConfirm={handleConfirmDeleteGS}
            onCancel={handleCancelDeleteGS}
          />
        )}
      </>
    );
  }
  if (currentView === 'maintenance-history') {
    return <MaintenanceHistoryView asset={selectedGS} onBack={() => setCurrentView('details')} />;
  }

  return (
    <AssetList
      title="Ground Station Management"
      assets={groundStations}
      onAddItem={handleAddGS}
      onViewDetails={handleViewGSDetails}
      assetTypeIcon={Factory}
    />
  );
};

// --- INLINED Equipment Component ---
const Equipment = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add-equipment', 'edit-equipment', 'details', 'maintenance-history'
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [confirmingDeleteEquipment, setConfirmingDeleteEquipment] = useState(null);

  const [equipment, setEquipment] = useState([
    {
      id: 'eq1',
      name: 'High-Res Camera X1',
      model: 'HRC-X1',
      manufacturer: 'OptiLens',
      uniqueId: 'EQ-OL-001',
      status: 'Available',
      equipmentType: 'Camera',
      compatibility: 'AV-F100, SG-S200',
      imageUrl: 'https://placehold.co/400x300/1abc9c/ffffff?text=Camera+X1',
      type: 'Equipment',
      maintenanceHistory: [
        { date: '2025-04-01', description: 'Lens cleaning and sensor calibration.', performedBy: 'Internal Tech' },
      ],
    },
    {
      id: 'eq2',
      name: 'Thermal Sensor T3',
      model: 'TS-T3',
      manufacturer: 'InfraScan',
      uniqueId: 'EQ-IS-002',
      status: 'In Maintenance',
      equipmentType: 'Sensor',
      compatibility: 'AV-F100',
      imageUrl: 'https://placehold.co/400x300/e67e22/ffffff?text=Thermal+Sensor',
      type: 'Equipment',
      maintenanceHistory: [
        { date: '2025-07-10', description: 'Thermal array recalibration.', performedBy: 'Manufacturer Service', cost: 250 },
      ],
    },
  ]);

  const handleAddEquipment = () => setCurrentView('add-equipment');
  const handleViewEquipmentDetails = (id) => {
    setSelectedEquipment(equipment.find(eq => eq.id === id));
    setCurrentView('details');
  };
  const handleEditEquipment = () => {
    setCurrentView('edit-equipment');
  };
  const handleDeleteEquipment = () => {
    setConfirmingDeleteEquipment(selectedEquipment.id);
  };
  const handleConfirmDeleteEquipment = () => {
    setEquipment(equipment.filter(eq => eq.id !== confirmingDeleteEquipment));
    setConfirmingDeleteEquipment(null);
    setSelectedEquipment(null);
    setCurrentView('list');
  };
  const handleCancelDeleteEquipment = () => {
    setConfirmingDeleteEquipment(null);
  };
  const handleViewEquipmentMaintenanceHistory = () => {
    setCurrentView('maintenance-history');
  };

  const handleSaveEquipment = (updatedEq) => {
    if (currentView === 'add-equipment') {
      setEquipment([...equipment, updatedEq]);
    } else if (currentView === 'edit-equipment') {
      setEquipment(equipment.map(eq => (eq.id === updatedEq.id ? updatedEq : eq)));
      setSelectedEquipment(updatedEq);
    }
    setCurrentView('list');
  };

  const handleBackToEquipmentList = () => {
    setCurrentView('list');
    setSelectedEquipment(null);
  };

  if (currentView === 'add-equipment') {
    return <AddItemForm title="Equipment" onSave={handleSaveEquipment} onCancel={handleBackToEquipmentList} assetType="Equipment" />;
  }
  if (currentView === 'edit-equipment') {
    return <AddItemForm title="Equipment" onSave={handleSaveEquipment} onCancel={handleBackToEquipmentList} assetType="Equipment" initialData={selectedEquipment} />;
  }
  if (currentView === 'details') {
    return (
      <>
        <AssetDetails
          asset={selectedEquipment}
          onBack={handleBackToEquipmentList}
          onEdit={handleEditEquipment}
          onDelete={handleDeleteEquipment}
          onViewMaintenanceHistory={handleViewEquipmentMaintenanceHistory}
          assetTypeIcon={Wrench}
        />
        {confirmingDeleteEquipment && (
          <ConfirmationModal
            message={`Are you sure you want to delete equipment "${selectedEquipment?.name}"? This action cannot be undone.`}
            onConfirm={handleConfirmDeleteEquipment}
            onCancel={handleCancelDeleteEquipment}
          />
        )}
      </>
    );
  }
  if (currentView === 'maintenance-history') {
    return <MaintenanceHistoryView asset={selectedEquipment} onBack={() => setCurrentView('details')} />;
  }

  return (
    <AssetList
      title="Equipment Management"
      assets={equipment}
      onAddItem={handleAddEquipment}
      onViewDetails={handleViewEquipmentDetails}
      assetTypeIcon={Wrench}
    />
  );
};

// --- INLINED Batteries Component ---
const Batteries = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add-battery', 'edit-battery', 'details', 'maintenance-history'
  const [selectedBattery, setSelectedBattery] = useState(null);
  const [confirmingDeleteBattery, setConfirmingDeleteBattery] = useState(null);

  const [batteries, setBatteries] = useState([
    {
      id: 'bat1',
      name: 'Drone Battery XL',
      model: 'DB-XL5000',
      manufacturer: 'PowerCell Inc.',
      uniqueId: 'BAT-PC-001',
      status: 'Available',
      capacity: 5000,
      cycleCount: 45,
      lastCharged: '2025-07-19',
      imageUrl: 'https://placehold.co/400x300/3498db/ffffff?text=Battery+XL',
      type: 'Battery',
      maintenanceHistory: [
        { date: '2025-06-15', description: 'Routine cycle check, cell balancing.', performedBy: 'Internal Tech' },
      ],
    },
    {
      id: 'bat2',
      name: 'Compact Drone Battery',
      model: 'CDB-2500',
      manufacturer: 'VoltTech',
      uniqueId: 'BAT-VT-002',
      status: 'In Maintenance',
      capacity: 2500,
      cycleCount: 120,
      lastCharged: '2025-07-10',
      imageUrl: 'https://placehold.co/400x300/f1c40f/ffffff?text=Battery+CDB',
      type: 'Battery',
      maintenanceHistory: [
        { date: '2025-07-12', description: 'Capacity degradation test, cell replacement.', performedBy: 'Specialized Repair', cost: 100 },
      ],
    },
  ]);

  const handleAddBattery = () => setCurrentView('add-battery');
  const handleViewBatteryDetails = (id) => {
    setSelectedBattery(batteries.find(bat => bat.id === id));
    setCurrentView('details');
  };
  const handleEditBattery = () => {
    setCurrentView('edit-battery');
  };
  const handleDeleteBattery = () => {
    setConfirmingDeleteBattery(selectedBattery.id);
  };
  const handleConfirmDeleteBattery = () => {
    setBatteries(batteries.filter(bat => bat.id !== confirmingDeleteBattery));
    setConfirmingDeleteBattery(null);
    setSelectedBattery(null);
    setCurrentView('list');
  };
  const handleCancelDeleteBattery = () => {
    setConfirmingDeleteBattery(null);
  };
  const handleViewBatteryMaintenanceHistory = () => {
    setCurrentView('maintenance-history');
  };

  const handleSaveBattery = (updatedBat) => {
    if (currentView === 'add-battery') {
      setBatteries([...batteries, updatedBat]);
    } else if (currentView === 'edit-battery') {
      setBatteries(batteries.map(bat => (bat.id === updatedBat.id ? updatedBat : bat)));
      setSelectedBattery(updatedBat);
    }
    setCurrentView('list');
  };

  const handleBackToBatteryList = () => {
    setCurrentView('list');
    setSelectedBattery(null);
  };

  if (currentView === 'add-battery') {
    return <AddItemForm title="Battery" onSave={handleSaveBattery} onCancel={handleBackToBatteryList} assetType="Battery" />;
  }
  if (currentView === 'edit-battery') {
    return <AddItemForm title="Battery" onSave={handleSaveBattery} onCancel={handleBackToBatteryList} assetType="Battery" initialData={selectedBattery} />;
  }
  if (currentView === 'details') {
    return (
      <>
        <AssetDetails
          asset={selectedBattery}
          onBack={handleBackToBatteryList}
          onEdit={handleEditBattery}
          onDelete={handleDeleteBattery}
          onViewMaintenanceHistory={handleViewBatteryMaintenanceHistory}
          assetTypeIcon={BatteryMedium}
        />
        {confirmingDeleteBattery && (
          <ConfirmationModal
            message={`Are you sure you want to delete battery "${selectedBattery?.name}"? This action cannot be undone.`}
            onConfirm={handleConfirmDeleteBattery}
            onCancel={handleCancelDeleteBattery}
          />
        )}
      </>
    );
  }
  if (currentView === 'maintenance-history') {
    return <MaintenanceHistoryView asset={selectedBattery} onBack={() => setCurrentView('details')} />;
  }

  return (
    <AssetList
      title="Battery Management"
      assets={batteries}
      onAddItem={handleAddBattery}
      onViewDetails={handleViewBatteryDetails}
      assetTypeIcon={BatteryMedium}
    />
  );
};

// --- Media Component Sub-Components (Moved to top-level) ---

// Upload Media Form Component
const UploadMediaForm = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('image');
  const [url, setUrl] = useState('');
  const [droneId, setDroneId] = useState('');
  const [missionId, setMissionId] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(''); // Comma-separated tags

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      type,
      url,
      thumbnail: type === 'video' ? 'https://placehold.co/300x200/cccccc/333333?text=Video+Placeholder' : url, // Use URL as thumbnail for images, generic for video
      droneId,
      missionId,
      timestamp: new Date().toISOString(),
      gps: 'N/A', // Placeholder
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      description,
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Upload New Media</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Media Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">Media URL (Placeholder)</label>
          <input type="url" id="url" value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., https://example.com/image.jpg or video.mp4" required />
          <p className="mt-1 text-xs text-gray-500">In a real app, this would be a file upload field.</p>
        </div>
        <div>
          <label htmlFor="droneId" className="block text-sm font-medium text-gray-700">Drone ID</label>
          <input type="text" id="droneId" value={droneId} onChange={(e) => setDroneId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="missionId" className="block text-sm font-medium text-gray-700">Mission ID</label>
          <input type="text" id="missionId" value={missionId} onChange={(e) => setMissionId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., security, patrol, night" />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">
            Upload Media
          </button>
        </div>
      </form>
    </div>
  );
};

// Edit Media Form Component
const EditMediaForm = ({ onSave, onCancel, initialData }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [droneId, setDroneId] = useState(initialData.droneId || '');
  const [missionId, setMissionId] = useState(initialData.missionId || '');
  const [gps, setGps] = useState(initialData.gps || '');
  const [tagsInput, setTagsInput] = useState(initialData.tags ? initialData.tags.join(', ') : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...initialData,
      title,
      description,
      droneId,
      missionId,
      gps,
      tags: tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Media Details</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" id="editTitle" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="editDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div>
          <label htmlFor="editDroneId" className="block text-sm font-medium text-gray-700">Drone ID</label>
          <input type="text" id="editDroneId" value={droneId} onChange={(e) => setDroneId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="editMissionId" className="block text-sm font-medium text-gray-700">Mission ID</label>
          <input type="text" id="editMissionId" value={missionId} onChange={(e) => setMissionId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="editGps" className="block text-sm font-medium text-gray-700">GPS Coordinates</label>
          <input type="text" id="editGps" value={gps} onChange={(e) => setGps(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="editTags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input type="text" id="editTags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., security, patrol, night" />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

// Media Detail View Component
const MediaDetailView = ({ media, onBack, onAddTag, onRemoveTag, onEdit, onDelete }) => {
  const [newTagInput, setNewTagInput] = useState('');
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = () => {
    alert(`Downloading ${media.title}...`);
    window.open(media.url, '_blank'); // Simulate download by opening in new tab
  };

  const handleAddTagClick = () => {
    if (newTagInput.trim() && !media.tags.includes(newTagInput.trim())) {
      onAddTag(media.id, newTagInput.trim());
      setNewTagInput('');
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFastForward = () => {
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  const handleRewind = () => {
    if (videoRef.current) videoRef.current.currentTime -= 10;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Media Details: {media.title}</h3>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Back to Media Library
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="lg:col-span-1 bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center justify-center relative">
          {media.type === 'video' ? (
            <>
              <video ref={videoRef} controls={false} src={media.url} className="w-full h-auto max-h-96 object-contain"></video>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 flex justify-center items-center p-2 space-x-4">
                <button onClick={handleRewind} className="text-white hover:text-gray-300"><Rewind className="w-6 h-6" /></button>
                <button onClick={togglePlayPause} className="text-white hover:text-gray-300">
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </button>
                <button onClick={handleFastForward} className="text-white hover:text-gray-300"><FastForward className="w-6 h-6" /></button>
                <input type="range" min="0" max="1" step="0.01" defaultValue="1" onChange={(e) => { if(videoRef.current) videoRef.current.volume = e.target.value; }} className="w-24" />
                <Volume2 className="w-5 h-5 text-white" />
              </div>
            </>
          ) : (
            <img src={media.url} alt={media.title} className="w-full h-auto max-h-96 object-contain" />
          )}
        </div>
        <div className="lg:col-span-1 space-y-4">
          <h4 className="text-xl font-semibold text-gray-800">Metadata</h4>
          <p className="text-gray-700">Type: <span className="font-medium">{media.type === 'video' ? 'Video' : 'Image'}</span></p>
          <p className="text-gray-700">Drone ID: <span className="font-medium">{media.droneId}</span></p>
          <p className="text-gray-700">Mission ID: <span className="font-medium">{media.missionId}</span></p>
          <p className="text-gray-700">Timestamp: <span className="font-medium">{new Date(media.timestamp).toLocaleString()}</span></p>
          <p className="text-gray-700">GPS Coordinates: <span className="font-medium">{media.gps}</span></p>
          <p className="text-gray-700">Description: <span className="font-medium">{media.description || 'N/A'}</span></p>

          <div>
            <h5 className="text-lg font-semibold text-gray-800 mb-2">Tags:</h5>
            <div className="flex flex-wrap gap-2 mb-3">
              {media.tags.map(tag => (
                <span key={tag} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                  <button onClick={() => onRemoveTag(media.id, tag)} className="ml-2 text-blue-600 hover:text-blue-800">
                    <XCircle className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add new tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm"
              />
              <button onClick={handleAddTagClick} className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">
                Add Tag
              </button>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700">
              <Download className="w-5 h-5 mr-2" /> Download Original
            </button>
            <button onClick={onEdit} className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md shadow-sm text-sm font-medium hover:bg-yellow-600">
              <Edit className="w-4 h-4 mr-2" /> Edit Metadata
            </button>
            <button onClick={onDelete} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Media
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- INLINED Media Component ---
const Media = ({ mediaItems, setMediaItems }) => { // Receive mediaItems and setMediaItems as props
  const [currentView, setCurrentView] = useState('list'); // 'list', 'details', 'upload', 'edit-media'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'image', 'video'
  const [confirmingDeleteMedia, setConfirmingDeleteMedia] = useState(null);


  const allTags = ['perimeter', 'security', 'day-flight', 'inspection', 'factory', 'roof', 'infrastructure', 'bridge', 'analysis', 'live-capture']; // Master list of tags

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.droneId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.missionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          item.gps.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.timestamp.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || item.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (id) => {
    setSelectedMedia(mediaItems.find(item => item.id === id));
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedMedia(null);
  };

  const handleUploadMedia = (newMedia) => {
    setMediaItems(prevItems => [...prevItems, { id: `m${prevItems.length + 1}`, ...newMedia }]);
    setCurrentView('list');
  };

  const handleUpdateMedia = (updatedMedia) => {
    setMediaItems(prevItems => prevItems.map(item => (item.id === updatedMedia.id ? updatedMedia : item)));
    setSelectedMedia(updatedMedia); // Update selected media in state
    setCurrentView('details'); // Stay on details page after edit
  };

  const handleDeleteMedia = (id) => {
    setConfirmingDeleteMedia(id);
  };

  const handleConfirmDeleteMedia = () => {
    setMediaItems(mediaItems.filter(item => item.id !== confirmingDeleteMedia));
    setConfirmingDeleteMedia(null);
    setSelectedMedia(null);
    setCurrentView('list');
  };

  const handleCancelDeleteMedia = () => {
    setConfirmingDeleteMedia(null);
  };

  const handleAddTagToMedia = (mediaId, newTag) => {
    setMediaItems(prevItems => prevItems.map(item =>
      item.id === mediaId
        ? { ...item, tags: [...new Set([...item.tags, newTag])] } // Add unique tag
        : item
    ));
    setSelectedMedia(prev => prev ? { ...prev, tags: [...new Set([...prev.tags, newTag])] } : null); // Update selected media if viewing
  };

  const handleRemoveTagFromMedia = (mediaId, tagToRemove) => {
    setMediaItems(prevItems => prevItems.map(item =>
      item.id === mediaId
        ? { ...item, tags: item.tags.filter(tag => tag !== tagToRemove) }
        : item
    ));
    setSelectedMedia(prev => prev ? { ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) } : null); // Update selected media if viewing
  };


  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      {currentView === 'list' && (
        <>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Captured Media Library</h2>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setCurrentView('upload')}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              <Upload className="w-5 h-5 mr-2" /> Upload Media
            </button>
            <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Folder className="w-4 h-4 inline-block mr-1" /> All Media
              </button>
              <button
                onClick={() => setFilterType('image')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'image' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ImageIcon className="w-4 h-4 inline-block mr-1" /> Images
              </button>
              <button
                onClick={() => setFilterType('video')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'video' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <VideoIcon className="w-4 h-4 inline-block mr-1" /> Videos
              </button>
            </div>
            <input
              type="text"
              placeholder="Search media by title, drone, mission, date, tags, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
            />
          </div>

          {filteredMedia.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-500 text-lg">No media found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
              {filteredMedia.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
                  onClick={() => handleViewDetails(item.id)}
                >
                  <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {item.type === 'video' ? (
                      <video src={item.thumbnail} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.type === 'video' ? <PlayCircle className="w-12 h-12 text-white" /> : <ImageIcon className="w-12 h-12 text-white" />}
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-600">Type: {item.type}</p>
                    <p className="text-sm text-gray-600">Drone: {item.droneId}</p>
                    <p className="text-sm text-gray-600">Mission: {item.missionId}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {currentView === 'details' && selectedMedia && (
        <MediaDetailView
          media={selectedMedia}
          onBack={handleBackToList}
          onAddTag={handleAddTagToMedia}
          onRemoveTag={handleRemoveTagFromMedia}
          onEdit={() => setCurrentView('edit-media')}
          onDelete={() => handleDeleteMedia(selectedMedia.id)}
        />
      )}
      {currentView === 'upload' && (
        <UploadMediaForm
          onSave={handleUploadMedia}
          onCancel={handleBackToList}
        />
      )}
      {currentView === 'edit-media' && selectedMedia && (
        <EditMediaForm
          initialData={selectedMedia}
          onSave={handleUpdateMedia}
          onCancel={() => setCurrentView('details')} // Go back to details after cancel
        />
      )}
      {confirmingDeleteMedia && (
        <ConfirmationModal
          message={`Are you sure you want to delete "${mediaItems.find(item => item.id === confirmingDeleteMedia)?.title}"? This action cannot be undone.`}
          onConfirm={handleConfirmDeleteMedia}
          onCancel={handleCancelDeleteMedia}
        />
      )}
    </div>
  );
};

// --- Files Component Sub-Components (Moved to top-level) ---

// Upload File Form Component
const UploadFileForm = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('PDF');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      type,
      url,
      category,
      uploadDate: new Date().toISOString().slice(0, 10),
      description,
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Upload New Document</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fileName" className="block text-sm font-medium text-gray-700">File Name</label>
          <input type="text" id="fileName" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">File Type</label>
          <select id="fileType" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="XLSX">XLSX</option>
            <option value="TXT">TXT</option>
          </select>
        </div>
        <div>
          <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700">File URL (Placeholder)</label>
          <input type="url" id="fileUrl" value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., https://example.com/document.pdf" required />
          <p className="mt-1 text-xs text-gray-500">In a real app, this would be a file upload field.</p>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., Manuals, Reports, Templates" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">
            Upload Document
          </button>
        </div>
      </form>
    </div>
  );
};

// View Document Component
const ViewDocument = ({ file, onBack, onDownload, onDelete }) => {
  if (!file) return <div className="text-center text-gray-500">Document not found.</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Viewing: {file.name}</h3>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Back to Files
        </button>
      </div>

      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden mb-6">
        {file.type === 'PDF' ? (
          <iframe src={file.url} title={file.name} className="w-full h-full min-h-[600px]"></iframe>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600 text-lg">
            <FileText className="w-12 h-12 mr-3" />
            <p>Preview not available for {file.type} files. Please download.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button onClick={() => onDownload(file.url, file.name)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700">
          <Download className="w-5 h-5 mr-2" /> Download {file.type}
        </button>
        <button onClick={onDelete} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700">
          <Trash2 className="w-4 h-4 mr-2" /> Delete File
        </button>
      </div>
    </div>
  );
};

// --- INLINED Files Component ---
const Files = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'upload', 'view-document'
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([
    {
      id: 'f1',
      name: 'Drone X1 Flight Manual',
      type: 'PDF',
      url: 'https://www.africau.edu/images/default/sample.pdf', // Example PDF
      category: 'Flight Manuals',
      uploadDate: '2025-01-10',
      description: 'Official flight manual for Drone X1 model.',
    },
    {
      id: 'f2',
      name: 'Safety Protocol V2.0',
      type: 'PDF',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Another example PDF
      category: 'Safety Protocols',
      uploadDate: '2025-03-05',
      description: 'Updated safety guidelines for all drone operations.',
    },
    {
      id: 'f3',
      name: 'Incident Report Template',
      type: 'DOCX', // Example of a non-PDF file
      url: 'https://docs.google.com/document/d/1B_e0dY0_q_s_J_h_2_x_f_3_y_4_z_5_a_6_b_7_c_8_d_9_e_0', // Placeholder for docx
      category: 'Templates',
      uploadDate: '2025-06-20',
      description: 'Standard template for reporting operational incidents.',
    },
  ]);
  const [confirmingDeleteFile, setConfirmingDeleteFile] = useState(null);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewFile = (id) => {
    setSelectedFile(files.find(file => file.id === id));
    setCurrentView('view-document');
  };

  const handleBackToFileList = () => {
    setCurrentView('list');
    setSelectedFile(null);
  };

  const handleUploadFile = (newFile) => {
    setFiles(prevFiles => [...prevFiles, { id: `f${prevFiles.length + 1}`, ...newFile }]);
    setCurrentView('list');
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    // Simulate download by opening in a new tab/window
    window.open(fileUrl, '_blank');
  };

  const handleDeleteFile = (id) => {
    setConfirmingDeleteFile(id);
  };

  const handleConfirmDeleteFile = () => {
    setFiles(files.filter(file => file.id !== confirmingDeleteFile));
    setConfirmingDeleteFile(null);
    setSelectedFile(null);
    setCurrentView('list');
  };

  const handleCancelDeleteFile = () => {
    setConfirmingDeleteFile(null);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      {currentView === 'list' && (
        <>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Document Library</h2>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setCurrentView('upload')}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              <Upload className="w-5 h-5 mr-2" /> Upload Document
            </button>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
            />
          </div>

          {filteredFiles.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-500 text-lg">No documents found matching your criteria.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 flex-1 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map(file => (
                    <tr key={file.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{file.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.uploadDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleViewFile(file.id)} className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button onClick={() => handleDeleteFile(file.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {currentView === 'upload' && (
        <UploadFileForm onSave={handleUploadFile} onCancel={handleBackToFileList} />
      )}
      {currentView === 'view-document' && selectedFile && (
        <ViewDocument file={selectedFile} onBack={handleBackToFileList} onDownload={handleDownloadFile} onDelete={() => handleDeleteFile(selectedFile.id)} />
      )}
      {confirmingDeleteFile && (
        <ConfirmationModal
          message={`Are you sure you want to delete "${files.find(file => file.id === confirmingDeleteFile)?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDeleteFile}
          onCancel={handleCancelDeleteFile}
        />
      )}
    </div>
  );
};

// --- Checklist Component Sub-Components (Moved to top-level) ---

// Checklist Form Component (for Create/Edit)
const ChecklistForm = ({ onSave, onCancel, initialData = null }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [items, setItems] = useState(initialData?.items.map(item => ({ id: item.id, text: item.text })) || [{ id: `item-${Date.now()}-1`, text: '' }]);

  const handleItemChange = (id, newText) => {
    setItems(items.map(item => item.id === id ? { ...item, text: newText } : item));
  };

  const handleAddItem = () => {
    setItems([...items, { id: `item-${Date.now()}-${items.length + 1}`, text: '' }]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...initialData, // Preserve original data like ID if editing
      name,
      description,
      items: items.filter(item => item.text.trim() !== '').map(item => ({ ...item, completed: false, notes: '' })), // Ensure items have text and reset completion status
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{initialData ? 'Edit Checklist Template' : 'Create New Checklist Template'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Checklist Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-800">Checklist Items:</h4>
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-2">
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleItemChange(item.id, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
              <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full">
                <MinusCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddItem} className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </button>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">
            {initialData ? 'Save Changes' : 'Create Checklist'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Checklist Detail/Completion View
const ChecklistDetailView = ({ checklist, onBack, onComplete }) => {
  const [currentItems, setCurrentItems] = useState(checklist.items.map(item => ({ ...item })));
  const [completionNotes, setCompletionNotes] = useState('');

  const handleToggleComplete = (itemId) => {
    setCurrentItems(currentItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleItemNotesChange = (itemId, newNotes) => {
    setCurrentItems(currentItems.map(item =>
      item.id === itemId ? { ...item, notes: newNotes } : item
    ));
  };

  const handleSubmitCompletion = () => {
    const allItemsCompleted = currentItems.every(item => item.completed);
    if (!allItemsCompleted && checklist.type !== 'completed') {
      alert('Please complete all items before submitting.');
      return;
    }
    onComplete({
      ...checklist,
      items: currentItems,
      completionNotes: completionNotes,
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{checklist.name}</h3>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Back to Checklists
        </button>
      </div>

      <p className="text-gray-700 mb-4">{checklist.description}</p>

      {checklist.type === 'completed' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mb-4 rounded-md">
          <p className="font-semibold">Completed on: {checklist.dateCompleted} by {checklist.completedBy}</p>
          {checklist.completionNotes && <p className="text-sm mt-1">Notes: {checklist.completionNotes}</p>}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {currentItems.map(item => (
          <div key={item.id} className="flex items-start p-3 border border-gray-200 rounded-md bg-gray-50">
            {checklist.type !== 'completed' ? (
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleComplete(item.id)}
                className="mt-1 mr-3 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            ) : (
              item.completed ? <CheckSquare className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-1" /> : <Square className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <p className={`text-lg font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{item.text}</p>
              {checklist.type !== 'completed' ? (
                <textarea
                  placeholder="Add notes..."
                  value={item.notes}
                  onChange={(e) => handleItemNotesChange(item.id, e.target.value)}
                  rows="1"
                  className="mt-2 w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              ) : (
                item.notes && <p className="text-sm text-gray-600 mt-1">Notes: {item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {checklist.type !== 'completed' && (
        <div className="mt-6">
          <label htmlFor="completionNotes" className="block text-sm font-medium text-gray-700 mb-2">Overall Completion Notes:</label>
          <textarea
            id="completionNotes"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any final notes or observations for this completed checklist..."
          ></textarea>
          <div className="flex justify-end mt-4">
            <button onClick={handleSubmitCompletion} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
              Submit Completed Checklist
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- INLINED Checklists Component ---
const Checklists = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'details', 'completed'
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [confirmingDeleteChecklist, setConfirmingDeleteChecklist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [checklists, setChecklists] = useState([
    {
      id: 'cl1',
      name: 'Pre-Flight Checklist (Standard)',
      description: 'Standard checks before every drone flight.',
      items: [
        { id: 'item1', text: 'Battery charged and secured', completed: false, notes: '' },
        { id: 'item2', text: 'Propellers attached correctly', completed: false, notes: '' },
        { id: 'item3', text: 'Gimbal lock removed', completed: false, notes: '' },
        { id: 'item4', text: 'GPS signal acquired', completed: false, notes: '' },
        { id: 'item5', text: 'Clearance for takeoff', completed: false, notes: '' },
      ],
      type: 'template', // 'template' or 'completed'
      dateCompleted: null,
      completedBy: null,
    },
    {
      id: 'cl2',
      name: 'Post-Flight Inspection',
      description: 'Checks to perform after landing and before storage.',
      items: [
        { id: 'item6', text: 'Drone powered off', completed: false, notes: '' },
        { id: 'item7', text: 'Battery removed and cooled', completed: false, notes: '' },
        { id: 'item8', text: 'Visual inspection for damage', completed: false, notes: '' },
      ],
      type: 'template',
      dateCompleted: null,
      completedBy: null,
    },
    {
      id: 'cl3',
      name: 'Maintenance Check (Weekly)',
      description: 'Weekly maintenance routine for drone fleet.',
      items: [
        { id: 'item9', text: 'Clean drone body', completed: true, notes: 'Used compressed air.' },
        { id: 'item10', text: 'Check motor bearings', completed: true, notes: 'All good.' },
        { id: 'item11', text: 'Software update check', completed: false, notes: '' },
      ],
      type: 'completed',
      dateCompleted: '2025-07-10',
      completedBy: 'Tech John',
    },
  ]);

  const filteredChecklists = checklists.filter(cl =>
    cl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cl.completedBy && cl.completedBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateChecklist = () => setCurrentView('create');
  const handleEditChecklist = (id) => {
    setSelectedChecklist(checklists.find(cl => cl.id === id));
    setCurrentView('edit');
  };
  const handleDeleteChecklist = (id) => {
    setConfirmingDeleteChecklist(id);
  };
  const handleConfirmDeleteChecklist = () => {
    setChecklists(checklists.filter(cl => cl.id !== confirmingDeleteChecklist));
    setConfirmingDeleteChecklist(null);
    setSelectedChecklist(null);
    setCurrentView('list');
  };
  const handleCancelDeleteChecklist = () => {
    setConfirmingDeleteChecklist(null);
  };
  const handleViewChecklistDetails = (id) => {
    setSelectedChecklist(checklists.find(cl => cl.id === id));
    setCurrentView('details');
  };

  const handleSaveChecklist = (updatedChecklist) => {
    if (currentView === 'create') {
      setChecklists(prevChecklists => [...prevChecklists, { ...updatedChecklist, id: `cl${prevChecklists.length + 1}`, type: 'template' }]);
    } else if (currentView === 'edit') {
      setChecklists(prevChecklists => prevChecklists.map(cl => (cl.id === updatedChecklist.id ? updatedChecklist : cl)));
      setSelectedChecklist(updatedChecklist);
    }
    setCurrentView('list');
  };

  const handleBackToChecklistList = () => {
    setCurrentView('list');
    setSelectedChecklist(null);
  };

  const handleCompleteChecklist = (completedChecklistData) => {
    setChecklists(prevChecklists => [...prevChecklists, {
      ...completedChecklistData,
      id: `cl${prevChecklists.length + 1}-completed`,
      type: 'completed',
      dateCompleted: new Date().toISOString().slice(0, 10),
      completedBy: 'Current User (Simulated)',
    }]);
    setCurrentView('list');
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      {currentView === 'list' && (
        <>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Checklists</h2>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleCreateChecklist}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5 mr-2" /> Create New Checklist
            </button>
            <input
              type="text"
              placeholder="Search checklists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
            />
          </div>

          {filteredChecklists.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-500 text-lg">No checklists found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
              {filteredChecklists.map(cl => (
                <div key={cl.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{cl.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{cl.description}</p>
                    {cl.type === 'completed' && (
                      <p className="text-xs text-blue-600 mb-2">Completed: {cl.dateCompleted} by {cl.completedBy}</p>
                    )}
                    <ul className="list-disc list-inside text-sm text-gray-700 mb-4 space-y-1">
                      {cl.items.slice(0, 3).map((item, index) => (
                        <li key={item.id} className={item.completed ? 'line-through text-gray-500' : ''}>
                          {item.text}
                        </li>
                      ))}
                      {cl.items.length > 3 && <li className="text-gray-500">...and {cl.items.length - 3} more items</li>}
                    </ul>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={() => handleViewChecklistDetails(cl.id)} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200">
                      View/Complete
                    </button>
                    {cl.type === 'template' && (
                      <button onClick={() => handleEditChecklist(cl.id)} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200">
                        Edit
                      </button>
                    )}
                    <button onClick={() => handleDeleteChecklist(cl.id)} className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {currentView === 'create' && (
        <ChecklistForm onSave={handleSaveChecklist} onCancel={handleBackToChecklistList} />
      )}
      {currentView === 'edit' && selectedChecklist && (
        <ChecklistForm onSave={handleSaveChecklist} onCancel={handleBackToChecklistList} initialData={selectedChecklist} />
      )}
      {currentView === 'details' && selectedChecklist && (
        <ChecklistDetailView checklist={selectedChecklist} onBack={handleBackToChecklistList} onComplete={handleCompleteChecklist} />
      )}
      {confirmingDeleteChecklist && (
        <ConfirmationModal
          message={`Are you sure you want to delete checklist "${checklists.find(cl => cl.id === confirmingDeleteChecklist)?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDeleteChecklist}
          onCancel={handleCancelDeleteChecklist}
        />
      )}
    </div>
  );
};

// --- Tag Component Sub-Components (Moved to top-level) ---

// Tag Form Component (for Create/Edit)
const TagForm = ({ onSave, onCancel, initialData = null }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...initialData, name, description }); // Preserve ID if editing
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{initialData ? 'Edit Tag' : 'Create New Tag'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tagName" className="block text-sm font-medium text-gray-700">Tag Name</label>
          <input type="text" id="tagName" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="tagDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="tagDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">
            {initialData ? 'Save Changes' : 'Create Tag'}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- INLINED Tags Component ---
const Tags = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedTag, setSelectedTag] = useState(null);
  const [confirmingDeleteTag, setConfirmingDeleteTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [tags, setTags] = useState([
    { id: 't1', name: 'Security', description: 'Tags related to security operations.' },
    { id: 't2', name: 'Inspection', description: 'Tags for inspection missions and media.' },
    { id: 't3', name: 'Maintenance', description: 'Tags for maintenance activities and assets.' },
    { id: 't4', name: 'Aerial Survey', description: 'Tags for general aerial surveying.' },
  ]);

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = () => setCurrentView('create');
  const handleEditTag = (id) => {
    setSelectedTag(tags.find(tag => tag.id === id));
    setCurrentView('edit');
  };
  const handleDeleteTag = (id) => {
    setConfirmingDeleteTag(id);
  };
  const handleConfirmDeleteTag = () => {
    setTags(tags.filter(tag => tag.id !== confirmingDeleteTag));
    setConfirmingDeleteTag(null);
    setSelectedTag(null);
    setCurrentView('list');
  };
  const handleCancelDeleteTag = () => {
    setConfirmingDeleteTag(null);
  };

  const handleSaveTag = (updatedTag) => {
    if (currentView === 'create') {
      setTags(prevTags => [...prevTags, { ...updatedTag, id: `t${prevTags.length + 1}` }]);
    } else if (currentView === 'edit') {
      setTags(prevTags => prevTags.map(tag => (tag.id === updatedTag.id ? updatedTag : tag)));
      setSelectedTag(updatedTag);
    }
    setCurrentView('list');
  };

  const handleBackToTagList = () => {
    setCurrentView('list');
    setSelectedTag(null);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      {currentView === 'list' && (
        <>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Tag Management</h2>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleCreateTag}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5 mr-2" /> Create New Tag
            </button>
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
            />
          </div>

          {filteredTags.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-500 text-lg">No tags found matching your criteria.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 flex-1 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTags.map(tag => (
                    <tr key={tag.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tag.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tag.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEditTag(tag.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                        <button onClick={() => handleDeleteTag(tag.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {currentView === 'create' && (
        <TagForm onSave={handleSaveTag} onCancel={handleBackToTagList} />
      )}
      {currentView === 'edit' && selectedTag && (
        <TagForm onSave={handleSaveTag} onCancel={handleBackToTagList} initialData={selectedTag} />
      )}
      {confirmingDeleteTag && (
        <ConfirmationModal
          message={`Are you sure you want to delete tag "${tags.find(tag => tag.id === confirmingDeleteTag)?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDeleteTag}
          onCancel={handleCancelDeleteTag}
        />
      )}
    </div>
  );
};


// --- INLINED ProfileSettings Component ---

const ProfileSettings = () => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Digital designer & photographer based in San Francisco.'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log('Profile updated:', formData);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Settings (Profile)</h2>
      <p className="text-gray-600 mb-6">Update your personal information and preferences.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};


// --- INLINED NotificationPreferences Component ---
const NotificationPreferences = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Notification Preferences</h2>
      <p className="text-gray-600">Configure how you receive system notifications.</p>
    </div>
  );
};

// Maintenance Section Component (from previous response, now integrated)
function MaintenanceSection({ maintenanceParts, setMaintenanceParts, displayMessage }) {
    const [partName, setPartName] = useState('');
    const [submissionDate, setSubmissionDate] = useState('');
    const [partStatus, setPartStatus] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [editingPartId, setEditingPartId] = useState(null); // State to track which part is being edited

    // Function to add or update a maintenance part
    const handleAddOrUpdatePart = () => {
        if (!partName || !submissionDate || !partStatus) {
            displayMessage("Please fill in all required fields (Part Name, Submission Date, Status).", 'error');
            return;
        }

        if (editingPartId) {
            // Update existing part
            setMaintenanceParts(maintenanceParts.map(part =>
                part.id === editingPartId
                    ? { ...part, name: partName, submissionDate, status: partStatus, deliveryDate: deliveryDate || 'N/A' }
                    : part
            ));
            displayMessage("Maintenance part updated successfully!", 'success');
            setEditingPartId(null); // Exit editing mode
        } else {
            // Add new part
            const newPart = {
                id: Date.now(), // Unique ID
                name: partName,
                submissionDate,
                status: partStatus,
                deliveryDate: deliveryDate || 'N/A',
            };
            setMaintenanceParts([...maintenanceParts, newPart]);
            displayMessage("Maintenance part added successfully!", 'success');
        }
        // Clear form fields after add/update
        setPartName('');
        setSubmissionDate('');
        setPartStatus('');
        setDeliveryDate('');
    };

    // Function to delete a maintenance part
    const handleDeletePart = (id) => {
        if (window.confirm("Are you sure you want to delete this maintenance part?")) {
            setMaintenanceParts(maintenanceParts.filter(part => part.id !== id));
            displayMessage("Maintenance part deleted.", 'info');
        }
    };

    // Function to set up form for editing
    const handleEditPart = (part) => {
        setPartName(part.name);
        setSubmissionDate(part.submissionDate);
        setPartStatus(part.status);
        setDeliveryDate(part.deliveryDate === 'N/A' ? '' : part.deliveryDate);
        setEditingPartId(part.id); // Enter editing mode
        displayMessage("Edit the details and click 'Update Part'.", 'info');
    };

    return (
        <section className="bg-gray-50 rounded-xl p-6 mb-8 shadow-md border border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 border-b-2 border-blue-300 pb-3 mb-6">
                Manage Maintenance
            </h2>

            {/* Add/Edit Part Form */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    {editingPartId ? 'Edit Part for Maintenance' : 'Add New Part for Maintenance'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Part Name"
                        value={partName}
                        onChange={(e) => setPartName(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />
                    <input
                        type="date"
                        value={submissionDate}
                        onChange={(e) => setSubmissionDate(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />
                    <select
                        value={partStatus}
                        onChange={(e) => setPartStatus(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Delayed">Delayed</option>
                    </select>
                    <input
                        type="date"
                        placeholder="Delivery Date (Optional)"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                </div>
                <button
                    onClick={handleAddOrUpdatePart}
                    className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                >
                    {editingPartId ? 'Update Part' : 'Add Part for Maintenance'}
                </button>
            </div>

            {/* Parts Under Maintenance List */}
            <div className="p-6 bg-white rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">Parts Under Maintenance</h3>
                {maintenanceParts.length === 0 ? (
                    <p className="text-center text-gray-500 italic p-4 bg-blue-50 rounded-lg">No parts currently under maintenance.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Part Name</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Submission Date</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Delivery Date</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {maintenanceParts.map((part) => (
                                    <tr key={part.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 whitespace-nowrap text-gray-800">{part.name}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-gray-800">{part.submissionDate}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                part.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                part.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                part.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {part.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-gray-800">{part.deliveryDate}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEditPart(part)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3 p-2 rounded-md hover:bg-gray-200 transition duration-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeletePart(part.id)}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-gray-200 transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

// Incident Section Component (from previous response, now integrated)
function IncidentSection({ incidents, setIncidents, displayMessage }) {
    const [incidentWhen, setIncidentWhen] = useState('');
    const [incidentPlace, setIncidentPlace] = useState('');
    const [incidentDrone, setIncidentDrone] = useState('');
    const [incidentReason, setIncidentReason] = useState('');
    const [incidentRegion, setIncidentRegion] = useState('');
    const [incidentIssue, setIncidentIssue] = useState('');
    const [editingIncidentId, setEditingIncidentId] = useState(null); // State to track which incident is being edited

    // Function to add or update an incident
    const handleAddOrUpdateIncident = () => {
        if (!incidentWhen || !incidentPlace || !incidentDrone || !incidentReason || !incidentRegion || !incidentIssue) {
            displayMessage("Please fill in all required fields for incident.", 'error');
            return;
        }

        if (editingIncidentId) {
            // Update existing incident
            setIncidents(incidents.map(incident =>
                incident.id === editingIncidentId
                    ? { ...incident, incidentWhen, incidentPlace, incidentDrone, incidentReason, incidentRegion, incidentIssue }
                    : incident
            ));
            displayMessage("Incident updated successfully!", 'success');
            setEditingIncidentId(null); // Exit editing mode
        } else {
            // Add new incident
            const newIncident = {
                id: Date.now(), // Unique ID
                when: incidentWhen,
                place: incidentPlace,
                drone: incidentDrone,
                reason: incidentReason,
                region: incidentRegion,
                issue: incidentIssue,
            };
            setIncidents([...incidents, newIncident]);
            displayMessage("Incident reported successfully!", 'success');
        }
        // Clear form fields after add/update
        setIncidentWhen('');
        setIncidentPlace('');
        setIncidentDrone('');
        setIncidentReason('');
        setIncidentRegion('');
        setIncidentIssue('');
    };

    // Function to delete an incident
    const handleDeleteIncident = (id) => {
        if (window.confirm("Are you sure you want to delete this incident record?")) {
            setIncidents(incidents.filter(incident => incident.id !== id));
            displayMessage("Incident record deleted.", 'info');
        }
    };

    // Function to set up form for editing
    const handleEditIncident = (incident) => {
        setIncidentWhen(incident.when);
        setIncidentPlace(incident.place);
        setIncidentDrone(incident.drone);
        setIncidentReason(incident.reason);
        setIncidentRegion(incident.region);
        setIncidentIssue(incident.issue);
        setEditingIncidentId(incident.id); // Enter editing mode
        displayMessage("Edit the details and click 'Update Incident'.", 'info');
    };

    return (
        <section className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-200 mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 border-b-2 border-blue-300 pb-3 mb-6">
                Manage Incidents
            </h2>

            {/* Report/Edit Incident Form */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    {editingIncidentId ? 'Edit Incident Details' : 'Report New Incident'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="datetime-local"
                        value={incidentWhen}
                        onChange={(e) => setIncidentWhen(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Place of Incident"
                        value={incidentPlace}
                        onChange={(e) => setIncidentPlace(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Affected Drone ID"
                        value={incidentDrone}
                        onChange={(e) => setIncidentDrone(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Incident Reason"
                        value={incidentReason}
                        onChange={(e) => setIncidentReason(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Region"
                        value={incidentRegion}
                        onChange={(e) => setIncidentRegion(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Specific Issue"
                        value={incidentIssue}
                        onChange={(e) => setIncidentIssue(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />
                </div>
                <button
                    onClick={handleAddOrUpdateIncident}
                    className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                >
                    {editingIncidentId ? 'Update Incident' : 'Report Incident'}
                </button>
            </div>

            {/* Recorded Incidents List */}
            <div className="p-6 bg-white rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">Recorded Incidents</h3>
                {incidents.length === 0 ? (
                    <p className="text-center text-gray-500 italic p-4 bg-blue-50 rounded-lg">No incidents recorded.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">When</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Place</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Drone ID</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Reason</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Region</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Issue</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {incidents.map((incident) => (
                                    <tr key={incident.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 whitespace-nowrap text-gray-800">{new Date(incident.when).toLocaleString()}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-gray-800">{incident.place}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-gray-800">{incident.drone}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-gray-800">{incident.reason}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-gray-800">{incident.region}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-gray-800">{incident.issue}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEditIncident(incident)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3 p-2 rounded-md hover:bg-gray-200 transition duration-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteIncident(incident.id)}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-gray-200 transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}


// --- Main App Component (Main Export) ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mediaItems, setMediaItems] = useState([ // Lift mediaItems state to App
    {
      id: 'm1',
      type: 'video',
      title: 'Mission Alpha - Perimeter Scan',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Example video URL
      thumbnail: 'https://placehold.co/300x200/4a90e2/ffffff?text=Video+Thumbnail+1',
      droneId: 'DRN-AV-001',
      missionId: 'm1',
      timestamp: '2025-07-15T10:30:00Z',
      gps: '34.0522, -118.2437',
      tags: ['perimeter', 'security', 'day-flight'],
      description: 'Automated perimeter scan of North Campus during Mission Alpha.',
    },
    {
      id: 'm2',
      type: 'image',
      title: 'Factory Roof Inspection',
      url: 'https://placehold.co/600x400/7ed321/ffffff?text=Factory+Roof+Image',
      thumbnail: 'https://placehold.co/300x200/7ed321/ffffff?text=Image+Thumbnail+2',
      droneId: 'DRN-SG-002',
      missionId: 'm2',
      timestamp: '2025-07-20T09:45:00Z',
      gps: '34.0522, -118.2437',
      tags: ['inspection', 'factory', 'roof'],
      description: 'High-resolution image captured during routine factory roof inspection.',
    },
    {
      id: 'm3',
      type: 'video',
      title: 'Bridge Structural Analysis',
      url: 'https://www.w3schools.com/html/movie.mp4', // Another example video URL
      thumbnail: 'https://placehold.co/300x200/f5a623/ffffff?text=Video+Thumbnail+3',
      droneId: 'DRN-AD-003',
      missionId: 'm3',
      timestamp: '2025-07-25T14:00:00Z',
      gps: '34.0522, -118.2437',
      tags: ['infrastructure', 'bridge', 'analysis'],
      description: 'Detailed video footage for structural analysis of the main bridge.',
    },
  ]);

  // States for Maintenance and Incidents (moved from the previous response's App component)
  const [maintenanceParts, setMaintenanceParts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' }); // For temporary messages

  // Effect to load data from localStorage on initial render (for maintenance and incidents)
  useEffect(() => {
      const storedMaintenanceParts = localStorage.getItem('maintenanceParts');
      if (storedMaintenanceParts) {
          setMaintenanceParts(JSON.parse(storedMaintenanceParts));
      }
      const storedIncidents = localStorage.getItem('incidents');
      if (storedIncidents) {
          setIncidents(JSON.parse(storedIncidents));
      }
  }, []);

  // Effects to save data to localStorage whenever maintenanceParts or incidents change
  useEffect(() => {
      localStorage.setItem('maintenanceParts', JSON.stringify(maintenanceParts));
  }, [maintenanceParts]);

  useEffect(() => {
      localStorage.setItem('incidents', JSON.stringify(incidents));
  }, [incidents]);

  // Function to display temporary messages (passed to children components)
  const displayMessage = (text, type) => {
      setMessage({ text, type });
      setTimeout(() => {
          setMessage({ text: '', type: '' }); // Clear message after 3 seconds
      }, 3000);
  };


  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleCaptureMedia = (newMedia) => {
    setMediaItems(prevItems => [...prevItems, { id: `m${prevItems.length + 1}`, ...newMedia }]);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        // If authenticated, render the main application layout directly here
        <Router>
          <div className="flex min-h-screen bg-gray-100 font-sans">
            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                <h1 className="text-2xl font-semibold text-gray-800">AirVibe Dashboard</h1>
                <BellIcon size={18} className='text-xl cursor-pointer'
                onClick={()=>{
                  window.location.replace("/manage/notification-preferences")
                }}/>
              </header>

              {/* Message Box for general app messages */}
              {message.text && (
                  <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-opacity duration-300 ${message.type === 'success' ? 'bg-green-500' : message.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} opacity-100`}>
                      {message.text}
                  </div>
              )}

              <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/live-operations" element={<LiveOperations onCaptureMedia={handleCaptureMedia} />} /> {/* Pass capture handler */}
                  <Route path="/missions" element={<Missions />} />
                  {/* Asset Routes */}
                  <Route path="/assets" element={<Drones />} /> {/* Default to Drones for /assets */}
                  <Route path="/assets/drones" element={<Drones />} />
                  <Route path="/assets/ground-stations" element={<GroundStations />} />
                  <Route path="/assets/equipment" element={<Equipment />} />
                  <Route path="/assets/batteries" element={<Batteries />} />
                  {/* Library Routes */}
                  <Route path="/library/media" element={<Media mediaItems={mediaItems} setMediaItems={setMediaItems} />} /> {/* Pass media state */}
                  <Route path="/library/files" element={<Files />} />
                  <Route path="/library/checklists" element={<Checklists />} />
                  <Route path="/library/tags" element={<Tags />} />
                  {/* Manage Routes */}
                  <Route path="/manage/profile-settings" element={<ProfileSettings />} />
                  <Route path="/manage/notification-preferences" element={<NotificationPreferences />} />
                  {/* Replaced placeholder components with the full implementations */}
                  <Route path="/manage/incidents" element={<IncidentSection incidents={incidents} setIncidents={setIncidents} displayMessage={displayMessage} />} />
                  <Route path="/manage/maintenance" element={<MaintenanceSection maintenanceParts={maintenanceParts} setMaintenanceParts={setMaintenanceParts} displayMessage={displayMessage} />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      ) : (
        // If not authenticated, render the AuthPage
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;


