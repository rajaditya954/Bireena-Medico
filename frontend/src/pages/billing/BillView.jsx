import { useEffect, useState } from "react";
import { getBillById, payCash } from "../../services/billingService";

export default function BillView({ billId }) {
  const [bill, setBill] = useState(null);

  useEffect(() => {
    getBillById(billId).then((res) => setBill(res.data));
  }, [billId]);

  const handlePayment = async () => {
    await payCash(billId);
    alert("Paid successfully");
    window.location.reload();
  };

  if (!bill) return <p>Loading...</p>;

  return (
    <div>
      <h2>{bill.invoiceNumber}</h2>
      <p>Status: {bill.status}</p>

      {bill.items.map((item, i) => (
        <div key={i}>
          {item.name} - {item.quantity} × {item.unitPrice}
        </div>
      ))}

      <h3>Total: ₹{bill.totalAmount}</h3>

      {bill.status !== "paid" && (
        <button onClick={handlePayment}>Pay Cash</button>
      )}
    </div>
  );
}