    // // src/pages/admin/AdminPanel.js
    // import React, { useState, useEffect } from 'react';
    // import {
    // User, PlusCircle, Edit, Trash2, XCircle, Check, Key, Mail, UserCircle,
    // Activity, Clock, Rocket, Upload, AlertCircle, Info
    // } from 'lucide-react';

    // // API_BASE_URL and apiRequest helper are assumed to be available
    // // or passed down. For a standalone component, we might re-define or import them.
    // // For simplicity in this example, we'll include a local apiRequest.
    // // In a larger app, you'd have a centralized API utility.

    // const API_BASE_URL = 'http://localhost:5000';

    // const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
    //     const options = {
    //         method,
    //         headers: {
    //             'Content-Type': 'application/json',
    //             ...(token && { 'X-Auth-Token': token }) // Add auth token if provided
    //         }
    //     };
    //     if (body) options.body = JSON.stringify(body);

    //     const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    //     if (!response.ok) {
    //         const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
    //         throw new Error(errorData.error || `HTTP error: ${response.status}`);
    //     }
    //     if (response.status === 204) return null;
    //     return response.json();
    // };


    // const AdminPanel = ({ displayMessage, authToken }) => {
    // const [users, setUsers] = useState([]);
    // const [showAddModal, setShowAddModal] = useState(false);
    // const [showEditModal, setShowEditModal] = useState(false);
    // const [currentUser, setCurrentUser] = useState(null); // For add/edit form
    // const [confirmingDeleteUser, setConfirmingDeleteUser] = useState(null);

    // const fetchUsers = async () => {
    //     try {
    //     // Ensure the token is passed for admin API calls
    //     const data = await apiRequest('/api/admin/users', 'GET', null, authToken);
    //     setUsers(data);
    //     } catch (error) {
    //     displayMessage(`Failed to fetch users: ${error.message}`, 'error');
    //     }
    // };

    // useEffect(() => {
    //     // Fetch users when the component mounts or authToken changes
    //     if (authToken) {
    //     fetchUsers();
    //     }
    // }, [authToken]); // Dependency array: re-run if authToken changes

    // const handleAddUser = async (userData) => {
    //     try {
    //     const newUser = await apiRequest('/api/admin/users', 'POST', userData, authToken);
    //     setUsers(prev => [...prev, newUser]); // Add new user to local state
    //     displayMessage("User added successfully!", 'success');
    //     setShowAddModal(false); // Close modal on success
    //     } catch (error) {
    //     displayMessage(`Failed to add user: ${error.message}`, 'error');
    //     }
    // };

    // const handleUpdateUser = async (userId, userData) => {
    //     try {
    //     const updatedUser = await apiRequest(`/api/admin/users/${userId}`, 'PUT', userData, authToken);
    //     setUsers(prev => prev.map(user => (user.id === userId ? updatedUser : user))); // Update user in local state
    //     displayMessage("User updated successfully!", 'success');
    //     setShowEditModal(false); // Close modal on success
    //     setCurrentUser(null); // Clear editing user
    //     } catch (error) {
    //     displayMessage(`Failed to update user: ${error.message}`, 'error');
    //     }
    // };

    // const handleDeleteUser = async (userId) => {
    //     try {
    //     await apiRequest(`/api/admin/users/${userId}`, 'DELETE', null, authToken);
    //     setUsers(prev => prev.filter(user => user.id !== userId)); // Remove user from local state
    //     displayMessage("User deleted successfully!", 'info');
    //     setConfirmingDeleteUser(null); // Clear confirmation state
    //     } catch (error) {
    //     displayMessage(`Failed to delete user: ${error.message}`, 'error');
    //     }
    // };

    // // UI handlers for modals and confirmations
    // const openAddUserModal = () => {
    //     // Reset form data for new user
    //     setCurrentUser({ username: '', password: '', name: '', email: '', role: 'user', profilePicture: '', totalFlights: 0, totalFlightTime: "0h", averageFlightTime: "0h" });
    //     setShowAddModal(true);
    // };

    // const openEditUserModal = (user) => {
    //     setCurrentUser(user); // Set data for editing
    //     setShowEditModal(true);
    // };

    // const confirmDeleteUser = (user) => {
    //     setConfirmingDeleteUser(user); // Set user for confirmation
    // };

    // return (
    //     <div className="p-6 bg-gray-50 rounded-xl shadow-lg min-h-[calc(100vh-120px)] flex flex-col">
    //     <div className="flex justify-between items-center mb-6">
    //         <h2 className="text-3xl font-bold text-gray-800">Admin Panel - User Management</h2>
    //         <button onClick={openAddUserModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
    //         <PlusCircle className="w-5 h-5 mr-2" /> Add New User
    //         </button>
    //     </div>

    //     {/* User List Table */}
    //     {users.length === 0 ? (
    //         <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md p-8">
    //         <p className="text-gray-500 text-lg">No users found.</p>
    //         </div>
    //     ) : (
    //         <div className="bg-white rounded-xl shadow-md p-6 flex-1 overflow-x-auto">
    //         <table className="min-w-full divide-y divide-gray-200">
    //             <thead className="bg-gray-50">
    //             <tr>
    //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
    //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
    //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
    //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
    //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
    //                 <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
    //             </tr>
    //             </thead>
    //             <tbody className="bg-white divide-y divide-gray-200">
    //             {users.map(user => (
    //                 <tr key={user.id}>
    //                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
    //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
    //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
    //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
    //                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
    //                     {user.role}
    //                     </span>
    //                 </td>
    //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">{user.id}</td>
    //                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    //                     <button onClick={() => openEditUserModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
    //                     <button onClick={() => confirmDeleteUser(user)} className="text-red-600 hover:text-red-900">Delete</button>
    //                 </td>
    //                 </tr>
    //             ))}
    //             </tbody>
    //         </table>
    //         </div>
    //     )}

    //     {/* Add User Modal (uses UserForm) */}
    //     {showAddModal && (
    //         <UserForm
    //         title="Add New User"
    //         initialData={currentUser} // Pass initialData (empty for new user)
    //         onSave={handleAddUser} // Pass handler for saving new user
    //         onCancel={() => setShowAddModal(false)}
    //         />
    //     )}

    //     {/* Edit User Modal (uses UserForm) */}
    //     {showEditModal && currentUser && (
    //         <UserForm
    //         title="Edit User"
    //         initialData={currentUser} // Pass current user data for editing
    //         onSave={(updatedData) => handleUpdateUser(currentUser.id, updatedData)} // Pass handler for updating
    //         onCancel={() => setShowEditModal(false)}
    //         />
    //     )}

    //     {/* Delete Confirmation Modal */}
    //     {confirmingDeleteUser && (
    //         <ConfirmationModal
    //         message={`Are you sure you want to delete user "${confirmingDeleteUser.username}"? This action cannot be undone.`}
    //         onConfirm={() => handleDeleteUser(confirmingDeleteUser.id)}
    //         onCancel={() => setConfirmingDeleteUser(null)}
    //         />
    //     )}
    //     </div>
    // );
    // };

    // // User Form for Add/Edit (Generic modal form for user data)
    // const UserForm = ({ title, initialData, onSave, onCancel }) => {
    // const [formData, setFormData] = useState(initialData || {
    //     username: '', password: '', name: '', email: '', role: 'user', profilePicture: '',
    //     totalFlights: 0, totalFlightTime: "0h", averageFlightTime: "0h"
    // });

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData(prev => ({ ...prev, [name]: value }));
    // };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     onSave(formData); // Call the onSave prop with the form data
    // };

    // return (
    //     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    //     <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
    //         <h3 className="text-xl font-bold mb-4">{title}</h3>
    //         <form onSubmit={handleSubmit} className="space-y-4">
    //         <div>
    //             <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
    //             <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" required />
    //         </div>
    //         {/* Password field only shown when adding a new user */}
    //         {title === "Add New User" && (
    //             <div>
    //             <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
    //             <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" required />
    //             </div>
    //         )}
    //         <div>
    //             <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
    //             <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" required />
    //         </div>
    //         <div>
    //             <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
    //             <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
    //         </div>
    //         <div>
    //             <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
    //             <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full p-2 border rounded">
    //             <option value="user">User</option>
    //             <option value="admin">Admin</option>
    //             </select>
    //         </div>
    //         <div>
    //             <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
    //             <input type="url" id="profilePicture" name="profilePicture" value={formData.profilePicture} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" placeholder="https://placehold.co/150x150" />
    //         </div>
    //         <div className="flex justify-end gap-4 mt-6">
    //             <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
    //             <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
    //         </div>
    //         </form>
    //     </div>
    //     </div>
    // );
    // };

    // export default AdminPanel; // Export the component