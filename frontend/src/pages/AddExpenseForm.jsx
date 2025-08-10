import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function AddExpenseForm({ groupId, onExpenseAdded }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:5000/api/expenses`,
        { groupId, description, amount: parseFloat(amount) },
        { withCredentials: true } // ✅ Send cookies/session data
      );

      toast.success('Expense added successfully');

      setDescription('');
      setAmount('');

      if (onExpenseAdded) onExpenseAdded(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-white rounded shadow">
        <div>
          <label className="block mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </>
  );
}
