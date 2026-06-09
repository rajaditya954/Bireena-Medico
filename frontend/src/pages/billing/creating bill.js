import { useState } from "react";
import { createBill } from "../../services/billingService";

export default function CreateBill() {
  const [items, setItems] = useState([
    { name: "", quantity: 1, unitPrice: 0 }
  ]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  const handleChange = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleSubmit = async () => {
    try {
      const res = await createBill({
        patient: "PUT_PATIENT_ID",
        items,
        tax,
        discount
      });

      alert("Bill Created: " + res.data.invoiceNumber);
    } catch (err) {
      console.error(err);
      alert("Error creating bill");
    }
  };

  return (
    <div>
      <h2>Create Bill</h2>

      {items.map((item, i) => (
        <div key={i}>
          <input
            placeholder="Item"
            onChange={(e) => handleChange(i, "name", e.target.value)}
          />
          <input
            type="number"
            placeholder="Qty"
            onChange={(e) =>
              handleChange(i, "quantity", Number(e.target.value))
            }
          />
          <input
            type="number"
            placeholder="Price"
            onChange={(e) =>
              handleChange(i, "unitPrice", Number(e.target.value))
            }
          />
        </div>
      ))}

      <button onClick={addItem}>Add Item</button>

      <br />

      <input
        type="number"
        placeholder="Tax"
        onChange={(e) => setTax(Number(e.target.value))}
      />

      <input
        type="number"
        placeholder="Discount"
        onChange={(e) => setDiscount(Number(e.target.value))}
      />

      <button onClick={handleSubmit}>Create Bill</button>
    </div>
  );
}