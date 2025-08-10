import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ''
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member'
        }
      }
    ],
    expenses: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense"
  }
]
  },
  {
    timestamps: true
  }
);

const Group = mongoose.model('Group', GroupSchema);
export default Group;
