import History from "../models/History.js";

export const getHistory = async (req, res) => {
  try {
    const history = await History.find()
      .populate("patientId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};