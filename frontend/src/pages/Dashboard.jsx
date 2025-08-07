import { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-4">Dashboard</h1>
        {user ? (
          <div className="text-center">
            <p className="text-lg font-medium">Welcome, <span className="text-blue-600">{user.name}</span></p>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
        ) : (
          <p className="text-center text-gray-600">Loading user info...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
