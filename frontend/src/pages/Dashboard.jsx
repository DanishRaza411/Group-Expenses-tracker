import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/user');
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Dashboard</h1>

        {user ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">
              Welcome, <span className="text-blue-600">{user.name}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading user info...</p>
        )}

        <div className="grid grid-cols-1 gap-4 mt-6">
          <Link
            to="/groups"
            className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View My Groups
          </Link>
          <Link
            to="/groups/create"
            className="block w-full text-center bg-white border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            Create New Group
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
