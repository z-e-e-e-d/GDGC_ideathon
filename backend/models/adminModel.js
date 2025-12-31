const SlotSchema = new mongoose.Schema({
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stadium",
    required: true,
  },

  date: { type: Date, required: true },
  startTime: String,
  endTime: String,

  isBooked: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});
