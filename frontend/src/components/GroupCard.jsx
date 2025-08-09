// src/components/GroupCard.jsx
import { Link } from 'react-router-dom';

export default function GroupCard({ group }) {
  return (
    <div className="bg-white p-4 shadow rounded border border-gray-200">
      <h2 className="text-xl font-semibold">{group.name}</h2>
      <p className="text-gray-600 mb-2">{group.description}</p>
      <p className="text-sm text-gray-500">Created by: {group.createdBy?.name}</p>
      <Link
        to={`/groups/${group._id}`}
        className="text-blue-600 hover:underline text-sm"
      >
        View Details
      </Link>
    </div>
  );
}
