// routes/expenseRoutes.js
import express from "express";
import { addExpense } from "../controllers/expenseController.js";
import { checkGroupMember, } from "../middlewares/checkGroupMember.js";
import { ensureAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create an expense
router.post(
  "/",
  ensureAuthenticated,
  checkGroupMember,
  addExpense
);

export default router;
