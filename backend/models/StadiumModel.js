const StadiumSchema = new mongoose.Schema({
  name: { type: String, required: true },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },

  location: {
    address: String,
    lat: Number,
    lng: Number,
  },

  pricePerHour: Number,

  isActive: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});
