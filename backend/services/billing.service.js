import Billing from "../models/Billing.js";
import Invoice from "../models/Invoice.js";

class BillingService {
  async getAllBillings() {
    return await Billing.find()
      .populate("patientId")
      .sort({ createdAt: -1 });
  }

  async createBilling(billingData) {
    if (!billingData.billingId) {
      const count = await Billing.countDocuments();
      billingData.billingId = `BILL-${Date.now()}-${count + 1}`;
    }
    const billing = new Billing(billingData);
    await billing.save();
    return billing;
  }

  async getBillingById(id) {
    return await Billing.findById(id).populate("patientId");
  }

  async getBillingsByPatient(patientId) {
    return await Billing.find({ patientId });
  }

  async updateBillingStatus(id, status) {
    return await Billing.findByIdAndUpdate(id, { status }, { new: true });
  }

  async generateInvoice(billingId) {
    const billing = await this.getBillingById(billingId);
    if (!billing) throw new Error("Billing not found");

    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = new Invoice({
      invoiceNumber,
      billingId,
      patientId: billing.patientId,
      amount: billing.total,
      status: "paid",
    });

    await invoice.save();
    return invoice;
  }

  async getInvoiceById(id) {
    return await Invoice.findById(id).populate(["billingId", "patientId"]);
  }

  async updateInvoiceStatus(id, status) {
    return await Invoice.findByIdAndUpdate(id, { status }, { new: true });
  }

  async calculateBillingTotal(items) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.05; // 5% tax
    return { subtotal, tax, total: subtotal + tax };
  }

  async getPendingBills(patientId) {
    return await Billing.find({
      patientId,
      status: { $in: ["pending", "draft"] },
    });
  }
}

export default new BillingService();
