import UserProgress from "../models/UserProgress.js";

export async function createOrUpdateProgress(req, res) {
  try {
    const { userId, placeId, bucket, rating, notes, visitDate } = req.body;
    let { visited } = req.body;

    // Required fields
    if (!userId || !placeId) {
      return res.status(400).json({ message: "userId and placeId are required" });
    }

    // Normalize visited based on visitDate
    if (visitDate) {
      visited = true;
    }

    if (visited === undefined) {
      visited = false;
    }

    // Determine if record is empty
    const isEmpty =
      visited === false &&
      bucket !== true &&
      rating === undefined &&
      (!notes || notes.trim() === "") &&
      !visitDate;

    // Delete instead of upsert if empty
    if (isEmpty) {
      await UserProgress.findOneAndDelete({ userId, placeId });
      return res.status(200).json({ message: "Progress removed" });
    }

    // Upsert logic
    const updated = await UserProgress.findOneAndUpdate(
      { userId, placeId },
      { visited, bucket, rating, notes, visitDate },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(updated);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getUserProgress(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const progress = await UserProgress.find({ userId });

    return res.status(200).json(progress);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getSingleProgress(req, res) {
  try {
    const { userId, placeId } = req.params;

    if (!userId || !placeId) {
      return res.status(400).json({ message: "userId and placeId are required" });
    }

    const progress = await UserProgress.findOne({ userId, placeId });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    return res.status(200).json(progress);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

