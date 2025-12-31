const AdminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },

  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    default: "admin",
  },

  createdAt: { type: Date, default: Date.now },
});
