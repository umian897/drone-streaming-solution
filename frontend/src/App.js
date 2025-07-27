
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Video, Rocket, Package, Drone, HardDrive, BatteryCharging,
  Book, FileText, CheckSquare, Tag, Settings, AlertCircle, Wrench, Bell, UserCircle,
  LogOut, ChevronDown, ChevronUp, PlusCircle, MoreVertical, Trash2, MapPin, Activity, Clock, Image as ImageIcon,
  Gauge, Battery, Signal, Compass, Camera, Video as VideoIcon, Home, ListChecks, Search,
  Upload, Info, Factory, BatteryMedium, Plus, Edit, Eye, History, XCircle, Download, Mail, Key, Check, Calendar,
  List, Folder, 
 
  Rewind, Pause, Play, FastForward, Volume2, MinusCircle, Square
} from 'lucide-react';
import { io } from 'socket.io-client';
// --- API CONFIG & HELPER ---
const API_BASE_URL = 'http://localhost:5000';
const WEBSOCKET_URL = 'http://localhost:5000';

const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }
    if (response.status === 204) return null; // Handle No Content responses
    return response.json();
};
// Import the authentication page component.
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
    <div className="w-64 bg-gray-800 text-white flex flex-col h-screen shadow-lg">
      <div className="p-6 flex items-center justify-center border-b border-gray-700">
        <img src="https://placehold.co/40x40/ffffff/000000?text=AV" alt="AirVibe Logo" className="h-10 w-10 mr-3 rounded-full" />
        <span className="text-2xl font-bold text-blue-400">AirVibe</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <Link to="/" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </Link>

        {/* Operations Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('operations')}
            className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/live-operations', '/missions']) ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <span className="flex items-center">
              <Video className="w-5 h-5 mr-3" />
              Operations
            </span>
            {openDropdown === 'operations' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openDropdown === 'operations' && (
            <div className="pl-6 pt-2 space-y-1">
              <Link to="/live-operations" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/live-operations') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <VideoIcon className="w-4 h-4 mr-3" /> Live Operations
              </Link>
              <Link to="/missions" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/missions') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <Rocket className="w-4 h-4 mr-3" /> Missions
              </Link>
            </div>
          )}
        </div>

        {/* Assets Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('assets')}
            className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/assets/drones', '/assets/ground-stations', '/assets/equipment', '/assets/batteries']) ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <span className="flex items-center">
              <Package className="w-5 h-5 mr-3" />
              Assets
            </span>
            {openDropdown === 'assets' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openDropdown === 'assets' && (
            <div className="pl-6 pt-2 space-y-1">
              <Link to="/assets/drones" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/assets/drones') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <Drone className="w-4 h-4 mr-3" /> Drones
              </Link>
              <Link to="/assets/ground-stations" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/assets/ground-stations') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <Factory className="w-4 h-4 mr-3" /> Ground Stations
              </Link>
              <Link to="/assets/equipment" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/assets/equipment') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <HardDrive className="w-4 h-4 mr-3" /> Equipment
              </Link>
              <Link to="/assets/batteries" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/assets/batteries') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <BatteryMedium className="w-4 h-4 mr-3" /> Batteries
              </Link>
            </div>
          )}
        </div>

        {/* Library Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('library')}
            className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/library/media', '/library/files', '/library/checklists', '/library/tags']) ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <span className="flex items-center">
              <Book className="w-5 h-5 mr-3" />
              Library
            </span>
            {openDropdown === 'library' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openDropdown === 'library' && (
            <div className="pl-6 pt-2 space-y-1">
              <Link to="/library/media" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/library/media') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <ImageIcon className="w-4 h-4 mr-3" /> Media
              </Link>
              <Link to="/library/files" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/library/files') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <FileText className="w-4 h-4 mr-3" /> Files
              </Link>
              <Link to="/library/checklists" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/library/checklists') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <CheckSquare className="w-4 h-4 mr-3" /> Checklists
              </Link>
              <Link to="/library/tags" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/library/tags') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <Tag className="w-4 h-4 mr-3" /> Tags
              </Link>
            </div>
          )}
        </div>

        {/* Manage Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('manage')}
            className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/manage/profile-settings', '/manage/incidents', '/manage/maintenance']) ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <span className="flex items-center">
              <Settings className="w-5 h-5 mr-3" />
              Manage
            </span>
            {openDropdown === 'manage' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openDropdown === 'manage' && (
            <div className="pl-6 pt-2 space-y-1">
              <Link to="/manage/profile-settings" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/manage/profile-settings') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <UserCircle className="w-4 h-4 mr-3" /> Profile Settings
              </Link>
              <Link to="/manage/incidents" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/manage/incidents') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <AlertCircle className="w-4 h-4 mr-3" /> Incidents
              </Link>
              <Link to="/manage/maintenance" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/manage/maintenance') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                <Wrench className="w-4 h-4 mr-3" /> Maintenance
              </Link>
            </div>
          )}
        </div>

        <Link to="/notifications" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/notifications') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <Bell className="w-5 h-5 mr-3" />
          Notifications
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-700 mt-auto">
        <button
          onClick={onLogout}
          className="flex items-center w-full p-3 rounded-md text-sm font-medium text-red-300 hover:bg-red-700 hover:text-white transition duration-150"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

// --- INLINED Dashboard Component ---
const Dashboard = ({ drones, missions, incidents, mediaItems, maintenanceParts }) => { // Accept data as props
  const navigate = useNavigate(); // Moved inside component

  // Calculate counts from props
  const totalDrones = drones.length;
  const activeMissions = missions.filter(m => m.status === 'Active').length;
  const pendingMaintenance = maintenanceParts.filter(p => p.status !== 'Available').length;
  const recentIncidents = incidents.filter(i => !i.resolved).length;
// Inside the Dashboard component
const mediaToday = mediaItems.filter(m => {
  if (!m.date) return false; // Skip items with no date
  const today = new Date();
  const mediaDate = new Date(m.date); // <-- THIS IS THE FIX

  return mediaDate.getDate() === today.getDate() &&
         mediaDate.getMonth() === today.getMonth() &&
         mediaDate.getFullYear() === today.getFullYear();
}).length;

  // Placeholder for actual flight hours calculation
  const totalFlightHours = drones.reduce((sum, drone) => sum + (drone.flightHours || 0), 0).toFixed(1);

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Total Drones */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <Drone className="w-12 h-12 text-blue-500" />
          <div>
            <p className="text-gray-500 text-sm">Total Drones</p>
            <p className="text-3xl font-bold text-gray-900">{totalDrones}</p>
          </div>
        </div>

        {/* Card 2: Active Missions */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <Rocket className="w-12 h-12 text-green-500" />
          <div>
            <p className="text-gray-500 text-sm">Active Missions</p>
            <p className="text-3xl font-bold text-gray-900">{activeMissions}</p>
          </div>
        </div>

        {/* Card 3: Pending Maintenance */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <Wrench className="w-12 h-12 text-yellow-500" />
          <div>
            <p className="text-gray-500 text-sm">Pending Maintenance</p>
            <p className="text-3xl font-bold text-gray-900">{pendingMaintenance}</p>
          </div>
        </div>

        {/* Card 4: Recent Incidents */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <p className="text-gray-500 text-sm">Recent Incidents</p>
            <p className="text-3xl font-bold text-gray-900">{recentIncidents}</p>
          </div>
        </div>

        {/* Card 5: Media Captured */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <ImageIcon className="w-12 h-12 text-purple-500" />
          <div>
            <p className="text-gray-500 text-sm">Media Captured (Today)</p>
            <p className="text-3xl font-bold text-gray-900">{mediaToday}</p>
          </div>
        </div>

        {/* Card 6: Total Flight Hours */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <Clock className="w-12 h-12 text-indigo-500" />
          <div>
            <p className="text-gray-500 text-sm">Total Flight Hours</p>
            <p className="text-3xl font-bold text-gray-900">{totalFlightHours}h</p>
          </div>
        </div>
      </div>

      {/* Placeholder for Charts/Graphs */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Flight Activity Chart (Placeholder)</h3>
        <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
          Graph will be displayed here
        </div>
      </div>
    </div>
  );
};





// --- INLINED Missions Component ---
const Missions = ({ missions = [], drones = [], handleAddMission, handleDeleteMission, displayMessage }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMission, setNewMission] = useState({
        name: '',
        drone_id: '', // <-- FIX: Changed from 'drone' to 'drone_id'
        start_time: '',
        end_time: '',
        details: ''
    });

    const onSave = async () => {
        if (!newMission.name || !newMission.drone_id || !newMission.start_time || !newMission.end_time) {
            displayMessage("Please fill all required mission fields.", 'error');
            return;
        }
        
        const success = await handleAddMission({
            ...newMission,
            status: 'Scheduled',
            progress: 0,
        });

        if (success) {
            setShowAddModal(false);
            setNewMission({ name: '', drone_id: '', start_time: '', end_time: '', details: '' });
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Scheduled': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Missions Management</h2>
                <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusCircle className="w-5 h-5 mr-2" /> Create New Mission
                </button>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Create New Mission</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Mission Name" value={newMission.name} onChange={e => setNewMission({ ...newMission, name: e.target.value })} className="w-full p-2 border rounded" />
                            <select value={newMission.drone_id} onChange={e => setNewMission({ ...newMission, drone_id: e.target.value })} className="w-full p-2 border rounded">
                                <option value="">Select a Drone</option>
                                {drones.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
                            </select>
                            <div>
                                <label className="text-sm">Start Time</label>
                                <input type="datetime-local" value={newMission.start_time} onChange={e => setNewMission({ ...newMission, start_time: e.target.value })} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="text-sm">End Time</label>
                                <input type="datetime-local" value={newMission.end_time} onChange={e => setNewMission({ ...newMission, end_time: e.target.value })} className="w-full p-2 border rounded" />
                            </div>
                            <textarea placeholder="Details" value={newMission.details} onChange={e => setNewMission({ ...newMission, details: e.target.value })} className="w-full p-2 border rounded h-24"></textarea>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded">Create Mission</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missions.map(mission => (
                    <div key={mission.id} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{mission.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(mission.status)}`}>{mission.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{mission.details}</p>
                        <div className="text-sm space-y-2">
                            <p><strong>Drone:</strong> {mission.drone_id}</p>
                            <p><strong>Start:</strong> {new Date(mission.start_time).toLocaleString()}</p>
                            <p><strong>End:</strong> {new Date(mission.end_time).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => handleDeleteMission(mission.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
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
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
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
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors transform hover:-translate-y-1 shadow-md w-full sm:w-auto justify-center"
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
    return <AddItemForm title="Ground Station" onSave={handleSaveGS} ononCancel={handleBackToGSList} assetType="Ground Station" initialData={selectedGS} />;
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
                <button onClick={handleFastForward} className="text-white hover:text-gray-300"><FastForward className="w-6 h-6" /></button> {/* Corrected this line */}
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
const Media = ({ mediaItems, setMediaItems, displayMessage }) => { // Receive mediaItems and setMediaItems as props
  const [currentView, setCurrentView] = useState('list'); // 'list', 'details', 'upload', 'edit-media'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'image', 'video'
  const [confirmingDeleteMedia, setConfirmingDeleteMedia] = useState(null);


  // Ensure mediaItems is an array before filtering
// Inside the Media component
const filteredMedia = (mediaItems || []).filter(item => {
  const matchesType = filterType === 'all' || item.type === filterType;
  const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (item.droneId && item.droneId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (item.missionId && item.missionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

  return matchesType && matchesSearch; // This line should be fine if matchesType and matchesSearch are defined
});

  const handleUploadMedia = async (newMediaData) => { // This function should be passed as a prop from App
      try {
          const response = await fetch('http://localhost:5000/api/media', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  title: newMediaData.title,
                  type: newMediaData.type,
                  url: newMediaData.url,
                  thumbnail: newMediaData.thumbnail,
                  drone_id: newMediaData.droneId,
                  mission_id: newMediaData.missionId,
                  timestamp: new Date().toISOString(),
                  gps: newMediaData.gps || 'N/A', // Ensure GPS is handled
                  tags: newMediaData.tags || [], // Ensure tags are an array
                  description: newMediaData.description,
              }),
          });
          const data = await response.json();
          if (response.ok) {
              setMediaItems(prevItems => [...prevItems, {
                  ...data,
                  date: data.timestamp ? new Date(data.timestamp) : null,
              }]);
              displayMessage("Media uploaded successfully!", 'success');
              // Optionally close modal or clear form here if you have one
              // setCurrentView('list'); // If this component handles view state
          } else {
              displayMessage(`Failed to upload media: ${data.error || response.statusText}`, 'error');
          }
      } catch (error) {
          console.error('Error uploading media:', error);
          displayMessage('Error uploading media: Network issue or server offline.', 'error');
      }
  };


  const handleDeleteMedia = async (id) => {
    if (window.confirm("Are you sure you want to delete this media item?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/media/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMediaItems(prev => prev.filter(item => item.id !== id));
          displayMessage("Media item deleted.", 'info');
        } else {
          const data = await response.json();
          displayMessage(`Failed to delete media: ${data.error || response.statusText}`, 'error');
        }
      } catch (error) {
        console.error('Error deleting media:', error);
        displayMessage('Error deleting media: Network issue or server offline.', 'error');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)]"> {/* Changed to min-h-full to occupy height */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Captured Media Library</h2>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => { /* Your upload modal trigger logic here */ handleUploadMedia({ /* dummy data or open modal */ title: "New Media", type: "image", url: "https://placehold.co/600x400", droneId: "DRN-TEST", missionId: "MIS-TEST", description: "Test upload" })}} // Example trigger
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 w-full sm:w-auto justify-center"
        >
          <Upload className="w-5 h-5 mr-2" /> Upload Media
        </button>
        <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'image' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Images
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'video' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Videos
          </button>
        </div>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
          <p className="text-gray-500 text-lg">No media items found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
          {filteredMedia.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
              <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
                {item.type === 'image' ? (
                  <img src={item.src} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/cccccc/333333?text=Image+Error'; }} />
                ) : (
                  <video src={item.src} controls className="w-full h-full object-cover" poster={item.thumb} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/cccccc/333333?text=Video+Error'; }}></video>
                )}
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  {item.type === 'video' ? <VideoIcon className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />} {item.type.toUpperCase()}
                </span>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm flex-grow mb-2">{item.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
                  <span>Drone ID: {item.droneId}</span>
                  <span>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-end space-x-2 mt-3">
                  <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Download">
                    <Download className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteMedia(item.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors" title="Delete">
                    <Trash2 className="w-5 h-5" />
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
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors transform hover:-translate-y-1 shadow-md w-full sm:w-auto justify-center"
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map(file => (
                    <tr key={file.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                        {getFileTypeIcon(file.type)} {file.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.uploadDate}
                      </td>
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
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md w-full sm:w-auto justify-center"
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
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md w-full sm:w-auto justify-center"
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
function IncidentSection({ incidents, handleAddIncident, handleUpdateIncident, handleDeleteIncident, displayMessage }) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentIncident, setCurrentIncident] = useState({ id: null, type: 'alert', message: '', resolved: false });

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentIncident({ id: null, type: 'alert', message: '', resolved: false });
        setShowModal(true);
    };

    const openEditModal = (incident) => {
        setIsEditing(true);
        setCurrentIncident(incident);
        setShowModal(true);
    };

    const handleSave = () => {
        if (!currentIncident.message || !currentIncident.type) {
            displayMessage("Type and message are required.", 'error');
            return;
        }
        if (isEditing) {
            handleUpdateIncident(currentIncident.id, currentIncident);
        } else {
            handleAddIncident(currentIncident);
        }
        setShowModal(false);
    };

    const handleToggleResolve = (incident) => {
        handleUpdateIncident(incident.id, { ...incident, resolved: !incident.resolved });
    };

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Incidents Management</h2>
                <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusCircle className="w-5 h-5 mr-2" /> Report New Incident
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Incident' : 'Report New Incident'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Incident Type</label>
                                <select value={currentIncident.type} onChange={e => setCurrentIncident({ ...currentIncident, type: e.target.value })} className="w-full p-2 border rounded mt-1">
                                    <option value="alert">Alert</option>
                                    <option value="warning">Warning</option>
                                    <option value="info">Info</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea placeholder="Describe the incident..." value={currentIncident.message} onChange={e => setCurrentIncident({ ...currentIncident, message: e.target.value })} className="w-full p-2 border rounded mt-1 h-24"></textarea>
                            </div>
                            {isEditing && (
                                <div className="flex items-center">
                                    <input type="checkbox" id="resolved" checked={currentIncident.resolved} onChange={e => setCurrentIncident({ ...currentIncident, resolved: e.target.checked })} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                    <label htmlFor="resolved" className="ml-2 block text-sm text-gray-900">Mark as Resolved</label>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">{isEditing ? 'Save Changes' : 'Report Incident'}</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {incidents.map(incident => (
                    <div key={incident.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                        <div>
                            <p className={`font-bold ${incident.type === 'alert' ? 'text-red-600' : 'text-yellow-600'}`}>{incident.type.toUpperCase()}</p>
                            <p className="text-gray-800">{incident.message}</p>
                            <p className="text-sm text-gray-500 mt-1">{new Date(incident.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${incident.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {incident.resolved ? 'Resolved' : 'Unresolved'}
                            </span>
                            <button onClick={() => handleToggleResolve(incident)} className="p-1" title={incident.resolved ? "Mark Unresolved" : "Mark Resolved"}>
                                {incident.resolved ? <XCircle className="w-5 h-5 text-orange-500" /> : <Check className="w-5 h-5 text-green-500" />}
                            </button>
                            <button onClick={() => openEditModal(incident)} className="text-blue-600 p-1"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteIncident(incident.id)} className="text-red-600 p-1"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
// --- ProfileSettings Component (full implementation) ---
const ProfileSettings = ({ user, setUser, displayMessage }) => {
  const [newName, setNewName] = useState(user.name);
  const [newEmail, setNewEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newProfilePictureUrl, setNewProfilePictureUrl] = useState(user.profilePicture);

  const handleUpdateProfile = async (e) => { // Made async
    e.preventDefault();
    try {
      // Assuming a user profile API endpoint like /api/user/profile or /api/users/<userId>
      const response = await fetch('http://localhost:5000/api/user/profile', { // You need to implement this endpoint in Flask
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(prev => ({ ...prev, name: newName, email: newEmail }));
        displayMessage("Profile updated successfully!", 'success');
      } else {
        displayMessage(`Failed to update profile: ${data.error || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      displayMessage('Error updating profile: Network issue or server offline.', 'error');
    }
  };

  const handleChangePassword = async (e) => { // Made async
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      displayMessage("New password and confirmation do not match.", 'error');
      return;
    }
    if (newPassword.length < 6) {
      displayMessage("Password must be at least 6 characters long.", 'error');
      return;
    }
    try {
      // Assuming a password change API endpoint like /api/user/change_password
      const response = await fetch('http://localhost:5000/api/user/change_password', { // You need to implement this endpoint in Flask
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        displayMessage("Password changed successfully!", 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        displayMessage(`Failed to change password: ${data.error || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      displayMessage('Error changing password: Network issue or server offline.', 'error');
    }
  };

  const handleUpdateProfilePicture = async (e) => { // Made async
    e.preventDefault();
    if (newProfilePictureUrl.trim() === '') {
      displayMessage("Please enter a valid image URL.", 'error');
      return;
    }
    try {
      // Assuming a profile picture update API endpoint like /api/user/profile_picture
      const response = await fetch('http://localhost:5000/api/user/profile_picture', { // You need to implement this endpoint in Flask
        method: 'POST', // Or PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_picture_url: newProfilePictureUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(prev => ({ ...prev, profilePicture: newProfilePictureUrl }));
        displayMessage("Profile picture updated!", 'success');
      } else {
        displayMessage(`Failed to update picture: ${data.error || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      displayMessage('Error updating profile picture: Network issue or server offline.', 'error');
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col items-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">User Profile Settings</h2>

      {/* Profile Header and Picture */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8 w-full max-w-2xl flex flex-col items-center">
        <div className="relative mb-4">
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-lg"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/333333?text=User'; }}
          />
          <button
            onClick={() => { /* Trigger modal or input for new image URL */ }}
            className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 transition-colors"
            title="Change Profile Picture"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-2xl font-semibold text-gray-800">{user.name}</h3>
        <p className="text-gray-600">{user.email}</p>

        {/* Profile Picture Update Form */}
        <form onSubmit={handleUpdateProfilePicture} className="mt-6 w-full flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <input
            type="url"
            placeholder="New Profile Picture URL"
            value={newProfilePictureUrl}
            onChange={(e) => setNewProfilePictureUrl(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md"
          >
            <Upload className="w-5 h-5 inline-block mr-2" /> Update Picture
          </button>
        </form>
      </div>

      {/* Account Information Section */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8 w-full max-w-2xl">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Account Information</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-blue-500 focus-within:border-blue-500 transition duration-200">
              <UserCircle className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 p-3 bg-transparent outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-blue-500 focus-within:border-blue-500 transition duration-200">
              <Mail className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="email"
                id="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 p-3 bg-transparent outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8 w-full max-w-2xl">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-blue-500 focus-within:border-blue-500 transition duration-200">
              <Key className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="flex-1 p-3 bg-transparent outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-blue-500 focus-within:border-blue-500 transition duration-200">
              <Key className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 p-3 bg-transparent outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-blue-500 focus-within:border-blue-500 transition duration-200">
              <Key className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="flex-1 p-3 bg-transparent outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Flight Statistics Section */}
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-2xl">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Flight Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow-sm">
            <Activity className="w-10 h-10 text-blue-600 mb-3" />
            <p className="text-sm text-gray-600">Total Flights</p>
            <p className="text-3xl font-bold text-blue-800">{user.totalFlights}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg shadow-sm">
            <Clock className="w-10 h-10 text-indigo-600 mb-3" />
            <p className="text-sm text-gray-600">Total Flight Time</p>
            <p className="text-3xl font-bold text-indigo-800">{user.totalFlightTime}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg shadow-sm">
            <Rocket className="w-10 h-10 text-purple-600 mb-3" />
            <p className="text-sm text-gray-600">Avg. Flight Time</p>
            <p className="text-3xl font-bold text-purple-800">{user.averageFlightTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NotificationsPage Component (full implementation) ---
const NotificationsPage = ({ notifications, setNotifications, displayMessage }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/mark_read/${id}`, {
        method: 'POST', // Or PUT, depending on your Flask API design
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ read: true }), // Send if your backend expects a body
      });
      if (response.ok) {
        // Update local state only if backend confirms success
        setNotifications(prev => prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        ));
        displayMessage("Notification marked as read.", 'info');
      } else {
        const data = await response.json();
        displayMessage(`Failed to mark notification as read: ${data.error || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      displayMessage('Error marking notification as read: Network issue or server offline.', 'error');
    }
  };

  // Mark all notifications as read (requires a new backend endpoint)
  const markAllAsRead = async () => {
    try {
      // This would ideally be a single API call on the backend, but for now, iterate
      // or implement a /api/notifications/mark_all_read endpoint on Flask.
      // For simplicity, we'll mark individually on frontend and assume backend handles it.
      // A better approach would be to send a single request to Flask to mark all read.
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      for (const id of unreadIds) {
        await fetch(`http://localhost:5000/api/notifications/mark_read/${id}`, { method: 'POST' });
      }
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      displayMessage("All notifications marked as read.", 'info');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      displayMessage('Error marking all notifications as read.', 'error');
    }
  };

  // Delete a single notification
  const deleteNotification = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/notifications/delete/${id}`, { // Assuming DELETE /api/notifications/<id>
          method: 'DELETE',
        });
        if (response.ok) {
          setNotifications(prev => prev.filter(notif => notif.id !== id));
          displayMessage("Notification deleted.", 'info');
        } else {
          const data = await response.json();
          displayMessage(`Failed to delete notification: ${data.error || response.statusText}`, 'error');
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        displayMessage('Error deleting notification: Network issue or server offline.', 'error');
      }
    }
  };

  // Delete all read notifications (requires a new backend endpoint)
  const deleteAllRead = async () => {
    if (window.confirm("Are you sure you want to delete all read notifications?")) {
      try {
        // This would ideally be a single API call on the backend, e.g., /api/notifications/delete_read
        // For simplicity, we'll delete individually on frontend and assume backend handles it.
        const readIds = notifications.filter(n => n.read).map(n => n.id);
        for (const id of readIds) {
          await fetch(`http://localhost:5000/api/notifications/delete/${id}`, { method: 'DELETE' });
        }
        setNotifications(prev => prev.filter(notif => !notif.read));
        displayMessage("All read notifications deleted.", 'info');
      } catch (error) {
        console.error('Error deleting all read notifications:', error);
        displayMessage('Error deleting all read notifications.', 'error');
      }
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true; // 'all' filter
  });

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h2>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'unread' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'read' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Read
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-md text-sm"
          >
            <Check className="w-4 h-4 mr-2" /> Mark All Read
          </button>
          <button
            onClick={deleteAllRead}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-md text-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete Read
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
          <p className="text-gray-500 text-lg">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`flex items-start p-4 rounded-lg shadow-sm transition-all duration-200 ${
                notif.read ? 'bg-white text-gray-600 border border-gray-200' : 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold'
              }`}
            >
              <div className="flex-shrink-0 mr-4 mt-1">
                {notif.type === 'alert' && <AlertCircle className="w-6 h-6 text-red-500" />}
                {notif.type === 'info' && <Info className="w-6 h-6 text-blue-500" />}
                {notif.type === 'success' && <Check className="w-6 h-6 text-green-500" />}
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium">{notif.message}</p>
                <p className="text-sm text-gray-500 mt-1">{notif.timestamp ? new Date(notif.timestamp).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="flex-shrink-0 flex space-x-2 ml-4">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                    title="Mark as Read"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Maintenance Section Component (from previous response, now integrated)
function MaintenanceSection({ maintenanceParts, setMaintenanceParts, displayMessage }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPart, setNewPart] = useState({
    name: '', status: 'Available', lastMaintenance: '', nextMaintenance: ''
  });

  const handleAddPart = async () => {
    if (newPart.name.trim() === '') {
      displayMessage("Part name cannot be empty.", 'error');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/maintenance_parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
    name: newPart.name,
    
    last_maintenance: newPart.lastMaintenance ? new Date(newPart.lastMaintenance).toISOString() : null,
    next_maintenance: newPart.nextMaintenance ? new Date(newPart.nextMaintenance).toISOString() : null,
    status: newPart.status,
}),
      });
      const data = await response.json();
      if (response.ok) {
        setMaintenanceParts(prev => [...prev, {
          ...data,
          lastMaintenance: data.last_maintenance ? new Date(data.last_maintenance) : null,
          nextMaintenance: data.next_maintenance ? new Date(data.next_maintenance) : null,
        }]);
        displayMessage("Maintenance part added successfully!", 'success');
        setShowAddModal(false);
        setNewPart({ name: '', status: 'Available', lastMaintenance: '', nextMaintenance: '' });
      } else {
        displayMessage(`Failed to add part: ${data.error || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Error adding maintenance part:', error);
      displayMessage('Error adding maintenance part: Network issue or server offline.', 'error');
    }
  };

  const handleDeletePart = async (id) => {
    if (window.confirm("Are you sure you want to delete this maintenance part?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/maintenance_parts/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMaintenanceParts(prev => prev.filter(part => part.id !== id));
          displayMessage("Maintenance part deleted.", 'info');
        } else {
          const data = await response.json();
          displayMessage(`Failed to delete part: ${data.error || response.statusText}`, 'error');
        }
      } catch (error) {
        console.error('Error deleting maintenance part:', error);
        displayMessage('Error deleting maintenance part: Network issue or server offline.', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'In Repair': return 'bg-yellow-100 text-yellow-800';
      case 'Needs Service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Maintenance Management</h2>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add New Part
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Add New Maintenance Part</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="partName" className="block text-sm font-medium text-gray-700">Part Name</label>
                <input
                  type="text"
                  id="partName"
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="partStatus" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="partStatus"
                  value={newPart.status}
                  onChange={(e) => setNewPart({ ...newPart, status: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="Available">Available</option>
                  <option value="In Repair">In Repair</option>
                  <option value="Needs Service">Needs Service</option>
                </select>
              </div>
              <div>
                <label htmlFor="lastMaintenance" className="block text-sm font-medium text-gray-700">Last Maintenance Date</label>
                <input
                  type="date"
                  id="lastMaintenance"
                  value={newPart.lastMaintenance}
                  onChange={(e) => setNewPart({ ...newPart, lastMaintenance: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="nextMaintenance" className="block text-sm font-medium text-gray-700">Next Maintenance Date</label>
                <input
                  type="date"
                  id="nextMaintenance"
                  value={newPart.nextMaintenance}
                  onChange={(e) => setNewPart({ ...newPart, nextMaintenance: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPart}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Part
              </button>
            </div>
          </div>
        </div>
      )}

      {maintenanceParts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
          <p className="text-gray-500 text-lg">No maintenance parts found. Add a new part to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maintenanceParts.map(part => (
            <div key={part.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{part.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(part.status)}`}>
                  {part.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow">ID: {part.id}</p>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-indigo-500" /> Last Service: <span className="font-medium ml-1">{part.lastMaintenance ? new Date(part.lastMaintenance).toLocaleDateString() : 'N/A'}</span></p>
                <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-orange-500" /> Next Service: <span className="font-medium ml-1">{part.nextMaintenance ? new Date(part.nextMaintenance).toLocaleDateString() : 'N/A'}</span></p>
              </div>

              <div className="flex justify-end space-x-2 mt-auto">
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="View Details">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors" title="Edit Part">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDeletePart(part.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors" title="Delete Part">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Incident Section Component (from previous response, now integrated)


const LiveOperations = ({ drones, connectedDrones, liveTelemetry, sendDroneCommand, displayMessage }) => {
    const [selectedDroneId, setSelectedDroneId] = useState('');

    useEffect(() => {
        // Set a default drone from the list when the component loads or the list changes
        if (drones.length > 0 && !drones.find(d => d.id === selectedDroneId)) {
            setSelectedDroneId(drones[0].id);
        }
    }, [drones, selectedDroneId]);

    const currentTelemetry = liveTelemetry[selectedDroneId] || {};
    const isSelectedDroneOnline = connectedDrones.includes(selectedDroneId);

    const handleCommand = (command, params = {}) => {
        if (!selectedDroneId) {
            displayMessage("No drone selected.", 'error');
            return;
        }
        if (!isSelectedDroneOnline) {
            displayMessage(`Cannot send command: Drone ${selectedDroneId} is offline.`, 'error');
            return;
        }
        sendDroneCommand(selectedDroneId, command, params);
    };

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Live Operations</h2>

            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                    <label htmlFor="drone-select" className="text-gray-700 font-medium">Select Drone:</label>
                    <select
                        id="drone-select"
                        value={selectedDroneId}
                        onChange={(e) => setSelectedDroneId(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {drones.length > 0 ? (
                            drones.map(drone => (
                                <option key={drone.id} value={drone.id}>{drone.name} ({drone.id})</option>
                            ))
                        ) : (
                            <option>No drones available</option>
                        )}
                    </select>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isSelectedDroneOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isSelectedDroneOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => handleCommand('takeoff', { altitude: 10 })} disabled={!isSelectedDroneOnline} className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 transition-colors shadow-md">
                        <Rocket className="w-5 h-5 mr-2" /> Takeoff
                    </button>
                    <button onClick={() => handleCommand('land')} disabled={!isSelectedDroneOnline} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 transition-colors shadow-md">
                        <Home className="w-5 h-5 mr-2" /> Land
                    </button>
                    <button onClick={() => handleCommand('take_photo')} disabled={!isSelectedDroneOnline} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors shadow-md">
                        <Camera className="w-5 h-5 mr-2" /> Take Photo
                    </button>
                </div>
            </div>

            {/* Rest of your UI for video feed, map, and telemetry panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                <div className="lg:col-span-2 bg-gray-900 rounded-xl shadow-md flex items-center justify-center text-gray-400">
                    Simulated Drone Feed
                </div>
                <div className="lg:col-span-1 flex flex-col space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-4 flex-1">
                        <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                        <p className="text-xs text-gray-500 mt-2">Lat: {currentTelemetry.latitude || 'N/A'}, Lng: {currentTelemetry.longitude || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-4">Detailed Telemetry</h3>
                        <p>Altitude: {currentTelemetry.altitude || 0}m</p>
                        <p>Speed: {currentTelemetry.speed || 0} m/s</p>
                        <p>Battery: {currentTelemetry.battery_percent || 0}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};




// --- Main App Component ---

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Centralized Data State
    const [drones, setDrones] = useState([]);
    const [missions, setMissions] = useState([]);
    const [mediaItems, setMediaItems] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [maintenanceParts, setMaintenanceParts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [liveTelemetry, setLiveTelemetry] = useState({});
    const [connectedDrones, setConnectedDrones] = useState([]);

    // Local UI State for components without a backend
    const [groundStations, setGroundStations] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [batteries, setBatteries] = useState([]);
    const [files, setFiles] = useState([]);
    const [userProfile, setUserProfile] = useState({});

    // UI Feedback State
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const displayMessage = useCallback((text, type = 'info') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
    }, []);

    // --- Data Fetching & WebSocket Logic ---
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchAllInitialData = async () => {
            try {
                const [dronesData, missionsData, mediaData, incidentsData, maintenanceData, notifsData, connectedDronesData] = await Promise.all([
                    apiRequest('/api/drones'),
                    apiRequest('/api/missions'),
                    apiRequest('/api/media'),
                    apiRequest('/api/incidents'),
                    apiRequest('/api/maintenance_parts'),
                    apiRequest('/api/notifications'),
                    apiRequest('/api/connected_drones'),
                ]);
                setDrones(dronesData);
                setMissions(missionsData);
                setMediaItems(mediaData);
                setIncidents(incidentsData);
                setMaintenanceParts(maintenanceData);
                setNotifications(notifsData);
                setConnectedDrones(connectedDronesData);
            } catch (error) {
                displayMessage(`Failed to load system data: ${error.message}`, 'error');
            }
        };
        fetchAllInitialData();

        const socket = io(WEBSOCKET_URL);
        socket.on('connect', () => {
            socket.emit('register_as_frontend');
            apiRequest('/api/connected_drones').then(setConnectedDrones);
        });

        socket.on('drone_telemetry_update', data => {
            setLiveTelemetry(prev => ({ ...prev, [data.drone_id]: data.telemetry }));
            setDrones(prev => prev.map(d => d.id === data.drone_id ? { ...d, battery: data.telemetry.battery_percent, status: 'Online', last_updated: new Date().toISOString() } : d));
            if (!connectedDrones.includes(data.drone_id)) {
                setConnectedDrones(prev => [...prev, data.drone_id]);
            }
        });

        socket.on('new_notification', notification => {
            setNotifications(prev => [notification, ...prev]);
            if (notification.message.includes("gateway connected")) {
                const droneId = notification.message.split(' ')[1];
                setConnectedDrones(prev => [...new Set([...prev, droneId])]);
                 setDrones(prev => prev.map(d => d.id === droneId ? { ...d, status: 'Online' } : d));
            } else if (notification.message.includes("gateway disconnected")) {
                const droneId = notification.message.split(' ')[1];
                setConnectedDrones(prev => prev.filter(id => id !== droneId));
                 setDrones(prev => prev.map(d => d.id === droneId ? { ...d, status: 'Offline' } : d));
            }
        });

        socket.on('new_media_available', media => setMediaItems(prev => [media, ...prev]));
        socket.on('notification_updated', updated => setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n)));
        socket.on('notification_deleted', deleted => setNotifications(prev => prev.filter(n => n.id !== deleted.id)));

        return () => socket.disconnect();
    }, [isAuthenticated, displayMessage]);

    // --- API HANDLER FUNCTIONS ---
    const handleAddItem = async (endpoint, data, stateSetter, itemName) => {
        try {
            const newItem = await apiRequest(endpoint, 'POST', data);
            stateSetter(prev => [...prev, newItem]);
            displayMessage(`${itemName} added successfully!`, 'success');
            return true;
        } catch (error) {
            displayMessage(error.message, 'error');
            return false;
        }
    };
    
    const handleDeleteItem = async (endpoint, id, stateSetter, itemName) => {
        if (window.confirm(`Are you sure you want to delete this ${itemName}?`)) {
            try {
                await apiRequest(`${endpoint}/${id}`, 'DELETE');
                stateSetter(prev => prev.filter(item => item.id !== id));
                displayMessage(`${itemName} deleted.`, 'success');
            } catch (error) {
                displayMessage(error.message, 'error');
            }
        }
    };

    const handleAddDrone = (data) => handleAddItem('/api/drones', data, setDrones, 'Drone');
    const handleDeleteDrone = (id) => handleDeleteItem('/api/drones', id, setDrones, 'drone');
    const handleAddMission = (data) => handleAddItem('/api/missions', data, setMissions, 'Mission');
    const handleAddIncident = (data) => handleAddItem('/api/incidents', data, setIncidents, 'Incident');
    const handleUpdateIncident = async (id, data) => {
        try {
            const updated = await apiRequest(`/api/incidents/${id}`, 'PUT', data);
            setIncidents(prev => prev.map(i => (i.id === id ? updated : i)));
            displayMessage('Incident updated.', 'success');
        } catch (error) { displayMessage(error.message, 'error'); }
    };
    const handleDeleteIncident = (id) => handleDeleteItem('/api/incidents', id, setIncidents, 'incident');

    const handleAddMedia = (data) => handleAddItem('/api/media', data, setMediaItems, 'Media Item');
    const handleDeleteMedia = (id) => handleDeleteItem('/api/media', id, setMediaItems, 'media item');

    const handleAddMaintenancePart = (data) => handleAddItem('/api/maintenance_parts', data, setMaintenanceParts, 'Maintenance Part');
    
    // ... (Add other handlers like handleAddMission, handleDeleteMission etc. following the pattern)

    const sendDroneCommand = async (droneId, command, params = {}) => {
        try {
            await apiRequest(`/api/command_drone/${droneId}`, 'POST', { command, params });
            displayMessage(`Command '${command}' sent.`, 'success');
        } catch (error) { displayMessage(error.message, 'error'); }
    };
    
    // --- AUTH ---
    const handleLoginSuccess = () => { setIsAuthenticated(true); navigate('/'); };
    const handleLogout = () => { setIsAuthenticated(false); navigate('/auth'); };
    
    // --- RENDER ---
    return (
        <div className="flex min-h-screen bg-gray-100">
            {isAuthenticated ? (
                <>
                    <Sidebar onLogout={handleLogout} notifications={notifications} />
                    <div className="flex-1 flex flex-col">
                        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                            <h1 className="text-xl font-semibold">Drone Operations Dashboard</h1>
                            {message && <div className={`px-4 py-2 rounded text-white text-sm ${messageType === 'success' ? 'bg-green-500' : messageType === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>{message}</div>}
                        </header>
                        <main className="flex-1 p-6 overflow-y-auto">
                            <Routes>
                                <Route path="/" element={<Dashboard drones={drones} incidents={incidents} mediaItems={mediaItems} missions={missions} maintenanceParts={maintenanceParts} />} />
                                
                                <Route path="/live-operations" element={<LiveOperations drones={drones} connectedDrones={connectedDrones} liveTelemetry={liveTelemetry} sendDroneCommand={sendDroneCommand} displayMessage={displayMessage} />} />
                                <Route path="/missions" element={<Missions missions={missions} drones={drones} handleAddMission={handleAddMission} displayMessage={displayMessage} />} />

                                {/* Assets */}
                                <Route path="/assets/drones" element={<Drones drones={drones} handleAddDrone={handleAddDrone} handleDeleteDrone={handleDeleteDrone} displayMessage={displayMessage} />} />
                                <Route path="/assets/ground-stations" element={<GroundStations groundStations={groundStations} setGroundStations={setGroundStations} />} />
                                <Route path="/assets/equipment" element={<Equipment equipment={equipment} setEquipment={setEquipment} />} />
                                <Route path="/assets/batteries" element={<Batteries batteries={batteries} setBatteries={setBatteries} />} />

                                {/* Library */}
                                <Route path="/library/media" element={<Media mediaItems={mediaItems} handleAddMedia={handleAddMedia} handleDeleteMedia={handleDeleteMedia} displayMessage={displayMessage} />} />
                                <Route path="/library/files" element={<Files files={files} setFiles={setFiles} />} />
                                
                                {/* Manage */}
                                
                                
                                <Route path="/manage/incidents" element={
                                    <IncidentSection 
                                        incidents={incidents} 
                                        handleAddIncident={handleAddIncident}
                                        handleUpdateIncident={handleUpdateIncident}
                                        handleDeleteIncident={handleDeleteIncident}
                                        displayMessage={displayMessage} 
                                    />
                                } />
                                <Route path="/manage/maintenance" element={<MaintenanceSection parts={maintenanceParts} handleAddPart={handleAddMaintenancePart} displayMessage={displayMessage} />} />
                                <Route path="/manage/profile-settings" element={<ProfileSettings user={userProfile} setUser={setUserProfile} displayMessage={displayMessage} />} />
                                
                                <Route path="/notifications" element={<NotificationsPage notifications={notifications} />} />
                                
                                <Route path="*" element={<Dashboard drones={drones} incidents={incidents} mediaItems={mediaItems} />} />
                            </Routes>
                        </main>
                    </div>
                </>
            ) : (
                <Routes><Route path="*" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} /></Routes>
            )}
        </div>
    );
    
};

export default App;