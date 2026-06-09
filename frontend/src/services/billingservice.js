import api from "./api";

// Create Bill
export const createBill = (data) => {
  return api.post("/bills", data);
};

// Get all bills
export const getBills = () => {
  return api.get("/bills");
};

// Get single bill
export const getBillById = (id) => {
  return api.get(`/bills/${id}`);
};

// Cash payment
export const payCash = (billId) => {
  return api.post("/payments/cash", { billId });
};