  import { useEffect, useState } from 'react';
  import { useParams } from 'react-router-dom';
  import api from '../services/api';
  import axios from 'axios';
  import { toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import ExpenseCard from '../components/ExpenseCard';

  // You need to call toast.configure() in your App root if not already
  // toast.configure();

  function GroupDetails() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [editName, setEditName] = useState('');
    const [editing, setEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
      axios
        .get('/api/auth/user', { withCredentials: true })
        .then(res => setCurrentUser(res.data.user))
        .catch(() => setCurrentUser(null));
    }, []);

    const isAdmin =
      currentUser &&
      group?.members?.some(
        member =>
          member?.user?._id?.toString() === currentUser?.id?.toString() &&
          member?.role === 'admin'
      );

    useEffect(() => {
      const fetchGroup = async () => {
        try {
          const res = await api.get(`/groups/${id}`);
          setGroup(res.data.group);
          setEditName(res.data.group.name);
        } catch (err) {
          console.error(err);
          toast.error('Failed to load group details.');
        } finally {
          setLoading(false);
        }
      };

      fetchGroup();
    }, [id]);

    const handleAddMember = async () => {
      if (!group || !group._id) {
        toast.error('Group data is not ready yet.');
        return;
      }
      if (!newMemberEmail.trim()) {
        toast.warn('Please enter a valid email.');
        return;
      }

      setActionLoading(true);
      try {
        await api.post(`/groups/${group._id}/members`, {
          email: newMemberEmail
        });

        const res = await api.get(`/groups/${group._id}`);
        setGroup(res.data.group);
        setNewMemberEmail('');
        toast.success('Member added successfully!');
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to add member.');
      } finally {
        setActionLoading(false);
      }
    };

    const handleRemoveMember = async (memberId) => {
      setActionLoading(true);
      try {
        await api.delete(`/groups/${id}/members/${memberId}`);
        const res = await api.get(`/groups/${id}`);
        setGroup(res.data.group);
        toast.success('Member removed successfully!');
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to remove member.');
      } finally {
        setActionLoading(false);
      }
    };

    const handleUpdateGroupName = async () => {
      if (!editName.trim()) {
        toast.warn('Group name cannot be empty.');
        return;
      }
      setActionLoading(true);
      try {
        await api.put(`/groups/${id}`, { name: editName });
        const res = await api.get(`/groups/${id}`);
        setGroup(res.data.group);
        setEditing(false);
        toast.success('Group name updated!');
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to update name.');
      } finally {
        setActionLoading(false);
      }
    };

    if (loading) {
      return <div className="text-center p-6 text-lg font-medium">Loading...</div>;
    }

    if (!group) {
      return <div className="text-center p-6 text-red-500">Group not found or an error occurred.</div>;
    }

    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-6 space-y-6">
        {/* Group name */}
        <div className="flex justify-between items-center">
          {editing ? (
            <div className="flex gap-2 w-full">
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                onClick={handleUpdateGroupName}
                disabled={actionLoading}
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{group.name}</h2>
              {isAdmin && (
                <button
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              )}
            </>
          )}
        </div>

        {/* Members list */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Members</h3>
          <ul className="space-y-2">
            {group.members.map((member) => (
              <li
                key={member._id}
                className="flex justify-between items-center border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {member.user.name}
                    {member.role === "admin" && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>

                {isAdmin && member.user._id !== currentUser?.id && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                    onClick={() => handleRemoveMember(member.user._id)}
                    disabled={actionLoading}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Add member form */}
        {isAdmin && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Add Member</h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                onClick={handleAddMember}
                disabled={actionLoading}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Expenses section */}
        <div className='py-10'>
          <ExpenseCard groupId={group._id} />
        </div>
      </div>
    );
  }

  export default GroupDetails;
