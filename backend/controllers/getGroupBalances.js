// controllers/groupController.js
import Group from "../models/Group.js";
import Expense from "../models/Expense.js";

/**
 * GET /api/groups/:groupId/balances
 * Returns an array of debt statements like:
 * [{ from: "Ali", to: "Sara", amount: 12.34 }, ... ]
 */
export const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    // 1) Load group with member user info
    const group = await Group.findById(groupId).populate("members.user", "name email").lean();
    if (!group) return res.status(404).json({ message: "Group not found" });

    // 2) Load expenses for the group
    const expenses = await Expense.find({ group: groupId }).lean();

    // 3) Initialize balances map: id -> { id, name, balance }
    const balances = {};
    group.members.forEach((m) => {
      const uid = m.user._id.toString();
      balances[uid] = { id: uid, name: m.user.name, balance: 0 };
    });

    // 4) Apply each expense to balances
    //    - payer gets +amount
    //    - participants (equal split) or customSplits get -their share
    for (const exp of expenses) {
      const amount = Number(exp.amount) || 0;
      const payerId = exp.paidBy ? exp.paidBy.toString() : null;

      if (payerId && balances[payerId] === undefined) {
        // payer not in members (edge case) — add safely
        balances[payerId] = { id: payerId, name: "Unknown", balance: 0 };
      }

      // credit full amount to payer first
      if (payerId) balances[payerId].balance += amount;

      if (exp.splitMethod === "custom" && Array.isArray(exp.customSplits) && exp.customSplits.length) {
        // custom splits: subtract each custom amount from that user
        for (const split of exp.customSplits) {
          const uid = split.user.toString();
          const amt = Number(split.amount) || 0;
          if (!balances[uid]) {
            balances[uid] = { id: uid, name: "Unknown", balance: 0 };
          }
          balances[uid].balance -= amt;
        }
      } else {
        // equal split across all group members
        const numMembers = group.members.length || 1;
        const share = amount / numMembers;
        for (const m of group.members) {
          const uid = m.user._id.toString();
          if (!balances[uid]) {
            balances[uid] = { id: uid, name: m.user.name || "Unknown", balance: 0 };
          }
          balances[uid].balance -= share;
        }
      }
    }

    // 5) Build creditors and debtors lists
    const EPS = 0.005; // tolerance to avoid tiny rounding leftovers
    const creditors = [];
    const debtors = [];
    for (const id of Object.keys(balances)) {
      const b = balances[id];
      // normalize rounding small -0 => 0
      if (Math.abs(b.balance) < EPS) b.balance = 0;
      if (b.balance > 0) creditors.push({ ...b });
      else if (b.balance < 0) debtors.push({ ...b });
    }

    // sort creditors desc, debtors asc (most negative first)
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);

    // 6) Greedy settle: match debtors to creditors
    const debts = [];
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const owe = Math.min(creditor.balance, -debtor.balance);

      if (owe > 0.009) { // > 1 cent
        const amount = Math.round(owe * 100) / 100; // round to 2 decimals
        debts.push({
          from: debtor.name,
          to: creditor.name,
          amount,
        });

        // update balances
        debtor.balance += amount;
        creditor.balance -= amount;
      }

      // move pointers if roughly settled
      if (Math.abs(debtor.balance) < EPS) i++;
      if (Math.abs(creditor.balance) < EPS) j++;
    }

    res.json(debts);
  } catch (err) {
    console.error("getGroupBalances error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
