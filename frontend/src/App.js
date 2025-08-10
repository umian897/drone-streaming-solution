// import ReactPlayer from 'react-player';
import Hls from 'hls.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Video, Rocket, Package, Drone, HardDrive, BatteryCharging,
    Book, FileText, CheckSquare, Tag, Settings, AlertCircle, Wrench, Bell, UserCircle,
    LogOut, ChevronDown, ChevronUp, PlusCircle, MoreVertical, Trash2, MapPin, Activity, Clock, Image as ImageIcon,
    Gauge, Battery, Signal, Compass, Camera, Video as VideoIcon, Home, ListChecks, Search,
    Upload, Info, Factory, BatteryMedium, Plus, Edit, Eye, History, XCircle, Download, Mail, Key, Check, Calendar,
    List, Folder,
    Rewind, Pause, Play, FastForward, Volume2, MinusCircle, Square, User // Added User icon for Admin Panel
} from 'lucide-react';
import { io } from 'socket.io-client';

// Make sure AuthPage.js is located at src/pages/auth/AuthPage.js
import AuthPage from './pages/auth/AuthPage';

// --- API CONFIG & HELPER ---
const API_BASE_URL = 'http://localhost:5000'; // Matches app.py.pdf
const WEBSOCKET_URL = 'http://localhost:5000'; // Matches app.py.pdf

const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'X-Auth-Token': token }) // Add auth token if provided
        }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }
    if (response.status === 204) return null; // Handle No Content responses
    return response.json();
};

// --- HELPER FUNCTION FOR FILE ICONS (Used in Files component) ---
const getFileTypeIcon = (fileType) => {
    switch (fileType) {
        case 'PDF': return <FileText className="w-5 h-5 mr-2 text-red-500" />;
        case 'DOCX': return <FileText className="w-5 h-5 mr-2 text-blue-500" />;
        case 'XLSX': return <ListChecks className="w-5 h-5 mr-2 text-green-500" />;
        case 'TXT': return <FileText className="w-5 h-5 mr-2 text-gray-500" />;
        default: return <Folder className="w-5 h-5 mr-2 text-yellow-500" />;
    }
};

// --- 1. GENERIC UI COMPONENTS (No specific data dependencies, or only very basic ones) ---

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

// Generic Asset List Component (receives 'assets' and handlers from props)
const AssetList = ({ title, assets, onAddItem, onViewDetails, assetTypeIcon: AssetIcon }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAssets = assets.filter(asset =>
        (asset.name && asset.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.model && asset.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.uniqueId && asset.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={onAddItem}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors transform hover:-translate-y-1 shadow-md w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add New {title.replace(' Inventory', '').replace(' Management', '').replace('s', '')}
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

// Generic Asset Details Component (receives asset and handlers from props)
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

// Generic Add Item Form Component (receives data and handlers)
const AddItemForm = ({ title, onSave, onCancel, assetType, initialData = null }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [model, setModel] = useState(initialData?.model || '');
    const [manufacturer, setManufacturer] = useState(initialData?.manufacturer || '');
    const [uniqueId, setUniqueId] = useState(initialData?.uniqueId || '');
    const [status, setStatus] = useState(initialData?.status || 'Available');
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');

    const [lastLocation, setLastLocation] = useState(initialData?.lastLocation || '');
    const [flightHours, setFlightHours] = useState(initialData?.flightHours || '');
    const [payloadCapacity, setPayloadCapacity] = useState(initialData?.payloadCapacity || '');

    const [coverageArea, setCoverageArea] = useState(initialData?.coverageArea || '');
    const [powerSource, setPowerSource] = useState(initialData?.powerSource || '');

    const [equipmentType, setEquipmentType] = useState(initialData?.equipmentType || '');
    const [compatibility, setCompatibility] = useState(initialData?.compatibility || '');

    const [capacity, setCapacity] = useState(initialData?.capacity || '');
    const [cycleCount, setCycleCount] = useState(initialData?.cycleCount || '');
    const [lastCharged, setLastCharged] = useState(initialData?.lastCharged || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            id: initialData?.id || `new-${Date.now()}`,
            name,
            model,
            manufacturer,
            uniqueId,
            status,
            imageUrl,
            type: assetType,
            maintenanceHistory: initialData?.maintenanceHistory || [],
        };

        if (assetType === 'Drone') {
            Object.assign(newItem, { lastLocation, flightHours: parseFloat(flightHours), payloadCapacity: parseFloat(payloadCapacity) });
        } else if (assetType === 'Ground Station') {
            Object.assign(newItem, { coverageArea, powerSource });
        } else if (assetType === 'Equipment') {
            Object.assign(newItem, { equipmentType, compatibility });
        } else if (assetType === 'Battery') {
            Object.assign(newItem, { capacity: parseInt(capacity), cycleCount: parseInt(cycleCount), lastCharged });
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


// --- 2. LIBRARY COMPONENTS (Media, Files, Checklists, Tags) ---

// Media sub-components
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
            thumbnail: type === 'video' ? 'https://placehold.co/300x200/cccccc/333333?text=Video+Placeholder' : url,
            droneId,
            missionId,
            timestamp: new Date().toISOString(),
            gps: 'N/A',
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

const MediaDetailView = ({ media, onBack, onAddTag, onRemoveTag, onEdit, onDelete }) => {
    const [newTagInput, setNewTagInput] = useState('');
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleDownload = () => {
        alert(`Downloading ${media.title}...`);
        window.open(media.url, '_blank');
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
                    <p className="text-gray-700">Timestamp: <span className="font-medium">{media.timestamp ? new Date(media.timestamp).toLocaleString() : 'N/A'}</span></p>
                    <p className="text-gray-700">GPS Coordinates: <span className="font-medium">{media.gps}</span></p>
                    <p className="text-gray-700">Description: <span className="font-medium">{media.description || 'N/A'}</span></p>

                    <div>
                        <h5 className="text-lg font-semibold text-gray-800 mb-2">Tags:</h5>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {media.tags && media.tags.map(tag => (
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

const Media = ({ mediaItems, setMediaItems, handleAddMedia, handleUpdateMedia, handleDeleteMedia, displayMessage }) => {
    const [currentView, setCurrentView] = useState('list');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [confirmingDeleteMedia, setConfirmingDeleteMedia] = useState(null);

    const filteredMedia = (mediaItems || []).filter(item => {
        const matchesType = filterType === 'all' || item.type === filterType;
        const matchesSearch =
            (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.droneId && item.droneId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.missionId && item.missionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.tags && Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
        return matchesType && matchesSearch;
    });

    const handleViewMediaDetails = (id) => {
        setSelectedMedia(mediaItems.find(item => item.id === id));
        setCurrentView('details');
    };

    const handleEditMedia = () => {
        setCurrentView('edit-media');
    };

    const handleSaveMedia = async (updatedMedia) => {
        const success = await handleUpdateMedia(updatedMedia.id, {
            title: updatedMedia.title,
            description: updatedMedia.description,
            droneId: updatedMedia.droneId,
            missionId: updatedMedia.missionId,
            gps: updatedMedia.gps,
            tags: updatedMedia.tags
        });
        if (success) {
            setCurrentView('list');
            setSelectedMedia(null);
        }
    };

    const handleAddTagToMedia = async (mediaId, newTag) => {
        const mediaToUpdate = mediaItems.find(item => item.id === mediaId);
        if (!mediaToUpdate) return;

        const updatedTags = [...(mediaToUpdate.tags || []), newTag];
        const success = await handleUpdateMedia(mediaId, { tags: updatedTags });
        if (success) {
            setSelectedMedia(prev => ({ ...prev, tags: updatedTags }));
        }
    };

    const handleRemoveTagFromMedia = async (mediaId, tagToRemove) => {
        const mediaToUpdate = mediaItems.find(item => item.id === mediaId);
        if (!mediaToUpdate) return;

        const updatedTags = (mediaToUpdate.tags || []).filter(tag => tag !== tagToRemove);
        const success = await handleUpdateMedia(mediaId, { tags: updatedTags });
        if (success) {
            setSelectedMedia(prev => ({ ...prev, tags: updatedTags }));
        }
    };

    const confirmDeleteMedia = (id) => {
        setConfirmingDeleteMedia(id);
    };

    const handleConfirmDeleteMedia = async () => {
        const success = await handleDeleteMedia(confirmingDeleteMedia);
        if (success) {
            setConfirmingDeleteMedia(null);
            setSelectedMedia(null);
            setCurrentView('list');
        }
    };

    const handleCancelDeleteMedia = () => {
        setConfirmingDeleteMedia(null);
    };

    const handleBackToMediaList = () => {
        setCurrentView('list');
        setSelectedMedia(null);
    };

    if (currentView === 'upload') {
        return <UploadMediaForm onSave={handleAddMedia} onCancel={handleBackToMediaList} />;
    }
    if (currentView === 'edit-media') {
        return <EditMediaForm onSave={handleSaveMedia} onCancel={handleBackToMediaList} initialData={selectedMedia} />;
    }
    if (currentView === 'details') {
        return (
            <>
                <MediaDetailView
                    media={selectedMedia}
                    onBack={handleBackToMediaList}
                    onAddTag={handleAddTagToMedia}
                    onRemoveTag={handleRemoveTagFromMedia}
                    onEdit={handleEditMedia}
                    onDelete={() => confirmDeleteMedia(selectedMedia.id)}
                />
                {confirmingDeleteMedia && (
                    <ConfirmationModal
                        message={`Are you sure you want to delete media "${selectedMedia?.title}"? This action cannot be undone.`}
                        onConfirm={handleConfirmDeleteMedia}
                        onCancel={handleCancelDeleteMedia}
                    />
                )}
            </>
        );
    }

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)]">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Captured Media Library</h2>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={() => setCurrentView('upload')}
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
                        <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer" onClick={() => handleViewMediaDetails(item.id)}>
                            <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
                                {item.type === 'image' ? (
                                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/cccccc/333333?text=Image+Error'; }} />
                                ) : (
                                    <video src={item.url} controls={false} className="w-full h-full object-cover" poster={item.thumbnail} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/cccccc/333333?text=Video+Error'; }}></video>
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
                                    <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex justify-end space-x-2 mt-3">
                                    <button onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Download">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); confirmDeleteMedia(item.id); }} className="p-2 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors" title="Delete">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {confirmingDeleteMedia && (
                <ConfirmationModal
                    message={`Are you sure you want to delete this media item? This action cannot be undone.`}
                    onConfirm={handleConfirmDeleteMedia}
                    onCancel={handleCancelDeleteMedia}
                />
            )}
        </div>
    );
};

// Files sub-components
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

const Files = ({ files, setFiles, displayMessage, handleAddFile, handleDeleteFile }) => {
    const [currentView, setCurrentView] = useState('list');
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmingDeleteFile, setConfirmingDeleteFile] = useState(null);

    const filteredFiles = files.filter(file =>
        (file.name && file.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (file.category && file.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (file.type && file.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleViewFile = (id) => {
        setSelectedFile(files.find(file => file.id === id));
        setCurrentView('view-document');
    };

    const handleBackToFileList = () => {
        setCurrentView('list');
        setSelectedFile(null);
    };

    const onUploadFile = async (newFileData) => {
        const success = await handleAddFile(newFileData);
        if (success) {
            setCurrentView('list');
        }
    };

    const handleDownloadFile = (fileUrl, fileName) => {
        window.open(fileUrl, '_blank');
    };

    const handleDeleteFileConfirm = (id) => {
        setConfirmingDeleteFile(id);
    };

    const handleConfirmDeleteFile = async () => {
        const success = await handleDeleteFile(confirmingDeleteFile);
        if (success) {
            setConfirmingDeleteFile(null);
            setSelectedFile(null);
            setCurrentView('list');
        }
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
                                                {file.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {file.uploadDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleViewFile(file.id)} className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                                                <button onClick={() => handleDeleteFileConfirm(file.id)} className="text-red-600 hover:text-red-900">Delete</button>
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
                <UploadFileForm onSave={onUploadFile} onCancel={handleBackToFileList} />
            )}
            {currentView === 'view-document' && selectedFile && (
                <ViewDocument file={selectedFile} onBack={handleBackToFileList} onDownload={handleDownloadFile} onDelete={() => handleDeleteFileConfirm(selectedFile.id)} />
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

// Checklist sub-components
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
            ...initialData,
            name,
            description,
            items: items.filter(item => item.text.trim() !== '').map(item => ({ ...item, completed: false, notes: '' })),
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

const Checklists = ({ checklists, setChecklists, displayMessage, handleAddChecklist, handleUpdateChecklist, handleDeleteChecklist }) => {
    const [currentView, setCurrentView] = useState('list');
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [confirmingDeleteChecklist, setConfirmingDeleteChecklist] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChecklists = checklists.filter(cl =>
        (cl.name && cl.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cl.description && cl.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cl.completedBy && cl.completedBy.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCreateChecklist = () => setCurrentView('create');
    const handleEditChecklist = (id) => {
        setSelectedChecklist(checklists.find(cl => cl.id === id));
        setCurrentView('edit');
    };
    const handleDeleteChecklistConfirm = (id) => {
        setConfirmingDeleteChecklist(id);
    };

    const handleConfirmDeleteChecklist = async () => {
        const success = await handleDeleteChecklist(confirmingDeleteChecklist);
        if (success) {
            setConfirmingDeleteChecklist(null);
            setSelectedChecklist(null);
            setCurrentView('list');
        }
    };

    const handleCancelDeleteChecklist = () => {
        setConfirmingDeleteChecklist(null);
    };

    const handleViewChecklistDetails = (id) => {
        setSelectedChecklist(checklists.find(cl => cl.id === id));
        setCurrentView('details');
    };

    const handleSaveChecklist = async (updatedChecklistData) => {
        let success = false;
        if (currentView === 'create') {
            success = await handleAddChecklist({ ...updatedChecklistData, type: 'template' });
        } else if (currentView === 'edit') {
            success = await handleUpdateChecklist(updatedChecklistData.id, updatedChecklistData);
        }
        if (success) {
            setCurrentView('list');
            setSelectedChecklist(null);
        }
    };

    const handleBackToChecklistList = () => {
        setCurrentView('list');
        setSelectedChecklist(null);
    };

    const handleCompleteChecklist = async (completedChecklistData) => {
        const newCompletedChecklist = {
            name: `${completedChecklistData.name} (Completed on ${new Date().toLocaleDateString()})`,
            description: completedChecklistData.description,
            items: completedChecklistData.items.map(item => ({ ...item })),
            type: 'completed',
            dateCompleted: new Date().toISOString().slice(0, 10),
            completedBy: 'Current User (Simulated)',
            completionNotes: completedChecklistData.completionNotes,
        };
        const success = await handleAddChecklist(newCompletedChecklist);
        if (success) {
            displayMessage("Checklist successfully completed and archived!", "success");
            setCurrentView('list');
        }
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
                                            {cl.items && cl.items.slice(0, 3).map((item, index) => (
                                                <li key={item.id} className={item.completed ? 'line-through text-gray-500' : ''}>
                                                    {item.text}
                                                </li>
                                            ))}
                                            {cl.items && cl.items.length > 3 && <li className="text-gray-500">...and {cl.items.length - 3} more items</li>}
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
                                        <button onClick={() => handleDeleteChecklistConfirm(cl.id)} className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200">
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

// Tag sub-components
const TagForm = ({ onSave, onCancel, initialData = null }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...initialData, name, description });
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

const Tags = ({ tags, setTags, displayMessage, handleAddTag, handleUpdateTag, handleDeleteTag }) => {
    const [currentView, setCurrentView] = useState('list');
    const [selectedTag, setSelectedTag] = useState(null);
    const [confirmingDeleteTag, setConfirmingDeleteTag] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTags = tags.filter(tag =>
        (tag.name && tag.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCreateTag = () => setCurrentView('create');
    const handleEditTag = (id) => {
        setSelectedTag(tags.find(tag => tag.id === id));
        setCurrentView('edit');
    };
    const handleDeleteTagConfirm = (id) => {
        setConfirmingDeleteTag(id);
    };

    const handleConfirmDeleteTag = async () => {
        const success = await handleDeleteTag(confirmingDeleteTag);
        if (success) {
            setConfirmingDeleteTag(null);
            setSelectedTag(null);
            setCurrentView('list');
        }
    };
    const handleCancelDeleteTag = () => {
        setConfirmingDeleteTag(null);
    };

    const handleSaveTag = async (updatedTagData) => {
        let success = false;
        if (currentView === 'create') {
            success = await handleAddTag(updatedTagData);
        } else if (currentView === 'edit') {
            success = await handleUpdateTag(updatedTagData.id, updatedTagData);
        }
        if (success) {
            setCurrentView('list');
            setSelectedTag(null);
        }
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
                                                <button onClick={() => handleDeleteTagConfirm(tag.id)} className="text-red-600 hover:text-red-900">Delete</button>
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


// --- 3. MANAGE COMPONENTS (Incidents, Maintenance, Profile Settings, Notifications) ---

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

    const handleSave = async () => {
        if (!currentIncident.message || !currentIncident.type) {
            displayMessage("Type and message are required.", 'error');
            return;
        }
        let success = false;
        if (isEditing) {
            success = await handleUpdateIncident(currentIncident.id, currentIncident);
        } else {
            success = await handleAddIncident(currentIncident);
        }
        if (success) {
            setShowModal(false);
        }
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
                            <p className="text-sm text-gray-500 mt-1">{incident.timestamp ? new Date(incident.timestamp).toLocaleString() : 'N/A'}</p>
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

const ProfileSettings = ({ user, setUser, displayMessage, handleUpdateUserProfile, handleChangePassword, handleUpdateProfilePicture }) => {
    const [newName, setNewName] = useState(user.name || '');
    const [newEmail, setNewEmail] = useState(user.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [profilePictureUrlInput, setProfilePictureUrlInput] = useState(user.profilePicture || '');

    // Sync local state with prop changes (e.g., after successful update from backend)
    useEffect(() => {
        if (user) {
            setNewName(user.name);
            setNewEmail(user.email);
            setProfilePictureUrlInput(user.profilePicture);
        }
    }, [user]);


    const onSubmitUpdateProfile = async (e) => {
        e.preventDefault();
        await handleUpdateUserProfile({ name: newName, email: newEmail });
    };

    const onSubmitChangePassword = async (e) => {
        e.preventDefault();
        await handleChangePassword(currentPassword, newPassword, confirmNewPassword);
        // Clear password fields regardless of success/failure for security
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const onSubmitUpdateProfilePicture = async (e) => {
        e.preventDefault();
        await handleUpdateProfilePicture(profilePictureUrlInput);
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
                <form onSubmit={onSubmitUpdateProfilePicture} className="mt-6 w-full flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <input
                        type="url"
                        placeholder="New Profile Picture URL"
                        value={profilePictureUrlInput}
                        onChange={(e) => setProfilePictureUrlInput(e.target.value)}
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
                <form onSubmit={onSubmitUpdateProfile} className="space-y-6">
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
                <form onSubmit={onSubmitChangePassword} className="space-y-6">
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

const NotificationsPage = ({ notifications, setNotifications, displayMessage }) => {
    const [filter, setFilter] = useState('all');

    const markAsRead = async (id) => {
        try {
            const response = await apiRequest(`/api/notifications/mark_read/${id}`, 'POST');
            setNotifications(prev => prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            ));
            displayMessage("Notification marked as read.", 'info');
        } catch (error) {
            displayMessage(`Failed to mark notification as read: ${error.message}`, 'error');
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiRequest('/api/notifications/mark_all_read', 'POST');
            setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
            displayMessage("All notifications marked as read.", 'info');
        } catch (error) {
            displayMessage('Error marking all notifications as read: ' + error.message, 'error');
        }
    };

    const deleteNotification = async (id) => {
        if (window.confirm("Are you sure you want to delete this notification?")) {
            try {
                await apiRequest(`/api/notifications/delete/${id}`, 'DELETE');
                setNotifications(prev => prev.filter(notif => notif.id !== id));
                displayMessage("Notification deleted.", 'info');
            }
            catch (error) {
                displayMessage(`Failed to delete notification: ${error.message}`, 'error');
            }
        }
    };

    const deleteAllRead = async () => {
        if (window.confirm("Are you sure you want to delete all read notifications?")) {
            try {
                await apiRequest('/api/notifications/delete_read', 'DELETE');
                setNotifications(prev => prev.filter(notif => !notif.read));
                displayMessage("All read notifications deleted.", 'info');
            } catch (error) {
                displayMessage('Error deleting all read notifications: ' + error.message, 'error');
            }
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
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

function MaintenanceSection({ maintenanceParts, setMaintenanceParts, displayMessage }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPart, setNewPart] = useState({
        name: '', status: 'Available', lastMaintenance: '', nextMaintenance: ''
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPart, setEditingPart] = useState(null);


    const handleAddPart = async () => {
        if (newPart.name.trim() === '') {
            displayMessage("Part name cannot be empty.", 'error');
            return;
        }
        try {
            const response = await apiRequest('/api/maintenance_parts', 'POST', {
                name: newPart.name,
                last_maintenance: newPart.lastMaintenance || null,
                next_maintenance: newPart.nextMaintenance || null,
                status: newPart.status,
            });
            setMaintenanceParts(prev => [...prev, {
                ...response,
                lastMaintenance: response.lastMaintenance,
                nextMaintenance: response.nextMaintenance,
            }]);
            displayMessage("Maintenance part added successfully!", 'success');
            setShowAddModal(false);
            setNewPart({ name: '', status: 'Available', lastMaintenance: '', nextMaintenance: '' });
        } catch (error) {
            displayMessage(`Failed to add part: ${error.message}`, 'error');
        }
    };

    const handleUpdatePart = async () => {
        if (!editingPart || editingPart.name.trim() === '') {
            displayMessage("Part name cannot be empty.", 'error');
            return;
        }
        try {
            const response = await apiRequest(`/api/maintenance_parts/${editingPart.id}`, 'PUT', {
                name: editingPart.name,
                last_maintenance: editingPart.lastMaintenance || null,
                next_maintenance: editingPart.nextMaintenance || null,
                status: editingPart.status,
            });
            setMaintenanceParts(prev => prev.map(p => (p.id === editingPart.id ? {
                ...response,
                lastMaintenance: response.lastMaintenance,
                nextMaintenance: response.nextMaintenance,
            } : p)));
            displayMessage("Maintenance part updated successfully!", 'success');
            setShowEditModal(false);
            setEditingPart(null);
        } catch (error) {
            displayMessage(`Failed to update part: ${error.message}`, 'error');
        }
    };


    const handleDeletePart = async (id) => {
        if (window.confirm("Are you sure you want to delete this maintenance part?")) {
            try {
                await apiRequest(`/api/maintenance_parts/${id}`, 'DELETE');
                setMaintenanceParts(prev => prev.filter(part => part.id !== id));
                displayMessage("Maintenance part deleted.", 'info');
            } catch (error) {
                displayMessage(`Failed to delete part: ${error.message}`, 'error');
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

            {showEditModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Maintenance Part</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="editPartName" className="block text-sm font-medium text-gray-700">Part Name</label>
                                <input
                                    type="text"
                                    id="editPartName"
                                    value={editingPart?.name || ''}
                                    onChange={(e) => setEditingPart({ ...editingPart, name: e.target.value })}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="editPartStatus" className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    id="editPartStatus"
                                    value={editingPart?.status || 'Available'}
                                    onChange={(e) => setEditingPart({ ...editingPart, status: e.target.value })}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="Available">Available</option>
                                    <option value="In Repair">In Repair</option>
                                    <option value="Needs Service">Needs Service</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="editLastMaintenance" className="block text-sm font-medium text-gray-700">Last Maintenance Date</label>
                                <input
                                    type="date"
                                    id="editLastMaintenance"
                                    value={editingPart?.lastMaintenance ? new Date(editingPart.lastMaintenance).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setEditingPart({ ...editingPart, lastMaintenance: e.target.value })}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="editNextMaintenance" className="block text-sm font-medium text-gray-700">Next Maintenance Date</label>
                                <input
                                    type="date"
                                    id="editNextMaintenance"
                                    value={editingPart?.nextMaintenance ? new Date(editingPart.nextMaintenance).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setEditingPart({ ...editingPart, nextMaintenance: e.target.value })}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePart}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
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
                                <button onClick={() => { setEditingPart(part); setShowEditModal(true); }} className="p-2 rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors" title="Edit Part">
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

// --- 4. OPERATION COMPONENTS (Live Operations, Missions) ---

const HlsPlayer = ({ src }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls;

        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {
                    console.log("Browser requires user interaction to play the video.");
                });
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Fallback for native HLS support (like Safari)
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => {
                    console.log("Browser requires user interaction to play the video.");
                });
            });
        }

        // Cleanup function to destroy the HLS instance when the component unmounts
        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src]); // This effect re-runs whenever the stream URL changes

    return <video ref={videoRef} controls style={{ width: '100%', height: '100%' }} muted />;
};


const LiveOperations = ({ drones, connectedDrones, liveTelemetry, sendDroneCommand, displayMessage, onAddDrone, onRemoveDrone }) => {
    const [selectedDroneId, setSelectedDroneId] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newDroneData, setNewDroneData] = useState({ id: '', name: '', uniqueId: '', status: 'Offline' });

    useEffect(() => {
        // Sets the default drone when the list loads or changes
        if (drones.length > 0 && !drones.find(d => d.id === selectedDroneId)) {
            setSelectedDroneId(drones[0].id);
        } else if (drones.length === 0) {
            setSelectedDroneId('');
        }
    }, [drones, selectedDroneId]);

    // Define component variables
    const currentTelemetry = liveTelemetry[selectedDroneId] || {};
    const selectedDrone = drones.find(d => d.id === selectedDroneId);
    const isSelectedDroneOnline = connectedDrones.includes(selectedDroneId);
    
    // FIX: The stream URL now points to your Flask backend's HLS endpoint
    const streamUrl = selectedDroneId ? `${API_BASE_URL}/hls_streams/${selectedDroneId}/index.m3u8` : null;

    // Handler for sending commands
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

    // Handler to remove the selected drone
    const handleRemoveClick = () => {
        if (!selectedDroneId) {
            displayMessage("No drone selected to remove.", 'error');
            return;
        }
        if (window.confirm(`Are you sure you want to remove drone ${selectedDrone.name} (${selectedDroneId})?`)) {
            onRemoveDrone(selectedDroneId);
        }
    };
    
    // Handler to save a new drone from the modal
    const handleSaveNewDrone = () => {
        if (!newDroneData.id || !newDroneData.name || !newDroneData.uniqueId) {
            displayMessage("Please fill out all fields.", 'error');
            return;
        }
        onAddDrone(newDroneData);
        setIsAddModalOpen(false);
        setNewDroneData({ id: '', name: '', uniqueId: '', status: 'Offline' }); 
    };

    // FIX: New function to start the stream via backend API
    const startStream = async () => {
        if (!selectedDroneId) {
            displayMessage("No drone selected to start streaming.", 'error');
            return;
        }
        try {
            await apiRequest(`/api/stream/${selectedDroneId}/start`, 'POST', null, localStorage.getItem('authToken'));
            displayMessage(`Attempting to start stream for drone ${selectedDroneId}.`, 'info');
        } catch (error) {
            displayMessage(`Failed to start stream: ${error.message}`, 'error');
        }
    };
    
    // FIX: New function to stop the stream via backend API
    const stopStream = async () => {
        if (!selectedDroneId) {
            displayMessage("No drone selected to stop streaming.", 'error');
            return;
        }
        try {
            await apiRequest(`/api/stream/${selectedDroneId}/stop`, 'POST', null, localStorage.getItem('authToken'));
            displayMessage(`Attempting to stop stream for drone ${selectedDroneId}.`, 'info');
        } catch (error) {
            displayMessage(`Failed to stop stream: ${error.message}`, 'error');
        }
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
                                <option key={drone.id} value={drone.id}>{drone.name} ({drone.uniqueId})</option>
                            ))
                        ) : (
                            <option value="">No drones available</option>
                        )}
                    </select>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isSelectedDroneOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isSelectedDroneOnline ? 'Online' : 'Offline'}
                    </span>
                    <div className="flex items-center space-x-2 border-l pl-3 ml-1">
                        <button onClick={() => setIsAddModalOpen(true)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-sm" title="Add New Drone">
                            <Plus size={18} />
                        </button>
                        <button onClick={handleRemoveClick} disabled={!selectedDroneId} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:bg-gray-400 shadow-sm" title="Remove Selected Drone">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {/* FIX: Added Start/Stop Stream Buttons */}
                    <button onClick={startStream} disabled={!selectedDroneId || isSelectedDroneOnline} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-md">
                        <Play className="w-5 h-5 mr-2" /> Start Stream
                    </button>
                    <button onClick={stopStream} disabled={!selectedDroneId || !isSelectedDroneOnline} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-md">
                        <Square className="w-5 h-5 mr-2" /> Stop Stream
                    </button>

                    <button onClick={() => handleCommand('takeoff', { altitude: 10 })} disabled={!isSelectedDroneOnline || !selectedDroneId} className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 transition-colors shadow-md">
                        <Rocket className="w-5 h-5 mr-2" /> Takeoff
                    </button>
                    <button onClick={() => handleCommand('land')} disabled={!isSelectedDroneOnline || !selectedDroneId} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 transition-colors shadow-md">
                        <Home className="w-5 h-5 mr-2" /> Land
                    </button>
                    <button onClick={() => handleCommand('take_photo')} disabled={!isSelectedDroneOnline || !selectedDroneId} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors shadow-md">
                        <Camera className="w-5 h-5 mr-2" /> Take Photo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                <div className="lg:col-span-2 bg-black rounded-xl shadow-md flex items-center justify-center text-gray-400">
                    {/* The ReactPlayer has been replaced with our new HlsPlayer */}
                    {isSelectedDroneOnline && streamUrl ? (
                        <HlsPlayer src={streamUrl} />
                    ) : (
                        <span>Live feed is offline or no drone selected.</span>
                    )}
                </div>
                <div className="lg:col-span-1 flex flex-col space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-4 flex-1">
                        <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                        <div className="bg-gray-200 h-full rounded-md flex items-center justify-center">
                             <p className="text-xs text-gray-500 mt-2">Lat: {currentTelemetry.latitude?.toFixed(4) || 'N/A'}, Lng: {currentTelemetry.longitude?.toFixed(4) || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-4">Detailed Telemetry</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p className="flex justify-between"><span><Gauge size={14} className="inline mr-2" />Altitude:</span> <span className="font-semibold">{currentTelemetry.altitude?.toFixed(1) || 0} m</span></p>
                            <p className="flex justify-between"><span><Activity size={14} className="inline mr-2" />Speed:</span> <span className="font-semibold">{currentTelemetry.speed?.toFixed(1) || 0} m/s</span></p>
                            <p className="flex justify-between"><span><Battery size={14} className="inline mr-2" />Battery:</span> <span className="font-semibold">{currentTelemetry.battery_percent?.toFixed(0) || 0} %</span></p>
                            <p className="flex justify-between"><span><MapPin size={14} className="inline mr-2" />Status:</span> <span className="font-semibold">{currentTelemetry.status || 'N/A'}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-6">Add New Drone</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Drone ID (e.g., d4)" value={newDroneData.id} onChange={e => setNewDroneData({ ...newDroneData, id: e.target.value })} className="w-full p-3 border rounded-md" />
                            <input type="text" placeholder="Drone Name (e.g., AeroScout)" value={newDroneData.name} onChange={e => setNewDroneData({ ...newDroneData, name: e.target.value })} className="w-full p-3 border rounded-md" />
                            <input type="text" placeholder="Unique ID (e.g., DRN-AD-004)" value={newDroneData.uniqueId} onChange={e => setNewDroneData({ ...newDroneData, uniqueId: e.target.value })} className="w-full p-3 border rounded-md" />
                            <div>
                                <label htmlFor="droneStatus" className="block text-sm font-medium text-gray-700">Initial Status</label>
                                <select
                                    id="droneStatus"
                                    value={newDroneData.status}
                                    onChange={e => setNewDroneData({ ...newDroneData, status: e.target.value })}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="Offline">Offline</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 mt-8">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                            <button onClick={handleSaveNewDrone} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Drone</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const Missions = ({ missions = [], drones = [], handleAddMission, handleDeleteMission, displayMessage }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMission, setNewMission] = useState({
        name: '',
        drone_id: '',
        start_time: '',
        end_time: '',
        details: '',
        status: 'Scheduled' // Add status to initial state
    });
    const [statusFilter, setStatusFilter] = useState('all'); // State for the filter

    const onSave = async () => {
        if (!newMission.name || !newMission.drone_id || !newMission.start_time || !newMission.end_time) {
            displayMessage("Please fill all required mission fields.", 'error');
            return;
        }

        const missionToSave = {
            ...newMission,
            start_time: new Date(newMission.start_time).toISOString(),
            end_time: new Date(newMission.end_time).toISOString(),
            progress: 0,
        };

        const success = await handleAddMission(missionToSave);

        if (success) {
            setShowAddModal(false);
            setNewMission({ name: '', drone_id: '', start_time: '', end_time: '', details: '', status: 'Scheduled' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Scheduled': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter missions based on the selected status
    const filteredMissions = missions.filter(mission => {
        if (statusFilter === 'all') return true;
        return mission.status === statusFilter;
    });

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Missions Management</h2>
                <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusCircle className="w-5 h-5 mr-2" /> Create New Mission
                </button>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex space-x-2 mb-6 bg-white p-2 rounded-lg shadow-sm w-min">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setStatusFilter('Active')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${statusFilter === 'Active' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Active
                </button>
                <button
                    onClick={() => setStatusFilter('Scheduled')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${statusFilter === 'Scheduled' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Scheduled
                </button>
                 <button
                    onClick={() => setStatusFilter('Completed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${statusFilter === 'Completed' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    Completed
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
                                {drones.map(d => <option key={d.id} value={d.id}>{d.name} ({d.uniqueId})</option>)}
                            </select>
                            {/* New Status Field in Form */}
                            <div>
                                <label className="text-sm">Mission Status</label>
                                <select value={newMission.status} onChange={e => setNewMission({ ...newMission, status: e.target.value })} className="w-full p-2 border rounded">
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Active">Active</option>
                                </select>
                            </div>
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
                {/* Render the filtered list of missions */}
                {filteredMissions.map(mission => (
                    <div key={mission.id} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{mission.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(mission.status)}`}>{mission.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{mission.details}</p>
                        <div className="text-sm space-y-2">
                            <p><strong>Drone:</strong> {drones.find(d => d.id === mission.drone_id)?.name || mission.drone_id}</p>
                            <p><strong>Start:</strong> {mission.start_time ? new Date(mission.start_time).toLocaleString() : 'N/A'}</p>
                            <p><strong>End:</strong> {mission.end_time ? new Date(mission.end_time).toLocaleString() : 'N/A'}</p>
                            <p><strong>Progress:</strong> {mission.progress}%</p>
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

// --- 5. ASSET-SPECIFIC COMPONENTS (Drones, Ground Stations, Equipment, Batteries) ---
// These components use the generic AssetList, AssetDetails, AddItemForm, and MaintenanceHistoryView
// They receive their specific data and handlers as props.

const Drones = ({ drones, handleAddDrone, handleUpdateDrone, handleDeleteDrone, handleUpdateDroneStatus, displayMessage }) => {
    // State for managing views (list, details, add, edit) and modals
    const [currentView, setCurrentView] = useState('list');
    const [selectedDrone, setSelectedDrone] = useState(null);
    const [confirmingDeleteDrone, setConfirmingDeleteDrone] = useState(null);

    // Handlers for changing views and managing modals
    const handleAddDroneClick = () => setCurrentView('add-drone');
    const handleViewDroneDetails = (id) => {
        setSelectedDrone(drones.find(drone => drone.id === id));
        setCurrentView('details');
    };
    const handleEditDroneClick = () => {
        setCurrentView('edit-drone');
    };
    const handleDeleteDroneClick = () => {
        setConfirmingDeleteDrone(selectedDrone.id);
    };
    const handleConfirmDeleteDrone = async () => {
        const success = await handleDeleteDrone(confirmingDeleteDrone);
        if (success) {
            setConfirmingDeleteDrone(null);
            setSelectedDrone(null);
            setCurrentView('list');
        }
    };
    const handleCancelDeleteDrone = () => {
        setConfirmingDeleteDrone(null);
    };
    const handleViewDroneMaintenanceHistory = () => {
        setCurrentView('maintenance-history');
    };

    // Handler for saving a new or edited drone
    const handleSaveDrone = async (updatedDroneData) => {
        let success = false;
        if (currentView === 'add-drone') {
            success = await handleAddDrone(updatedDroneData);
        } else if (currentView === 'edit-drone') {
            success = await handleUpdateDrone(updatedDroneData.id, updatedDroneData);
        }
        if (success) {
            setCurrentView('list');
            setSelectedDrone(null);
        }
    };

    const handleBackToDroneList = () => {
        setCurrentView('list');
        setSelectedDrone(null);
    };

    // NEW: Handler for toggling the online/offline status
    const handleToggleStatus = (drone) => {
        const newStatus = (drone.status === 'Online' || drone.status === 'Deployed') ? 'Offline' : 'Online';
        handleUpdateDroneStatus(drone.id, newStatus);
    };

    // Helper function for styling the status badges
    const getStatusColor = (status) => {
        switch (status) {
            case 'Online':
            case 'Deployed':
                return 'bg-green-100 text-green-800';
            case 'In Maintenance':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Conditional rendering based on the current view
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
                    onEdit={handleEditDroneClick}
                    onDelete={handleDeleteDroneClick}
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

    // Main list view, now using AssetList which contains the table with the toggle
    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Drones Inventory</h2>
                <button onClick={handleAddDroneClick} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md">
                    <PlusCircle className="w-5 h-5 mr-2" /> Add Drone
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['ID', 'Name', 'Status', 'Online Status', 'Flight Hours', 'Location', 'Actions'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {drones.map((drone) => (
                            <tr key={drone.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{drone.uniqueId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{drone.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(drone.status)}`}>
                                        {drone.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <label htmlFor={`toggle-${drone.id}`} className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                id={`toggle-${drone.id}`} 
                                                className="sr-only" 
                                                checked={drone.status === 'Online' || drone.status === 'Deployed'} 
                                                onChange={() => handleToggleStatus(drone)} 
                                            />
                                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${drone.status === 'Online' || drone.status === 'Deployed' ? 'transform translate-x-full bg-green-400' : ''}`}></div>
                                        </div>
                                    </label>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{drone.flightHours}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{drone.lastLocation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleViewDroneDetails(drone.id)} className="text-blue-600 hover:text-blue-900 mr-3"><Eye className="w-5 h-5" /></button>
                                    <button onClick={() => handleDeleteDrone(drone.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const GroundStations = ({ groundStations, handleAddGS, handleUpdateGS, handleDeleteGS, displayMessage }) => {
    const [currentView, setCurrentView] = useState('list');
    const [selectedGS, setSelectedGS] = useState(null);
    const [confirmingDeleteGS, setConfirmingDeleteGS] = useState(null);

    const handleAddGSClick = () => setCurrentView('add-gs');
    const handleViewGSDetails = (id) => {
        setSelectedGS(groundStations.find(gs => gs.id === id));
        setCurrentView('details');
    };
    const handleEditGSClick = () => {
        setCurrentView('edit-gs');
    };
    const handleDeleteGSClick = () => {
        setConfirmingDeleteGS(selectedGS.id);
    };
    const handleConfirmDeleteGS = async () => {
        const success = await handleDeleteGS(confirmingDeleteGS);
        if (success) {
            setConfirmingDeleteGS(null);
            setSelectedGS(null);
            setCurrentView('list');
        }
    };
    const handleCancelDeleteGS = () => {
        setConfirmingDeleteGS(null);
    };
    const handleViewGSMaintenanceHistory = () => {
        setCurrentView('maintenance-history');
    };

    const handleSaveGS = async (updatedGSData) => {
        let success = false;
        if (currentView === 'add-gs') {
            success = await handleAddGS(updatedGSData);
        } else if (currentView === 'edit-gs') {
            success = await handleUpdateGS(updatedGSData.id, updatedGSData);
        }
        if (success) {
            setCurrentView('list');
            setSelectedGS(null);
        }
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
                    onEdit={handleEditGSClick}
                    onDelete={handleDeleteGSClick}
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
            onAddItem={handleAddGSClick}
            onViewDetails={handleViewGSDetails}
            assetTypeIcon={Factory}
        />
    );
};

const Equipment = ({ equipment, handleAddEquipment, handleUpdateEquipment, handleDeleteEquipment, displayMessage }) => {
    const [currentView, setCurrentView] = useState('list');
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [confirmingDeleteEquipment, setConfirmingDeleteEquipment] = useState(null);

    const handleAddEquipmentClick = () => setCurrentView('add-equipment');
    const handleViewEquipmentDetails = (id) => {
        setSelectedEquipment(equipment.find(eq => eq.id === id));
        setCurrentView('details');
    };
    const handleEditEquipmentClick = () => {
        setCurrentView('edit-equipment');
    };
    const handleDeleteEquipmentClick = () => {
        setConfirmingDeleteEquipment(selectedEquipment.id);
    };
    const handleConfirmDeleteEquipment = async () => {
        const success = await handleDeleteEquipment(confirmingDeleteEquipment);
        if (success) {
            setConfirmingDeleteEquipment(null);
            setSelectedEquipment(null);
            setCurrentView('list');
        }
    };
    const handleCancelDeleteEquipment = () => {
        setConfirmingDeleteEquipment(null);
    };
    const handleViewEquipmentMaintenanceHistory = () => {
        setCurrentView('maintenance-history');
    };

    const handleSaveEquipment = async (updatedEqData) => {
        let success = false;
        if (currentView === 'add-equipment') {
            success = await handleAddEquipment(updatedEqData);
        } else if (currentView === 'edit-equipment') {
            success = await handleUpdateEquipment(updatedEqData.id, updatedEqData);
        }
        if (success) {
            setCurrentView('list');
            setSelectedEquipment(null);
        }
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
                    onEdit={handleEditEquipmentClick}
                    onDelete={handleDeleteEquipmentClick}
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
            onAddItem={handleAddEquipmentClick}
            onViewDetails={handleViewEquipmentDetails}
            assetTypeIcon={Wrench}
        />
    );
};

const Batteries = ({ batteries, handleAddBattery, handleUpdateBattery, handleDeleteBattery, displayMessage }) => {
    const [currentView, setCurrentView] = useState('list');
    const [selectedBattery, setSelectedBattery] = useState(null);
    const [confirmingDeleteBattery, setConfirmingDeleteBattery] = useState(null);

    const handleAddBatteryClick = () => setCurrentView('add-battery');
    const handleViewBatteryDetails = (id) => {
        setSelectedBattery(batteries.find(bat => bat.id === id));
        setCurrentView('details');
    };
    const handleEditBatteryClick = () => {
        setCurrentView('edit-battery');
    };
    const handleDeleteBatteryClick = () => {
        setConfirmingDeleteBattery(selectedBattery.id);
    };
    const handleConfirmDeleteBattery = async () => {
        const success = await handleDeleteBattery(confirmingDeleteBattery);
        if (success) {
            setConfirmingDeleteBattery(null);
            setSelectedBattery(null);
            setCurrentView('list');
        }
    };
    const handleCancelDeleteBattery = () => {
        setConfirmingDeleteBattery(null);
    };
    const handleViewBatteryMaintenanceHistory = () => {
        setCurrentView('maintenance-history');
    };

    const handleSaveBattery = async (updatedBatData) => {
        let success = false;
        if (currentView === 'add-battery') {
            success = await handleAddBattery(updatedBatData);
        } else if (currentView === 'edit-battery') {
            success = await handleUpdateBattery(updatedBatData.id, updatedBatData);
        }
        if (success) {
            setCurrentView('list');
            setSelectedBattery(null);
        }
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
                    onEdit={handleEditBatteryClick}
                    onDelete={handleDeleteBatteryClick}
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
            onAddItem={handleAddBatteryClick}
            onViewDetails={handleViewBatteryDetails}
            assetTypeIcon={BatteryMedium}
        />
    );
};


// --- 6. CORE APP COMPONENTS (Sidebar, Dashboard) ---
// These are higher-level components that consume data from App.js's state.

const Sidebar = ({ onLogout, userRole }) => {
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
                        className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/assets/drones', '/assets/ground-stations', '/assets/equipment', '/assets/batteries']) ?
                            'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
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
                        className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/library/media', '/library/files', '/library/checklists', '/library/tags']) ?
                            'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
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
                        className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition duration-150 ${isDropdownActive(['/manage/profile-settings', '/manage/incidents', '/manage/maintenance', '/admin-panel']) ?
                            'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
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
                            {userRole === 'admin' && ( // Admin panel link only for admins
                                <Link to="/admin-panel" className={`flex items-center p-2 rounded-md text-sm font-medium transition duration-150 ${isActive('/admin-panel') ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}>
                                    <User className="w-4 h-4 mr-3" /> User Admin
                                </Link>
                            )}
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



const Dashboard = ({ drones, missions, incidents, mediaItems, maintenanceParts }) => {
    const navigate = useNavigate(); // Hook for navigation

    const totalDrones = drones.length;
    const activeMissions = missions.filter(m => m.status === 'Active').length;
    const pendingMaintenance = maintenanceParts.filter(p => p.status !== 'Available').length;
    const recentIncidents = incidents.filter(i => !i.resolved).length;

    const mediaToday = (mediaItems || []).filter(m => {
        if (!m.date) return false;
        const today = new Date();
        const mediaDate = new Date(m.date);
        return mediaDate.getDate() === today.getDate() &&
            mediaDate.getMonth() === today.getMonth() &&
            mediaDate.getFullYear() === today.getFullYear();
    }).length;

    const totalFlightHours = drones.reduce((sum, drone) => sum + (drone.flightHours || 0), 0).toFixed(1);

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card becomes a clickable link */}
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => navigate('/assets/drones')}>
                    <Drone className="w-12 h-12 text-blue-500" />
                    <div>
                        <p className="text-gray-500 text-sm">Total Drones</p>
                        <p className="text-3xl font-bold text-gray-900">{totalDrones}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => navigate('/missions')}>
                    <Rocket className="w-12 h-12 text-green-500" />
                    <div>
                        <p className="text-gray-500 text-sm">Active Missions</p>
                        <p className="text-3xl font-bold text-gray-900">{activeMissions}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => navigate('/manage/maintenance')}>
                    <Wrench className="w-12 h-12 text-yellow-500" />
                    <div>
                        <p className="text-gray-500 text-sm">Pending Maintenance</p>
                        <p className="text-3xl font-bold text-gray-900">{pendingMaintenance}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => navigate('/manage/incidents')}>
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <div>
                        <p className="text-gray-500 text-sm">Recent Incidents</p>
                        <p className="text-3xl font-bold text-gray-900">{recentIncidents}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => navigate('/library/media')}>
                    <ImageIcon className="w-12 h-12 text-purple-500" />
                    <div>
                        <p className="text-gray-500 text-sm">Media Captured (Today)</p>
                        <p className="text-3xl font-bold text-gray-900">{mediaToday}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
                    <Clock className="w-12 h-12 text-indigo-500" />
                    <div>
                        <p className="text-gray-500 text-sm">Total Flight Hours</p>
                        <p className="text-3xl font-bold text-gray-900">{totalFlightHours}h</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Flight Activity Chart (Placeholder)</h3>
                <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                    Graph will be displayed here
                </div>
            </div>
        </div>
    );
};


// Admin-Specific Components (now defined within App.js to directly access App's state and handlers)
// These components wrap the generic ones defined above, passing relevant data and callbacks.

// User Form for Add/Edit (Generic modal form for user data) - kept here as it's admin specific
const UserForm = ({ title, initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        username: '', password: '', name: '', email: '', role: 'user', profilePicture: '',
        totalFlights: 0, totalFlightTime: "0h", averageFlightTime: "0h"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);  // Call the onSave prop with the form data
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" required />
                    </div>
                    {/* Password field only shown when adding a new user */}
                    {title === "Add New User" && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" required />
                        </div>
                    )}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full p-2 border rounded">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                        <input type="url" id="profilePicture" name="profilePicture" value={formData.profilePicture} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" placeholder="https://placehold.co/150x150" />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminPanelContent = ({
    displayMessage, authToken,
    users, handleAddUser, handleUpdateUser, handleDeleteUser, // User specific
    drones, handleAddDrone, handleUpdateDrone, handleDeleteDrone, // Drones
    groundStations, handleAddGroundStation, handleUpdateGroundStation, handleDeleteGroundStation, // Ground Stations
    equipment, handleAddEquipment, handleUpdateEquipment, handleDeleteEquipment, // Equipment
    batteries, handleAddBattery, handleUpdateBattery, handleDeleteBattery, // Batteries
    missions, handleAddMission, handleDeleteMission, // Missions
    mediaItems, setMediaItems, handleAddMedia, handleUpdateMedia, handleDeleteMedia, // Media
    files, setFiles, handleAddFile, handleDeleteFile, // Files
    checklists, setChecklists, handleAddChecklist, handleUpdateChecklist, handleDeleteChecklist, // Checklists
    tags, setTags, handleAddTag, handleUpdateTag, handleDeleteTag, // Tags
    incidents, handleAddIncident, handleUpdateIncident, handleDeleteIncident, // Incidents
    maintenanceParts, setMaintenanceParts, handleAddMaintenancePart, handleUpdateMaintenancePart, handleDeleteMaintenancePart // Maintenance Parts
}) => {
    const [activeTab, setActiveTab] = useState('users'); // State to manage active tab

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);  // For add/edit user form
    const [confirmingDeleteUser, setConfirmingDeleteUser] = useState(null);

    // User management specific functions (kept here as they're part of original AdminPanel)
    const openAddUserModal = () => {
        setCurrentUser({ username: '', password: '', name: '', email: '', role: 'user', profilePicture: '', totalFlights: 0, totalFlightTime: "0h", averageFlightTime: "0h" });
        setShowAddModal(true);
    };

    const openEditUserModal = (user) => {
        setCurrentUser(user);
        setShowEditModal(true);
    };

    const confirmDeleteUser = (user) => {
        setConfirmingDeleteUser(user);
    };

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h2>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200 overflow-x-auto">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('drones')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'drones' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Drone Management
                    </button>
                    <button
                        onClick={() => setActiveTab('groundStations')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'groundStations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Ground Station Management
                    </button>
                    <button
                        onClick={() => setActiveTab('equipment')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'equipment' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Equipment Management
                    </button>
                    <button
                        onClick={() => setActiveTab('batteries')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'batteries' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Battery Management
                    </button>
                     <button
                        onClick={() => setActiveTab('missions')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'missions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Mission Management
                    </button>
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'media' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Media Management
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'files' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        File Management
                    </button>
                    <button
                        onClick={() => setActiveTab('checklists')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'checklists' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Checklist Management
                    </button>
                    <button
                        onClick={() => setActiveTab('tags')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'tags' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Tag Management
                    </button>
                     <button
                        onClick={() => setActiveTab('incidents')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'incidents' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Incident Management
                    </button>
                     <button
                        onClick={() => setActiveTab('maintenanceParts')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'maintenanceParts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Maintenance Part Management
                    </button>
                </nav>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'users' && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">User Management</h3>
                        <button onClick={openAddUserModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            <PlusCircle className="w-5 h-5 mr-2" /> Add New User
                        </button>
                    </div>

                    {users.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
                            <p className="text-gray-500 text-lg">No users found.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md p-6 flex-1 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">{user.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditUserModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                                <button onClick={() => confirmDeleteUser(user)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {showAddModal && (
                        <UserForm
                            title="Add New User"
                            initialData={currentUser}
                            onSave={handleAddUser}
                            onCancel={() => setShowAddModal(false)}
                        />
                    )}

                    {showEditModal && currentUser && (
                        <UserForm
                            title="Edit User"
                            initialData={currentUser}
                            onSave={(updatedData) => handleUpdateUser(currentUser.id, updatedData)}
                            onCancel={() => setShowEditModal(false)}
                        />
                    )}

                    {confirmingDeleteUser && (
                        <ConfirmationModal
                            message={`Are you sure you want to delete user "${confirmingDeleteUser.username}"? This action cannot be undone.`}
                            onConfirm={() => handleDeleteUser(confirmingDeleteUser.id)}
                            onCancel={() => setConfirmingDeleteUser(null)}
                        />
                    )}
                </>
            )}

            {activeTab === 'drones' && (
                <Drones
                    drones={drones}
                    handleAddDrone={handleAddDrone}
                    handleUpdateDrone={handleUpdateDrone}
                    handleDeleteDrone={handleDeleteDrone}
                    displayMessage={displayMessage}
                />
            )}
            {activeTab === 'groundStations' && (
                <GroundStations
                    groundStations={groundStations}
                    handleAddGS={handleAddGroundStation}
                    handleUpdateGS={handleUpdateGroundStation}
                    handleDeleteGS={handleDeleteGroundStation}
                    displayMessage={displayMessage}
                />
            )}
            {activeTab === 'equipment' && (
                <Equipment
                    equipment={equipment}
                    handleAddEquipment={handleAddEquipment}
                    handleUpdateEquipment={handleUpdateEquipment}
                    handleDeleteEquipment={handleDeleteEquipment}
                    displayMessage={displayMessage}
                />
            )}
            {activeTab === 'batteries' && (
                <Batteries
                    batteries={batteries}
                    handleAddBattery={handleAddBattery}
                    handleUpdateBattery={handleUpdateBattery}
                    handleDeleteBattery={handleDeleteBattery}
                    displayMessage={displayMessage}
                />
            )}
            {activeTab === 'missions' && (
                <Missions
                    missions={missions}
                    drones={drones} // Missions need drone data for dropdown
                    handleAddMission={handleAddMission}
                    handleDeleteMission={handleDeleteMission}
                    displayMessage={displayMessage}
                />
            )}
            {activeTab === 'media' && (
                <Media
                    mediaItems={mediaItems}
                    setMediaItems={setMediaItems}
                    handleAddMedia={handleAddMedia}
                    handleUpdateMedia={handleUpdateMedia}
                    handleDeleteMedia={handleDeleteMedia}
                    displayMessage={displayMessage}
                />
            )}
            {activeTab === 'files' && (
                <Files
                    files={files}
                    setFiles={setFiles}
                    handleAddFile={handleAddFile}
                    handleDeleteFile={handleDeleteFile}
                    displayMessage={displayMessage}
                />
            )}
            {activeTab === 'checklists' && (
                <Checklists
                    checklists={checklists}
                    setChecklists={setChecklists}
                    handleAddChecklist={handleAddChecklist}
                    handleUpdateChecklist={handleUpdateChecklist}
                    handleDeleteChecklist={handleDeleteChecklist}
                    displayMessage={displayMessage}
                />
            )}
            {activeTab === 'tags' && (
                <Tags
                    tags={tags}
                    setTags={setTags}
                    handleAddTag={handleAddTag}
                    handleUpdateTag={handleUpdateTag}
                    handleDeleteTag={handleDeleteTag}
                    displayMessage={displayMessage}
                />
            )}
             {activeTab === 'incidents' && (
                <IncidentSection
                    incidents={incidents}
                    handleAddIncident={handleAddIncident}
                    handleUpdateIncident={handleUpdateIncident}
                    handleDeleteIncident={handleDeleteIncident}
                    displayMessage={displayMessage}
                />
            )}
             {activeTab === 'maintenanceParts' && (
                <MaintenanceSection
                    maintenanceParts={maintenanceParts}
                    setMaintenanceParts={setMaintenanceParts}
                    displayMessage={displayMessage}
                />
            )}
        </div>
    );
};

// --- 7. MAIN APP COMPONENT (The root of your application) ---
// This component should be the last one defined before the export.
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken')); // Store token
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole')); // Store user role
    const navigate = useNavigate();
    const handleUpdateDroneStatus = async (droneId, newStatus) => {
    try {
        // The API call will trigger the backend to broadcast the update
        await authenticatedApiRequest(`/api/drones/${droneId}/status`, 'POST', { status: newStatus });
        displayMessage(`Drone ${droneId} status set to ${newStatus}.`, 'success');
        // No need to set state here, WebSocket will handle it
        return true;
    } catch (error) {
        displayMessage(`Failed to update drone status: ${error.message}`, 'error');
        return false;
    }
};
    // Centralized Data State
    const [drones, setDrones] = useState([]);
    const [users, setUsers] = useState([]); 
    const [groundStations, setGroundStations] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [batteries, setBatteries] = useState([]);
    const [missions, setMissions] = useState([]);
    const [mediaItems, setMediaItems] = useState([]);
    const [files, setFiles] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [tags, setTags] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [maintenanceParts, setMaintenanceParts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [userProfile, setUserProfile] = useState({});

    // Live Operations specific states
    const [liveTelemetry, setLiveTelemetry] = useState({});
    const [connectedDrones, setConnectedDrones] = useState([]);

    // UI Feedback State
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const displayMessage = useCallback((text, type = 'info') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
    }, []);

    // Override the default apiRequest to use the token from App.js state
    const authenticatedApiRequest = useCallback(async (endpoint, method = 'GET', body = null) => {
        return apiRequest(endpoint, method, body, authToken);
    }, [authToken]);

    // --- Data Fetching & WebSocket Logic ---
      useEffect(() => {
        if (!isAuthenticated || !authToken) return; // Only fetch if authenticated and token exists

       const fetchAllInitialData = async () => {
            try {
                const apiCalls = [
                    authenticatedApiRequest('/api/drones'),
                    authenticatedApiRequest('/api/missions'),
                    authenticatedApiRequest('/api/media'),
                    authenticatedApiRequest('/api/incidents'),
                    authenticatedApiRequest('/api/maintenance_parts'),
                    authenticatedApiRequest('/api/notifications'),
                    authenticatedApiRequest('/api/connected_drones'),
                    authenticatedApiRequest('/api/ground_stations'),
                    authenticatedApiRequest('/api/equipment'),
                    authenticatedApiRequest('/api/batteries'),
                    authenticatedApiRequest('/api/files'),
                    authenticatedApiRequest('/api/checklists'),
                    authenticatedApiRequest('/api/tags'),
                    authenticatedApiRequest('/api/user/profile'),
                ];

                // If the user is an admin, add the call to fetch all users
                if (userRole === 'admin') {
                    apiCalls.push(authenticatedApiRequest('/api/admin/users'));
                }

                const responses = await Promise.all(apiCalls);

                // Assign all the existing data
                setDrones(responses[0]);
                setMissions(responses[1]);
                setMediaItems(responses[2]);
                setIncidents(responses[3]);
                setMaintenanceParts(responses[4]);
                setNotifications(responses[5]);
                setConnectedDrones(responses[6]);
                setGroundStations(responses[7]);
                setEquipment(responses[8]);
                setBatteries(responses[9]);
                setFiles(responses[10]);
                setChecklists(responses[11]);
                setTags(responses[12]);
                setUserProfile(responses[13]);

                // If the user is an admin, set the users state from the last API call
                if (userRole === 'admin') {
                    setUsers(responses[14]);
                }

            } catch (error) {
                console.error("Error fetching initial data:", error);
                displayMessage(`Failed to load system data: ${error.message}`, 'error');
                if (error.message.includes('Authentication required') || error.message.includes('Admin access required')) {
                    handleLogout();
                }
            }
        };

        fetchAllInitialData();

        const socket = io(WEBSOCKET_URL, {
            extraHeaders: {
                'X-Auth-Token': authToken // Pass token with WebSocket connection
            }
        });
        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            socket.emit('register_as_frontend');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });

        socket.on('drone_telemetry_update', data => {
            setLiveTelemetry(prev => ({ ...prev, [data.drone_id]: data.telemetry }));
            setDrones(prevDrones => prevDrones.map(d =>
                d.id === data.drone_id ? {
                    ...d,
                    battery: data.telemetry.battery_percent,
                    status: data.telemetry.status === "flying" ? 'Deployed' : (data.telemetry.status === "landed" ? 'Available' : d.status),
                    lastLocation: `Lat: ${data.telemetry.latitude?.toFixed(4)}, Lng: ${data.telemetry.longitude?.toFixed(4)}`,
                } : d
            ));
            setConnectedDrones(prev => [...new Set([...prev, data.drone_id])]);
        });

        socket.on('new_notification', notification => {
            setNotifications(prev => [notification, ...prev]);
            if (notification.message.includes("gateway connected")) {
                const droneIdMatch = notification.message.match(/Drone (d\d+)/);
                if (droneIdMatch) {
                    const droneId = droneIdMatch[1];
                    setConnectedDrones(prev => [...new Set([...prev, droneId])]);
                    setDrones(prevDrones => prevDrones.map(d => d.id === droneId ? { ...d, status: 'Deployed' } : d));
                }
            } else if (notification.message.includes("gateway disconnected")) {
                const droneIdMatch = notification.message.match(/Drone (d\d+)/);
                if (droneIdMatch) {
                    const droneId = droneIdMatch[1];
                    setConnectedDrones(prev => prev.filter(id => id !== droneId));
                    setDrones(prevDrones => prevDrones.map(d => d.id === droneId ? { ...d, status: 'Available' } : d));
                }
            } else if (notification.message.includes("mission") && notification.message.includes("completed")) {
                const missionNameMatch = notification.message.match(/'(.*?)' completed/);
                if (missionNameMatch) {
                    const missionName = missionNameMatch[1];
                    setMissions(prev => prev.map(m => m.name === missionName ? { ...m, status: 'Completed', progress: 100 } : m));
                }
            }
        });

        socket.on('new_media_available', media => {
            setMediaItems(prev => [media, ...prev]);
        });

        socket.on('notification_updated', updatedNotif => {
            setNotifications(prev => prev.map(n => n.id === updatedNotif.id ? updatedNotif : n));
        });

        socket.on('notification_deleted', deletedNotif => {
            setNotifications(prev => prev.filter(n => n.id !== deletedNotif.id));
        });

        // This is the new listener you added for real-time status updates
        socket.on('drone_status_updated', (updatedDrone) => {
            setDrones(prev => prev.map(d => d.id === updatedDrone.id ? updatedDrone : d));
            // Also update the connected drones list based on the new status
            if (updatedDrone.status === 'Online' || updatedDrone.status === 'Deployed') {
                setConnectedDrones(prev => [...new Set([...prev, updatedDrone.id])]);
            } else {
                setConnectedDrones(prev => prev.filter(id => id !== updatedDrone.id));
            }
        });

        return () => socket.disconnect();
    }, [isAuthenticated, authToken, displayMessage, authenticatedApiRequest]);


    // Check for existing token and attempt to authenticate on mount
    useEffect(() => {
        if (authToken && userRole) {
            // In a real app, you'd send the token to the backend to validate it
            // For this mock, presence of token is enough to be "authenticated"
            // You might want to add a /api/verify_token endpoint in your backend
            // and call it here.
            setIsAuthenticated(true);
            // navigate('/'); // No need to navigate here, the route handles it.
        } else {
            setIsAuthenticated(false);
            navigate('/auth');
        }
    }, []); // Run only once on mount


    // --- API HANDLER FUNCTIONS (Centralized in App.js) ---
    // These functions will be passed down as props to the respective components.

    const handleLoginSuccess = (token, user) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', user.role); // Store user role
        setAuthToken(token);
        setUserRole(user.role);
        setIsAuthenticated(true);
        navigate('/');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setAuthToken(null);
        setUserRole(null);
        setIsAuthenticated(false);
        navigate('/auth');
        displayMessage("Logged out successfully.", "info");
    };


    const handleAddItem = async (endpoint, data, stateSetter, itemName) => {
        try {
            const newItem = await authenticatedApiRequest(endpoint, 'POST', data);
            stateSetter(prev => [...prev, newItem]);
            displayMessage(`${itemName} added successfully!`, 'success');
            return true;
        } catch (error) {
            displayMessage(error.message, 'error');
            return false;
        }
    };

    const handleUpdateItem = async (endpoint, id, data, stateSetter, itemName) => {
        try {
            const updatedItem = await authenticatedApiRequest(`${endpoint}/${id}`, 'PUT', data);
            stateSetter(prev => prev.map(item => (item.id === id ? updatedItem : item)));
            displayMessage(`${itemName} updated successfully!`, 'success');
            return true;
        } catch (error) {
            displayMessage(error.message, 'error');
            return false;
        }
    };

    const handleDeleteItem = async (endpoint, id, stateSetter, itemName) => {
        try {
            await authenticatedApiRequest(`${endpoint}/${id}`, 'DELETE');
            stateSetter(prev => prev.filter(item => item.id !== id));
            displayMessage(`${itemName} deleted.`, 'success');
            return true;
        } catch (error) {
            displayMessage(error.message, 'error');
            return false;
        }
    };

    // --- Specific Handlers for each section ---

    // Drones
    const handleAddDrone = (data) => handleAddItem('/api/drones', data, setDrones, 'Drone');
    const handleUpdateDrone = (id, data) => handleUpdateItem('/api/drones', id, data, setDrones, 'Drone');
    const handleDeleteDrone = (id) => handleDeleteItem('/api/drones', id, setDrones, 'drone');

    // Ground Stations
    const handleAddGroundStation = (data) => handleAddItem('/api/ground_stations', data, setGroundStations, 'Ground Station');
    const handleUpdateGroundStation = (id, data) => handleUpdateItem('/api/ground_stations', id, data, setGroundStations, 'Ground Station');
    const handleDeleteGroundStation = (id) => handleDeleteItem('/api/ground_stations', id, setGroundStations, 'ground station');

    // Equipment
    const handleAddEquipment = (data) => handleAddItem('/api/equipment', data, setEquipment, 'Equipment');
    const handleUpdateEquipment = (id, data) => handleUpdateItem('/api/equipment', id, data, setEquipment, 'Equipment');
    const handleDeleteEquipment = (id) => handleDeleteItem('/api/equipment', id, setEquipment, 'equipment');

    // Batteries
    const handleAddBattery = (data) => handleAddItem('/api/batteries', data, setBatteries, 'Battery');
    const handleUpdateBattery = (id, data) => handleUpdateItem('/api/batteries', id, data, setBatteries, 'Battery');
    const handleDeleteBattery = (id) => handleDeleteItem('/api/batteries', id, setBatteries, 'battery');

    // Missions
    const handleAddMission = (data) => handleAddItem('/api/missions', data, setMissions, 'Mission');
    const handleUpdateMission = (id, data) => handleUpdateItem('/api/missions', id, data, setMissions, 'Mission');
    const handleDeleteMission = (id) => handleDeleteItem('/api/missions', id, setMissions, 'mission');

    // Media
    const handleAddMedia = (data) => handleAddItem('/api/media', data, setMediaItems, 'Media Item');
    const handleUpdateMedia = (id, data) => handleUpdateItem('/api/media', id, data, setMediaItems, 'Media Item');
    const handleDeleteMedia = (id) => handleDeleteItem('/api/media', id, setMediaItems, 'media item');

    // Files
    const handleAddFile = (data) => handleAddItem('/api/files', data, setFiles, 'File');
    const handleUpdateFile = (id, data) => handleUpdateItem('/api/files', id, data, setFiles, 'File');
    const handleDeleteFile = (id) => handleDeleteItem('/api/files', id, setFiles, 'file');

    // Checklists
    const handleAddChecklist = (data) => handleAddItem('/api/checklists', data, setChecklists, 'Checklist');
    const handleUpdateChecklist = (id, data) => handleUpdateItem('/api/checklists', id, data, setChecklists, 'Checklist');
    const handleDeleteChecklist = (id) => handleDeleteItem('/api/checklists', id, setChecklists, 'checklist');

    // Tags
    const handleAddTag = (data) => handleAddItem('/api/tags', data, setTags, 'Tag');
    const handleUpdateTag = (id, data) => handleUpdateItem('/api/tags', id, data, setTags, 'Tag');
    const handleDeleteTag = (id) => handleDeleteItem('/api/tags', id, setTags, 'tag');

    // Incidents
    const handleAddIncident = (data) => handleAddItem('/api/incidents', data, setIncidents, 'Incident');
    const handleUpdateIncident = (id, data) => handleUpdateItem('/api/incidents', id, data, setIncidents, 'Incident');
    const handleDeleteIncident = (id) => handleDeleteItem('/api/incidents', id, setIncidents, 'incident');

    // Maintenance Parts
    const handleAddMaintenancePart = (data) => handleAddItem('/api/maintenance_parts', data, setMaintenanceParts, 'Maintenance Part');
    const handleUpdateMaintenancePart = (id, data) => handleUpdateItem('/api/maintenance_parts', id, data, setMaintenanceParts, 'Maintenance Part');
    const handleDeleteMaintenancePart = (id) => handleDeleteItem('/api/maintenance_parts', id, setMaintenanceParts, 'maintenance part');

    // User Profile
    const handleUpdateUserProfile = async (data) => {
        try {
            const updatedProfile = await authenticatedApiRequest('/api/user/profile', 'PUT', data);
            setUserProfile(updatedProfile);
            displayMessage("Profile updated successfully!", 'success');
            return true;
        } catch (error) {
            displayMessage(`Failed to update profile: ${error.message}`, 'error');
            return false;
        }
    };

    const handleChangePassword = async (currentPassword, newPassword, confirmNewPassword) => {
        if (newPassword !== confirmNewPassword) {
            displayMessage("New password and confirmation do not match.", 'error');
            return false;
        }
        if (newPassword.length < 6) {
            displayMessage("Password must be at least 6 characters long.", 'error');
            return false;
        }
        try {
            await authenticatedApiRequest('/api/user/change_password', 'POST', { current_password: currentPassword, new_password: newPassword });
            displayMessage("Password changed successfully!", 'success');
            return true;
        } catch (error) {
            displayMessage(`Failed to change password: ${error.message}`, 'error');
            return false;
        }
    };

    const handleUpdateProfilePicture = async (newProfilePictureUrl) => {
        if (newProfilePictureUrl.trim() === '') {
            displayMessage("Please enter a valid image URL.", 'error');
            return false;
        }
        try {
            const updatedProfile = await authenticatedApiRequest('/api/user/profile_picture', 'POST', { profile_picture_url: newProfilePictureUrl });
            setUserProfile(updatedProfile);
            displayMessage("Profile picture updated!", 'success');
            return true;
        } catch (error) {
            displayMessage(`Failed to update picture: ${error.message}`, 'error');
            return false;
        }
    };


    // Commands for Live Operations
    const sendDroneCommand = async (droneId, command, params = {}) => {
        try {
            await authenticatedApiRequest(`/api/command_drone/${droneId}`, 'POST', { command, params });
            displayMessage(`Command '${command}' sent to drone ${droneId}.`, 'success');
        } catch (error) {
            displayMessage(`Error sending command: ${error.message}`, 'error');
        }
    };


    // --- RENDER ---
    return (
        <div className="flex min-h-screen bg-gray-100">
            {isAuthenticated ? (
                <>
                    <Sidebar onLogout={handleLogout} userRole={userRole} /> {/* Pass userRole to Sidebar */}
                    <div className="flex-1 flex flex-col">
                        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                            <h1 className="text-xl font-semibold">Drone Operations Dashboard</h1>
                            {message && <div className={`px-4 py-2 rounded text-white text-sm ${messageType === 'success' ? 'bg-green-500' : messageType === 'error' ?
                                'bg-red-500' : 'bg-blue-500'}`}>{message}</div>}
                        </header>
                        <main className="flex-1 p-6 overflow-y-auto">
                            <Routes>
                                {/* Operations */}
                                <Route path="/" element={<Dashboard drones={drones} missions={missions} incidents={incidents} mediaItems={mediaItems} maintenanceParts={maintenanceParts} />} />
                                <Route path="/live-operations" element={<LiveOperations drones={drones} connectedDrones={connectedDrones} liveTelemetry={liveTelemetry} sendDroneCommand={sendDroneCommand} displayMessage={displayMessage} />} />
                                <Route path="/missions" element={<Missions missions={missions} drones={drones} handleAddMission={handleAddMission} handleDeleteMission={handleDeleteMission} displayMessage={displayMessage} />} />

                                {/* Assets */}
                                <Route 
                                    path="/assets/drones" 
                                    element={<Drones
                                        drones={drones}
                                        handleAddDrone={handleAddDrone}
                                        handleUpdateDrone={handleUpdateDrone}
                                        handleDeleteDrone={handleDeleteDrone}
                                        handleUpdateDroneStatus={handleUpdateDroneStatus} // This is the new prop you added
                                        displayMessage={displayMessage}
                                    />} 
                                />
                                <Route path="/assets/ground-stations" element={<GroundStations
                                    groundStations={groundStations}
                                    handleAddGS={handleAddGroundStation}
                                    handleUpdateGS={handleUpdateGroundStation}
                                    handleDeleteGS={handleDeleteGroundStation}
                                    displayMessage={displayMessage}
                                />} />
                                <Route path="/assets/equipment" element={<Equipment
                                    equipment={equipment}
                                    handleAddEquipment={handleAddEquipment}
                                    handleUpdateEquipment={handleUpdateEquipment}
                                    handleDeleteEquipment={handleDeleteEquipment}
                                    displayMessage={displayMessage}
                                />} />
                                <Route path="/assets/batteries" element={<Batteries
                                    batteries={batteries}
                                    handleAddBattery={handleAddBattery}
                                    handleUpdateBattery={handleUpdateBattery}
                                    handleDeleteBattery={handleDeleteBattery}
                                    displayMessage={displayMessage}
                                />} />

                                {/* Library */}
                                <Route path="/library/media" element={<Media
                                    mediaItems={mediaItems}
                                    setMediaItems={setMediaItems}
                                    handleAddMedia={handleAddMedia}
                                    handleUpdateMedia={handleUpdateMedia}
                                    handleDeleteMedia={handleDeleteMedia}
                                    displayMessage={displayMessage}
                                />} />
                                <Route path="/library/files" element={<Files
                                    files={files}
                                    setFiles={setFiles}
                                    handleAddFile={handleAddFile}
                                    handleUpdateFile={handleUpdateFile}
                                    handleDeleteFile={handleDeleteFile}
                                    displayMessage={displayMessage}
                                />} />
                                <Route path="/library/checklists" element={<Checklists
                                    checklists={checklists}
                                    setChecklists={setChecklists}
                                    handleAddChecklist={handleAddChecklist}
                                    handleUpdateChecklist={handleUpdateChecklist}
                                    handleDeleteChecklist={handleDeleteChecklist}
                                    displayMessage={displayMessage}
                                />} />
                                <Route path="/library/tags" element={<Tags
                                    tags={tags}
                                    setTags={setTags}
                                    handleAddTag={handleAddTag}
                                    handleUpdateTag={handleUpdateTag}
                                    handleDeleteTag={handleDeleteTag}
                                    displayMessage={displayMessage}
                                />} />

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
                                <Route path="/manage/maintenance" element={<MaintenanceSection
                                    maintenanceParts={maintenanceParts}
                                    setMaintenanceParts={setMaintenanceParts}
                                    displayMessage={displayMessage}
                                />} />
                                <Route path="/manage/profile-settings" element={<ProfileSettings
                                    user={userProfile}
                                    setUser={setUserProfile}
                                    displayMessage={displayMessage}
                                    handleUpdateUserProfile={handleUpdateUserProfile}
                                    handleChangePassword={handleChangePassword}
                                    handleUpdateProfilePicture={handleUpdateProfilePicture}
                                />} />

                                <Route path="/notifications" element={<NotificationsPage
                                    notifications={notifications}
                                    setNotifications={setNotifications}
                                    displayMessage={displayMessage}
                                />} />

                              {userRole === 'admin' && (
                                <Route
                                    path="/admin-panel"
                                    element={
                                        <AdminPanelContent
                                            displayMessage={displayMessage}
                                            authToken={authToken}
                                            // Pass down all necessary data and their CRUD handlers
                                            users={users} // Pass the 'users' state directly from App.js
                                            handleAddUser={(userData) => handleAddItem('/api/admin/users', userData, setUsers, 'User')} // Use setUsers directly
                                            handleUpdateUser={(id, data) => handleUpdateItem('/api/admin/users', id, data, setUsers, 'User')} // Use setUsers directly
                                            handleDeleteUser={(id) => handleDeleteItem('/api/admin/users', id, setUsers, 'user')} // Use setUsers directly

                                            drones={drones} handleAddDrone={handleAddDrone} handleUpdateDrone={handleUpdateDrone} handleDeleteDrone={handleDeleteDrone}
                                            groundStations={groundStations} handleAddGroundStation={handleAddGroundStation} handleUpdateGroundStation={handleUpdateGroundStation} handleDeleteGroundStation={handleDeleteGroundStation}
                                            equipment={equipment} handleAddEquipment={handleAddEquipment} handleUpdateEquipment={handleUpdateEquipment} handleDeleteEquipment={handleDeleteEquipment}
                                            batteries={batteries} handleAddBattery={handleAddBattery} handleUpdateBattery={handleUpdateBattery} handleDeleteBattery={handleDeleteBattery}
                                            missions={missions} handleAddMission={handleAddMission} handleDeleteMission={handleDeleteMission}
                                            mediaItems={mediaItems} setMediaItems={setMediaItems} handleAddMedia={handleAddMedia} handleUpdateMedia={handleUpdateMedia} handleDeleteMedia={handleDeleteMedia}
                                            files={files} setFiles={setFiles} handleAddFile={handleAddFile} handleDeleteFile={handleDeleteFile}
                                            checklists={checklists} setChecklists={setChecklists} handleAddChecklist={handleAddChecklist} handleUpdateChecklist={handleUpdateChecklist} handleDeleteChecklist={handleDeleteChecklist}
                                            tags={tags} setTags={setTags} handleAddTag={handleAddTag} handleUpdateTag={handleUpdateTag} handleDeleteTag={handleDeleteTag}
                                            incidents={incidents} handleAddIncident={handleAddIncident} handleUpdateIncident={handleUpdateIncident} handleDeleteIncident={handleDeleteIncident}
                                            maintenanceParts={maintenanceParts} setMaintenanceParts={setMaintenanceParts} handleAddMaintenancePart={handleAddMaintenancePart} handleUpdateMaintenancePart={handleUpdateMaintenancePart} handleDeleteMaintenancePart={handleDeleteMaintenancePart}
                                        />
                                    }
                                />
                            )}

                                <Route path="*" element={<Dashboard drones={drones} incidents={incidents} mediaItems={mediaItems} missions={missions} maintenanceParts={maintenanceParts} />} />
                            </Routes>
                        </main>

                    </div>
                </>
            ) : (
                <Routes><Route path="*" element={<AuthPage onLoginSuccess={handleLoginSuccess} displayMessage={displayMessage} />} /></Routes>
            )}
        </div>
    );
};

export default App;