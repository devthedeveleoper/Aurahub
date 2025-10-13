import mongoose from "mongoose";

const watchLaterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  { timestamps: true }
);

watchLaterSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const WatchLater =
  mongoose.models.WatchLater || mongoose.model("WatchLater", watchLaterSchema);

export default WatchLater;
