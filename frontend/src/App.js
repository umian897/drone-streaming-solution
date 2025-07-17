// frontend/src/App.js (ALL COMPONENTS INLINED HERE AS A LAST RESORT)

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Video, Rocket, Package, Drone, HardDrive,  BatteryCharging,
  Book, FileText, CheckSquare, Tag, Settings, AlertCircle, Wrench, Bell, UserCircle,
  LogOut, ChevronDown, ChevronUp, PlusCircle, MoreVertical, Trash2, MapPin, Activity, Clock, Image
} from 'lucide-react'; 

// Import the authentication page component. Path is correct.
import AuthPage from './pages/auth/AuthPage'; 

// --- INLINED Sidebar Component
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null)
  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const isActive = (path) => location.pathname === path;
  const isDropdownActive = (paths) => paths.some(path => location.pathname.startsWith(path));

   return(
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

      <div className="p-4 border-t border-gray-700 mt-auto">
        <button className="w-full flex items-center justify-center py-2 px-4 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md text-sm font-medium transition duration-150">
          Collapse sidebar
        </button>
      </div>

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
  ;
  // --- INLINED CardWidget Component ---
const CardWidget = ({ title, children, onDelete, onMoreOptions }) => {
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
    alert(`Delete icon clicked for ${cardName} card.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CardWidget title="User Profile" onDelete={() => handleCardDelete('User Profile')}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <UserCircle className="w-20 h-20 text-gray-400 mb-4" />
          <h4 className="text-xl font-bold text-gray-800">m osman</h4>
          <div className="mt-4 text-gray-600 text-sm space-y-2">
            <p className="flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-500" /> Total flight time: -</p>
            <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-indigo-500" /> Average flight time: -</p>
            <p className="flex items-center"><Rocket className="w-4 h-4 mr-2 text-purple-500" /> Number of flights: -</p>
          </div>
          <button className="mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm">Open profile</button>
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
        <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">View all</button>
      </CardWidget>

      <CardWidget title="Recent media" onDelete={() => handleCardDelete('Recent Media')}>
        <div className="grid grid-cols-2 gap-4">
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
          <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">View all</button>
        </div>
      </CardWidget>
    </div>
  );
};

// --- INLINED LiveOperations Component ---
const LiveOperations = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Operations</h2>
      <p className="text-gray-600">This section will display live video feeds and real-time drone tracking.</p>
    </div>
  );
};

// --- INLINED Missions Component ---
const Missions = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Missions</h2>
      <div className="flex space-x-4 mt-6">
        <div className="flex flex-col items-center justify-center p-8 border border-gray-200 rounded-xl shadow-sm text-center w-64 h-64 hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <PlusCircle className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">Create Pilot Mission</h3>
          <p className="text-sm text-gray-600 mt-2">Create missions for pilots in the field.</p>
        </div>
        <div className="flex flex-col items-center justify-center p-8 border border-gray-200 rounded-xl shadow-sm text-center w-64 h-64 hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <PlusCircle className="w-12 h-12 text-teal-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">Create Ground Station Mission</h3>
          <p className="text-sm text-gray-600 mt-2">Create automated missions for ground stations.</p>
        </div>
      </div>
    </div>
  );
};

// --- INLINED Assets Component ---
const Assets = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Assets Overview</h2>
      <p className="text-gray-600">Select a sub-category from the sidebar (Drones, Ground Stations, Equipment, Batteries).</p>
    </div>
  );
};

// --- INLINED Drones Component ---
const Drones = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Drones</h2>
      <p className="text-gray-600">View and manage your drone inventory.</p>
    </div>
  );
};

// --- INLINED GroundStations Component ---
const GroundStations = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Ground Stations</h2>
      <p className="text-gray-600">Manage your ground station equipment.</p>
    </div>
  );
};

// --- INLINED Equipment Component ---
const Equipment = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Equipment</h2>
      <p className="text-gray-600">View and manage associated equipment (cameras, sensors).</p>
    </div>
  );
};

// --- INLINED Batteries Component ---
const Batteries = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Batteries</h2>
      <p className="text-gray-600">Track battery health and charge cycles.</p>
    </div>
  );
};

// --- INLINED Files Component ---
const Files = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Files</h2>
      <p className="text-gray-600">Browse and search general operational documents.</p>
    </div>
  );
};

// --- INLINED Checklists Component ---
const Checklists = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Checklists</h2>
      <p className="text-gray-600">Access and complete digital checklists.</p>
    </div>
  );
};

// --- INLINED Tags Component ---
const Tags = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Tags</h2>
      <p className="text-gray-600">Manage custom categories for better organization.</p>
    </div>
  );
};

// --- INLINED ProfileSettings Component ---
const ProfileSettings = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Settings (Profile)</h2>
      <p className="text-gray-600">Update your personal information and preferences.</p>
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

// --- INLINED IncidentsManage Component ---
const IncidentsManage = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Incidents</h2>
      <p className="text-gray-600">Review and manage reported incidents.</p>
    </div>
  );
};

// --- INLINED MaintenanceManage Component ---
const MaintenanceManage = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Maintenance</h2>
      <p className="text-gray-600">View and schedule maintenance for assets.</p>
    </div>
  );
};


// --- Main App Component (Main Export) ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
              </header>

              <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} /> 
                  <Route path="/live-operations" element={<LiveOperations />} />
                  <Route path="/missions" element={<Missions />} />
                  <Route path="/assets" element={<Assets />} /> 
                  <Route path="/assets/drones" element={<Drones />} />
                  <Route path="/assets/ground-stations" element={<GroundStations />} />
                  <Route path="/assets/equipment" element={<Equipment />} />
                  <Route path="/assets/batteries" element={<Batteries />} />
                  <Route path="/library/files" element={<Files />} />
                  <Route path="/library/checklists" element={<Checklists />} />
                  <Route path="/library/tags" element={<Tags />} />
                  <Route path="/manage/profile-settings" element={<ProfileSettings />} />
                  <Route path="/manage/notification-preferences" element={<NotificationPreferences />} />
                  <Route path="/manage/incidents" element={<IncidentsManage />} />
                  <Route path="/manage/maintenance" element={<MaintenanceManage />} />
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