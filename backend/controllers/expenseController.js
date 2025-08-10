// controllers/expenseController.js
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";

// get expenses for a group

export const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email") // populate payer
      .populate("customSplits.user", "name email"); // populate split users

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const addExpense = async (req, res) => {
  try {
    const { groupId, amount, description, splitMethod, customSplits } = req.body;

    // 1. Create the expense
    const expense = await Expense.create({
      group: groupId,
      paidBy: req.user._id, // Always use logged-in user
      amount,
      description,
      splitMethod,
      customSplits: splitMethod === "custom" ? customSplits : []
    });

    // 2. Link expense to group
    const group = await Group.findById(groupId);
    group.expenses.push(expense._id);
    await group.save();

    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    console.error("addExpense error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
