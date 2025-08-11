import { useEffect, useState } from 'react';
import axios from 'axios';
import SettlementModal from './SettlementModal';

export default function Balances({ groupId }) {
  const [balances, setBalances] = useState([]); // expects array of debt objects or per-user objects
  const [members, setMembers] = useState([]);   // array of { _id, name }
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch balances. Backend may return either:
  // 1) an array directly => res.data === [ { from, to, amount }, ... ]
  // 2) an object { balances: [...], members: [...] } => res.data.balances
  const fetchBalances = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/groups/${groupId}/balances`,
        { withCredentials: true }
      );

      // handle multiple shapes defensively
      if (Array.isArray(res.data)) {
        setBalances(res.data);
      } else if (Array.isArray(res.data.balances)) {
        setBalances(res.data.balances);
      } else if (Array.isArray(res.data.debts)) {
        // sometimes named debts
        setBalances(res.data.debts);
      } else {
        // unknown shape, try to coerce to an array
        console.warn('Unexpected balances response shape:', res.data);
        setBalances([]);
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
      setBalances([]);
    }
  };

  // Fetch members from group endpoint so the modal has data
  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/groups/${groupId}`,
        { withCredentials: true }
      );
      // Group may be in res.data.group or res.data
      const group = res.data.group || res.data;
      const rawMembers = group?.members || [];
      // Normalize various shapes: member.user, member._id, etc.
      const normalized = rawMembers.map((m) => {
        // m might be { user: { _id, name, email }, role } or { _id, name }
        if (m?.user) {
          return { _id: m.user._id || m.user._id, name: m.user.name || m.user.email || 'Unknown' };
        }
        // fallback
        return { _id: m._id || m.user?._id, name: m.name || m.email || 'Unknown' };
      });
      setMembers(normalized);
    } catch (err) {
      console.error('Error fetching group members:', err);
      setMembers([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchBalances(), fetchMembers()]);
      if (mounted) setLoading(false);
    };

    init();

    // poll balances every 5s (members usually static)
    const interval = setInterval(fetchBalances, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [groupId]);

  if (loading) return <p>Loading balances...</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Balances</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Settle Up
        </button>
      </div>

      {(!balances || balances.length === 0) ? (
        <p className="text-gray-500">No balances yet. Add some expenses to see balances.</p>
      ) : (
        <ul className="space-y-2">
          {balances.map((b, idx) => {
            // b could be { from, to, amount } (debt statements) OR
            // you might use per-user format if you prefer; handle both.
            if (b.from && b.to && typeof b.amount !== 'undefined') {
              return (
                <li key={idx} className="bg-gray-100 p-2 rounded flex justify-between">
                  <span>{b.from} owes {b.to}</span>
                  <span className="font-medium">${Number(b.amount).toFixed(2)}</span>
                </li>
              );
            }
            // fallback / unknown shape
            return (
              <li key={idx} className="bg-gray-100 p-2 rounded">
                {JSON.stringify(b)}
              </li>
            );
          })}
        </ul>
      )}

      <SettlementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupId={groupId}
        members={members}
        onSettlementComplete={() => {
          // refresh balances after settlement
          fetchBalances();
        }}
      />
    </div>
  );
}
