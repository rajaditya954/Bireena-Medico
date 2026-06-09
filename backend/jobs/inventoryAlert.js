import { logger } from "../utils/logger.js";
import Inventory from "../models/Inventory.js";

export const inventoryAlertJob = async () => {
  try {
    logger.info("Running inventory alert job...");
    
    const lowStockItems = await Inventory.find({
      quantity: { $lte: "$minimumThreshold" },
    }).populate("medicineId");

    for (const item of lowStockItems) {
      logger.warn(`Low stock alert: ${item.medicineId.name}`, {
        currentStock: item.quantity,
        minimumThreshold: item.minimumThreshold,
      });
      
      // Here you could send alerts to admins
      // await sendLowStockAlert(item);
    }
  } catch (error) {
    logger.error("Inventory alert job failed:", error);
  }
};

// Schedule job to run every 6 hours
export const scheduleInventoryAlerts = () => {
  setInterval(inventoryAlertJob, 6 * 60 * 60 * 1000);
  logger.info("Inventory alert job scheduled to run every 6 hours");
};
