// models/Expense.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    splitMethod: {
      type: String,
      enum: ["equal", "custom"],
      default: "equal"
    },
    customSplits: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, min: 0 }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
