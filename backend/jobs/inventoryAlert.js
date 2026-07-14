import { logger } from "../utils/logger.js";
import Inventory from "../models/Inventory.js";

export const inventoryAlertJob = async () => {
  try {
    logger.info("Running inventory alert job...");
    
    const inventoryItems = await Inventory.find().populate("medicineId");
    const lowStockItems = inventoryItems.filter(
      item => (item.currentStock || 0) <= (item.minimumStock || 0)
    );

    for (const item of lowStockItems) {
      const medicineName = item.medicineId?.medicineName || "Unknown Medicine";
      logger.warn(`Low stock alert: ${medicineName}`, {
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
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
