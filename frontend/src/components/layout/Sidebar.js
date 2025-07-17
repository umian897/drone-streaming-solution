
// frontend/src/components/layout/Sidebar.js
import React, { useState } from 'react';
// Link and useLocation are from React Router for navigation and active link highlighting.
import { Link, useLocation } from 'react-router-dom';
// Importing various icons from lucide-react for the sidebar menu items.

import {
  LayoutDashboard, Video, Rocket, Package, Drone, HardDrive, BatteryCharging,
  Book, FileText, CheckSquare, Tag, Settings, AlertCircle, Wrench, Bell, UserCircle,
  LogOut, ChevronDown, ChevronUp, PlusCircle
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const location = useLocation(); // Hook to get the current URL path. Used to highlight active links.
  const [openDropdown, setOpenDropdown] = useState(null); // State to manage which dropdown menu is currently open.

  // Function to toggle the visibility of a dropdown menu.
  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName); // Closes if already open, opens if closed.
  };

  // Helper function to check if a specific navigation link is active (matches current URL path).
  const isActive = (path) => location.pathname === path;
  // Helper function to check if a dropdown menu or any of its sub-items are active.
  // It checks if the current path starts with any of the paths provided for the dropdown.
  const isDropdownActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col min-h-screen shadow-lg">
      {/* User Profile Header in Sidebar */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <UserCircle className="w-10 h-10 text-blue-300 mr-3" /> {/* User icon */}
        <span className="text-lg font-semibold">m osman</span> {/* User's name */}
      </div>

      {/* "Create Mission" Button */}
      <div className="p-4 border-b border-gray-700">
        <button className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition duration-150 transform hover:scale-105 shadow-md">
          <PlusCircle className="w-5 h-5 mr-2" /> Create mission
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {/* Dashboard Link */}
        <Link to="/" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </Link>

        {/* Live Operations Link */}
        <Link to="/live-operations" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/live-operations') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <Video className="w-5 h-5 mr-3" />
          Live Operations
        </Link>

        {/* Missions Link */}
        <Link to="/missions" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/missions') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <Rocket className="w-5 h-5 mr-3" />
          Missions
        </Link>

        {/* Assets Dropdown Menu */}
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
                < Wrench className="w-4 h-4 mr-2" /> Equipment
              </Link>
              <Link to="/assets/batteries" className={`flex items-center p-2 rounded-md text-sm transition duration-150 ${isActive('/assets/batteries') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <BatteryCharging className="w-4 h-4 mr-2" /> Batteries
              </Link>
            </div>
          )}
        </div>

        {/* Library Dropdown Menu */}
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

        {/* Manage Dropdown Menu */}
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
              {/* Add other manage sub-items here if needed */}
            </div>
          )}
        </div>

        {/* Account Link (maps to Profile Settings under Manage) */}
        <Link to="/manage/profile-settings" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/manage/profile-settings') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <UserCircle className="w-5 h-5 mr-3" />
          Account
        </Link>
        
        {/* Notifications Link (maps to Notification Preferences under Manage) */}
        <Link to="/manage/notification-preferences" className={`flex items-center p-3 rounded-md text-sm font-medium transition duration-150 ${isActive('/manage/notification-preferences') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
          <Bell className="w-5 h-5 mr-3" />
          Notifications
        </Link>

      </nav>

      {/* Collapse Sidebar (Placeholder) */}
      <div className="p-4 border-t border-gray-700 mt-auto"> {/* mt-auto pushes it to the bottom */}
        <button className="w-full flex items-center justify-center py-2 px-4 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md text-sm font-medium transition duration-150">
          Collapse sidebar
        </button>
      </div>

      {/* Logout Button */}
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

export default Sidebar;