import { useEffect, useState } from 'react';
import AddExpenseForm from '../pages/AddExpenseForm';
import axios from 'axios';
import Balances from './Balances';

export default function GroupPage({ groupId }) {
  const [expenses, setExpenses] = useState([]);


  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/groups/${groupId}/expenses`,
        { withCredentials: true } // Send session cookie
      );
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [groupId]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Group Expenses</h1>

      <AddExpenseForm
  groupId={groupId}
  onExpenseAdded={() => {
    fetchExpenses();
  }}

/>


      <div className="mt-6">
        {expenses.map((exp) => (
          <div key={exp._id} className="border-b py-2">
            {exp.description} - ${exp.amount}
          </div>
        ))}
      </div>

      <Balances groupId={groupId} />

    </div>
  );
}
