import { useEffect, useState } from "react";

// Base URL configuration (uses environment variable for deployment or defaults to localhost)
const BASE_API_URL = http://my-first-app-env.eba-umrgj6yz.eu-north-1.elasticbeanstalk.com;


// The main API endpoint we are using for CRUD operations
const USERS_ENDPOINT = `${BASE_API_URL}/api/users`;


const UserForm = ({ user, setUser, onSubmit, title, buttonText, onCancel }) => (
    <form onSubmit={onSubmit} className="p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h3 className="text-xl font-bold text-indigo-700 mb-6 border-b pb-2">{title}</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            type="text"
            placeholder="e.g. JaneDoe"
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            id="phone"
            type="text"
            placeholder="e.g. 555-0123"
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition"
            value={user.phone}
            onChange={(e) => setUser({ ...user, phone: e.target.value })}
            required
          />
        </div>
      </div>
      <button 
        type="submit"
        className="mt-8 w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.01]"
      >
        {buttonText}
      </button>
      {onCancel && (
        <button 
            type="button"
            onClick={onCancel}
            className="mt-3 w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150 ease-in-out"
        >
            Cancel
        </button>
      )}
    </form>
  );


function App() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ username: "", phone: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function for API calls with error handling
  const apiCall = async (url, options) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(url, options);
      
      // Handle successful delete (204 No Content)
      if (response.status === 204) return null; 
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON content. Check if the API route is correct or if the server is returning a 404/500 HTML page.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }
      return data;
    } catch (e) {
      console.error("API Error:", e);
      setError(`Connection failed. Make sure Flask server is running on ${BASE_API_URL}. Details: ${e.message}.`);
      return null;
    } finally {
        setIsLoading(false);
    }
  };

  // READ Operation: Fetch all users
  const fetchUsers = async () => {
    const data = await apiCall(USERS_ENDPOINT, { method: 'GET' });
    if (data) {
      setUsers(data);
    }
  };

  // CREATE Operation: Add a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.phone) {
      setError("Username and Phone are required.");
      return;
    }

    const data = await apiCall(USERS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    if (data) {
      setNewUser({ username: "", phone: "" }); // Clear form
      setIsCreating(false);
      fetchUsers(); // Refresh list
    }
  };

  // UPDATE Operation: Submit edited user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.username || !editingUser.phone) {
      setError("Username and Phone are required.");
      return;
    }

    const url = `${USERS_ENDPOINT}/${editingUser.id}`;
    const data = await apiCall(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: editingUser.username, phone: editingUser.phone }),
    });

    if (data) {
      setEditingUser(null); // Close modal
      fetchUsers(); // Refresh list
    }
  };

  // DELETE Operation: Delete user by ID
  const handleDeleteUser = async (userId) => {
    // Note: window.confirm is used here, but a custom modal is preferred in production apps
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    const url = `${USERS_ENDPOINT}/${userId}`;
    const result = await apiCall(url, { method: 'DELETE' });

    if (result === null) {
        fetchUsers(); // Refresh list
    }
  };

  // Initial fetch on component mount and periodic refresh
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    // CHECK: Added font-inter class to ensure font is used if available.
    <div className="p-4 sm:p-10 min-h-screen bg-gray-100 font-inter font-sans"> 
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">User Management Dashboard</h1>
            
        </header>
        
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
            <p className="font-semibold text-base">API Connection Error:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        
        {/* Create User Button/Form */}
        <div className="mb-8 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">Current Users ({users.length})</h2>
            <button
                onClick={() => { setIsCreating(true); setEditingUser(null); }}
                className={`py-3 px-6 rounded-xl shadow-lg font-semibold text-white transition duration-200 flex items-center space-x-2 ${
                    isCreating 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
                }`}
                disabled={isCreating}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add New User</span>
            </button>
        </div>

        {/* Create User Form Modal (Inline) */}
        {isCreating && (
            <div className="mb-8 p-6 bg-white border border-green-300 rounded-xl shadow-2xl transition-all duration-300 ease-in-out transform scale-95 opacity-100">
                <UserForm
                    user={newUser}
                    setUser={setNewUser}
                    onSubmit={handleAddUser}
                    title="Create New User"
                    buttonText="Create User"
                    onCancel={() => { setIsCreating(false); setNewUser({ username: "", phone: "" }); }}
                />
            </div>
        )}

        {/* User List */}
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
            {isLoading && users.length === 0 ? (
                 <div className="p-6 text-center text-gray-500">Loading users...</div>
            ) : users.length === 0 ? (
                 <div className="p-6 text-center text-blue-700 bg-blue-50">No users found. Click "Add New User" to get started.</div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Phone Number</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                        <tr key={user.id} className="hover:bg-indigo-50/50 transition duration-150 ease-in-out">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.username}
                                <p className="text-gray-500 text-xs sm:hidden mt-0.5">{user.phone}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">{user.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                <button
                                    onClick={() => { setEditingUser(user); setIsCreating(false); }}
                                    className="text-indigo-600 hover:text-indigo-900 font-semibold p-2 rounded-lg hover:bg-indigo-100 transition duration-150"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-900 font-semibold p-2 rounded-lg hover:bg-red-100 transition duration-150"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {/* Edit Modal / Form */}
        {editingUser && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity duration-300">
                <div className="w-full max-w-md transition-all duration-300 transform scale-100">
                    <UserForm
                        user={editingUser}
                        setUser={setEditingUser}
                        onSubmit={handleUpdateUser}
                        title={`Edit User: ${editingUser.username}`}
                        buttonText="Save Changes"
                        onCancel={() => setEditingUser(null)}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;
