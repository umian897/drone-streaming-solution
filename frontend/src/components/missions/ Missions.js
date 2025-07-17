// frontend/src/components/missions/Missions.js
import React from 'react';
import { PlusCircle } from 'lucide-react'; // For the mission creation cards

function Missions() {
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
}
export default Missions;