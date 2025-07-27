import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    ShieldCheck, LayoutDashboard, Drone, Rocket, AlertCircle, User, LogOut, Trash2, Edit, PlusCircle, Package, Book, CheckSquare, Users
} from 'lucide-react';

// --- API CONFIG & HELPER ---
const ADMIN_API_URL = 'http://localhost:5001';

const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${ADMIN_API_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
};

// --- Child Components ---

const AdminSidebar = ({ onLogout }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    
    return (
        <div className="w-64 bg-gray-800 text-gray-300 flex flex-col h-screen">
            <div className="p-6 flex items-center justify-center border-b border-gray-700">
                <ShieldCheck className="w-10 h-10 text-blue-400 mr-3" />
                <span className="text-2xl font-bold text-white">Admin Panel</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <Link to="/admin" className={`flex items-center p-3 rounded-lg text-sm font-medium ${isActive('/admin') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
                    <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
                </Link>
                <Link to="/admin/assets" className={`flex items-center p-3 rounded-lg text-sm font-medium ${isActive('/admin/assets') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
                    <Package className="w-5 h-5 mr-3" /> Assets
                </Link>
                <Link to="/admin/library" className={`flex items-center p-3 rounded-lg text-sm font-medium ${isActive('/admin/library') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
                    <Book className="w-5 h-5 mr-3" /> Media Library
                </Link>
                <Link to="/admin/missions" className={`flex items-center p-3 rounded-lg text-sm font-medium ${isActive('/admin/missions') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
                    <Rocket className="w-5 h-5 mr-3" /> Mission Control
                </Link>
                <Link to="/admin/checklists" className={`flex items-center p-3 rounded-lg text-sm font-medium ${isActive('/admin/checklists') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
                    <CheckSquare className="w-5 h-5 mr-3" /> Checklists
                </Link>
                <Link to="/admin/incidents" className={`flex items-center p-3 rounded-lg text-sm font-medium ${isActive('/admin/incidents') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
                    <AlertCircle className="w-5 h-5 mr-3" /> Incident Reports
                </Link>
                <Link to="/admin/users" className={`flex items-center p-3 rounded-lg text-sm font-medium ${isActive('/admin/users') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
                    <Users className="w-5 h-5 mr-3" /> User Management
                </Link>
            </nav>
            <div className="p-4 mt-auto border-t border-gray-700">
                <button onClick={onLogout} className="w-full flex items-center p-3 rounded-lg text-sm text-red-400 hover:bg-red-600 hover:text-white">
                    <LogOut className="w-5 h-5 mr-3" /> Logout
                </button>
            </div>
        </div>
    );
};

const AdminDashboard = ({ stats }) => (
    <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Administrator Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-sm text-gray-500">Total Drones</p>
                <p className="text-3xl font-bold">{stats.totalDrones || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-sm text-gray-500">Total Missions</p>
                <p className="text-3xl font-bold">{stats.totalMissions || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-sm text-gray-500">Open Incidents</p>
                <p className="text-3xl font-bold">{stats.openIncidents || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-sm text-gray-500">Registered Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
            </div>
        </div>
    </div>
);

const AssetManagement = ({ assets, drones }) => ( /* UI Placeholder */ <div>Asset Management</div> );
const LibraryManagement = ({ media }) => ( /* UI Placeholder */ <div>Library Management</div> );
const ChecklistManagement = () => ( /* UI Placeholder */ <div>Checklist Management</div> );
const MissionManagement = () => ( /* UI Placeholder */ <div>Mission Management</div> );
const IncidentManagement = () => ( /* UI Placeholder */ <div>Incident Management</div> );
const UserManagement = () => ( /* UI Placeholder */ <div>User Management</div> );

const AdminLoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-800">
            <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-sm">
                <div className="flex items-center justify-center mb-6">
                    <ShieldCheck className="w-10 h-10 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-center">Admin Panel</h2>
                </div>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 mb-4 border rounded" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 mb-6 border rounded" />
                <button onClick={() => onLogin(username, password)} className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700">Login</button>
            </div>
        </div>
    );
};

// --- Main Admin Panel Component ---
const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [drones, setDrones] = useState([]);
    const [missions, setMissions] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [users, setUsers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [media, setMedia] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [stats, setStats] = useState({});
    
    const displayMessage = (text, type) => { alert(`${type.toUpperCase()}: ${text}`); };

    useEffect(() => {
        if (!isAuthenticated) {
            if (location.pathname !== '/admin/login') {
                navigate('/admin/login');
            }
            return;
        }
        
        const fetchAdminData = async () => {
            try {
                // Fetch all data in parallel
                const [statsData, dronesData, missionsData, incidentsData, usersData, assetsData, mediaData, checklistsData] = await Promise.all([
                    apiRequest('/api/admin/stats'),
                    apiRequest('/api/admin/drones'),
                    apiRequest('/api/admin/missions'),
                    apiRequest('/api/admin/incidents'),
                    apiRequest('/api/admin/user_profiles'),
                    apiRequest('/api/admin/assets'),
                    apiRequest('/api/admin/media'),
                    apiRequest('/api/admin/checklists'),
                ]);
                // Set all states
                setStats(statsData);
                setDrones(dronesData);
                setMissions(missionsData);
                setIncidents(incidentsData);
                setUsers(usersData);
                setAssets(assetsData);
                setMedia(mediaData);
                setChecklists(checklistsData);
            } catch (error) {
                displayMessage('Failed to load admin data: ' + error.message, 'error');
            }
        };
        fetchAdminData();
    }, [isAuthenticated, navigate, location.pathname]);

    const handleLogin = async (username, password) => {
        try {
            await apiRequest('/api/admin/login', 'POST', { username, password });
            setIsAuthenticated(true);
            navigate('/admin');
        } catch (error) {
            displayMessage('Invalid admin credentials', 'error');
        }
    };
    
    const handleLogout = () => {
        setIsAuthenticated(false);
        navigate('/admin/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {isAuthenticated && <AdminSidebar onLogout={handleLogout} />}
            <main className="flex-1 p-8 overflow-y-auto">
                <Routes>
                    {/* When not authenticated, only the login route is available */}
                    {!isAuthenticated && <Route path="/login" element={<AdminLoginPage onLogin={handleLogin} />} />}

                    {/* When authenticated, all other admin routes are available */}
                    {isAuthenticated && (
                        <>
                            <Route path="/" element={<AdminDashboard stats={stats} />} />
                            <Route path="/assets" element={<AssetManagement assets={assets} drones={drones} />} />
                            <Route path="/library" element={<LibraryManagement media={media} />} />
                            <Route path="/checklists" element={<ChecklistManagement checklists={checklists} />} />
                            <Route path="/missions" element={<MissionManagement />} />
                            <Route path="/incidents" element={<IncidentManagement />} />
                            <Route path="/users" element={<UserManagement />} />
                        </>
                    )}
                    
                    {/* A fallback to always direct to the correct starting page */}
                    <Route path="*" element={isAuthenticated ? <AdminDashboard stats={stats} /> : <AdminLoginPage onLogin={handleLogin} />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminPanel;