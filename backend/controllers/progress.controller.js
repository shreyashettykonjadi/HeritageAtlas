import UserProgress from "../models/UserProgress.js";

// POST /progress
export async function createOrUpdateProgress(req, res) {
  try {
    const userId = req.userId;
    const { placeId } = req.body;

    if (!placeId) {
      return res.status(400).json({ message: "placeId is required" });
    }

    // Fetch existing record (if any)
    const existing = await UserProgress.findOne({ userId, placeId });

    // Start from existing values if present
    const current = existing ? existing.toObject() : {};

    // Build updated state by merging
    const updatedState = {
      visited: current.visited || false,
      bucket: current.bucket || false,
      rating: current.rating,
      notes: current.notes,
      visitDate: current.visitDate,
    };

    // Apply incoming fields only if defined
    if ("visited" in req.body) {
      updatedState.visited = req.body.visited;
    }

    if ("bucket" in req.body) {
      updatedState.bucket = req.body.bucket;
    }

    if ("rating" in req.body) {
      updatedState.rating = req.body.rating;
    }

    if ("notes" in req.body) {
      updatedState.notes = req.body.notes;
    }

    if ("visitDate" in req.body) {
        updatedState.visitDate = req.body.visitDate;

        if (req.body.visitDate) {
            updatedState.visited = true;
        }
    }

    // Determine if record is empty
    const isEmpty =
        updatedState.visited === false &&
        updatedState.bucket !== true &&
        (updatedState.rating === undefined || updatedState.rating === null) &&
        (!updatedState.notes || updatedState.notes.trim() === "") &&
        !updatedState.visitDate;


    if (isEmpty) {
      await UserProgress.findOneAndDelete({ userId, placeId });
      return res.status(200).json({ message: "Progress removed" });
    }

    // Upsert with $set
    const updated = await UserProgress.findOneAndUpdate(
      { userId, placeId },
      { $set: updatedState },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(updated);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// GET /progress
export async function getUserProgress(req, res) {
  try {
    const userId = req.userId;

    const progress = await UserProgress.find({ userId });

    return res.status(200).json(progress);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// GET /progress/:placeId
export async function getSingleProgress(req, res) {
  try {
    const userId = req.userId;
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({ message: "placeId is required" });
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
