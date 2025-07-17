// frontend/src/components/layout/Dashboard.js
import React from 'react';
// Importing icons for dashboard cards
import { MoreVertical, Trash2, UserCircle, MapPin, Activity, Clock, Image, Wrench, Rocket, AlertCircle } from 'lucide-react'; 

// --- Reusable Card Widget Component ---
// This component provides a consistent visual style for all dashboard cards.
// It includes a title, content area (children), and optional action buttons (More Options, Delete).
const CardWidget = ({ title, children, onDelete, onMoreOptions }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex space-x-2">
          {/* More Options Button (optional) */}
          {onMoreOptions && (
            <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          )}
          {/* Delete Button (optional, as per your screenshot) */}
          {onDelete && (
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1"> {/* This div holds the content specific to each card */}
        {children}
      </div>
    </div>
  );
};

function Dashboard() {
  // Placeholder data for "Recent Media" card, mimicking your screenshot.
  const recentMedia = [
    { id: 1, type: 'video', thumbnail: 'https://placehold.co/100x60/a78bfa/ffffff?text=Video1', title: 'Mission Alpha Capture' },
    { id: 2, type: 'image', thumbnail: 'https://placehold.co/100x60/818cf8/ffffff?text=Image1', title: 'Inspection Photo 1' },
    { id: 3, type: 'video', thumbnail: 'https://placehold.co/100x60/6366f1/ffffff?text=Video2', title: 'Evening Flight' },
  ];

  // Placeholder data for "Incidents" card.
  const incidents = [
    { id: 1, type: 'warning', description: 'Drone Battery Low', time: '10:30 AM' },
    { id: 2, type: 'alert', description: 'Unexpected Wind Gust', time: '09:15 AM' },
  ];

  // Function to handle the click of the delete icon on any card.
  // Currently, it shows an alert. In a real application, it would remove data or the card itself.
  const handleCardDelete = (cardName) => {
    alert(`Delete icon clicked for ${cardName} card.`);
    // Here you would implement logic to remove the card or its associated data.
    // For example, if cards were stored in a state, you'd update that state.
  };

  return (
    // Tailwind CSS grid layout for the dashboard cards, responsive across different screen sizes.
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* User Profile Card - Designed to match your screenshot */}
      <CardWidget title="User Profile" onDelete={() => handleCardDelete('User Profile')}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <UserCircle className="w-20 h-20 text-gray-400 mb-4" /> {/* Large user icon */}
          <h4 className="text-xl font-bold text-gray-800">m osman</h4> {/* User's name */}
          <div className="mt-4 text-gray-600 text-sm space-y-2">
            <p className="flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-500" /> Total flight time: -</p>
            <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-indigo-500" /> Average flight time: -</p>
            <p className="flex items-center"><Rocket className="w-4 h-4 mr-2 text-purple-500" /> Number of flights: -</p>
          </div>
          <button className="mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm">Open profile</button>
        </div>
      </CardWidget>

      {/* Live Airspace Card - Designed to match your screenshot */}
      <CardWidget title="Live Airspace" onDelete={() => handleCardDelete('Live Airspace')}>
        <div className="flex flex-col items-center justify-center h-full bg-gray-200 rounded-lg">
          <MapPin className="w-16 h-16 text-gray-500 mb-4" /> {/* Map icon */}
          <p className="text-gray-600">Live drone tracking map will appear here.</p>
          <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">View all</button>
        </div>
      </CardWidget>

      {/* Incidents Card - Designed to match your screenshot */}
      <CardWidget title="Incidents" onDelete={() => handleCardDelete('Incidents')}>
        <ul className="space-y-3">
          {incidents.length > 0 ? (
            incidents.map(incident => (
              <li key={incident.id} className="flex items-center p-2 bg-red-50 rounded-md text-sm text-red-800">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> {/* Alert icon */}
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

      {/* Recent Media Card - Designed to match your screenshot */}
      <CardWidget title="Recent media" onDelete={() => handleCardDelete('Recent Media')}>
        <div className="grid grid-cols-2 gap-4">
          {recentMedia.length > 0 ? (
            recentMedia.map(media => (
              <div key={media.id} className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <img src={media.thumbnail} alt={media.title} className="w-full h-24 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Image className="w-8 h-8 text-white" /> {/* Image icon overlay */}
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

      {/* Maintenance Card - Designed to match your screenshot */}
      <CardWidget title="Maintenance" onDelete={() => handleCardDelete('Maintenance')}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Wrench className="w-16 h-16 text-gray-400 mb-4" /> {/* Wrench icon */}
          <p className="text-gray-600">Upcoming maintenance schedules and logs will be displayed here.</p>
          <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">View all</button>
        </div>
      </CardWidget>
    </div>
  );
}

export default Dashboard;