// src/pages/GroupsPage.jsx
import { useEffect, useState } from 'react';
import { getUserGroups } from '../api/groupApi';
import GroupCard from '../components/GroupCard';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getUserGroups();
        setGroups(data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch groups');
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Your Groups</h1>
      {groups.length === 0 ? (
        <p className="text-gray-600">You are not part of any groups yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
