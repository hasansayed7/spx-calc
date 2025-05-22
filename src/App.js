import { useState } from "react";

const pricingData = {
  "1-25": { Desktop: 6.64, VMs: 33.9, SBS: 27.17, "Physical Server": 48.84 },
  "26-50": { Desktop: 6.4, VMs: 33.9, SBS: 25.75, "Physical Server": 45.36 },
  "51-100": { Desktop: 6.05, VMs: 33.9, SBS: 23.87, "Physical Server": 40.79 },
  "101-150": { Desktop: 5.64, VMs: 33.9, SBS: 21.75, "Physical Server": 35.23 },
  "150+": { Desktop: 5.27, VMs: 31.37, SBS: 20.03, "Physical Server": 31.36 }
};

const licenseOptions = [
  { key: "Desktop", label: "🖥 Desktop", feature: "Great for individual workstations" },
  { key: "VMs", label: "☁️ VMs", feature: "Scalable for virtual environments" },
  { key: "SBS", label: "🧑‍💼 SBS", feature: "Ideal for small business servers" },
  { key: "Physical Server", label: "🖨 Physical Server", feature: "Support for enterprise needs" }
];

const getQuantityTier = (quantity) => {
  if (quantity <= 25) return "1-25";
  if (quantity <= 50) return "26-50";
  if (quantity <= 100) return "51-100";
  if (quantity <= 150) return "101-150";
  return "150+";
};

function App() {
  const [markup, setMarkup] = useState(15);
  const [quantities, setQuantities] = useState({
    Desktop: 0,
    VMs: 0,
    SBS: 0,
    "Physical Server": 0
  });
  const [serviceCharge, setServiceCharge] = useState("");
  const [taxPercent, setTaxPercent] = useState(13);
  const [stripeFeePercent, setStripeFeePercent] = useState(2.9);
  const [waiveStripeFee, setWaiveStripeFee] = useState(false);

  const exchangeRate = 61.87;
  const safeMarkup = Math.max(markup, 15);
  const safeTax = Math.max(taxPercent, 0);

  let totalResale = 0;
  let totalINR = 0;

  const summary = licenseOptions.map(({ key }) => {
    const quantity = Math.max(0, quantities[key]);
    if (quantity === 0) return null;

    const tier = getQuantityTier(quantity);
    const baseWithTax = pricingData[tier][key];
    const basePreTax = baseWithTax / (1 + 0.13); // known 13% tax baked in
    const resalePreTax = basePreTax * (1 + safeMarkup / 100);
    const resaleWithTax = resalePreTax * (1 + safeTax / 100);

    const subtotal = resaleWithTax * quantity;
    totalResale += subtotal;
    totalINR += subtotal * exchangeRate;

    return { key, quantity, resaleWithTax };
  }).filter(Boolean);

  const updateQuantity = (key, delta) => {
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const stripeFee = waiveStripeFee ? 0 : (stripeFeePercent / 100) * totalResale;
  const finalTotalCAD = totalResale + stripeFee;
  const finalTotalINR = finalTotalCAD * exchangeRate;

  return (
    <div style={{
      padding: 20,
      backgroundColor: "#f4f7fb",
      minHeight: "100vh",
      fontFamily: "Segoe UI, sans-serif"
    }}>
      <div style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        backgroundColor: "#fff"
      }}>
        <h2 style={{ fontSize: 26, textAlign: "center", marginBottom: 20 }}>ExcelyTech Margin Calculator</h2>

        {/* Products */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 30 }}>
          {licenseOptions.map(({ key, label, feature }) => {
            const quantity = quantities[key];
            const tier = getQuantityTier(Math.max(1, quantity));
            const baseWithTax = pricingData[tier][key];
            const basePreTax = baseWithTax / 1.13;
            const resalePreTax = basePreTax * (1 + safeMarkup / 100);
            const resaleWithTax = resalePreTax * (1 + safeTax / 100);

            return (
              <div key={key} style={{
                padding: 16,
                border: "1px solid #ddd",
                borderRadius: 10,
                backgroundColor: "#fafafa"
              }}>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>{feature}</div>
                <div style={{ fontSize: 13, marginBottom: 10 }}>
                  Final Price: ${resaleWithTax.toFixed(2)} CAD
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => updateQuantity(key, -1)} style={btnStyle("red")}>−</button>
                  <input
                    type="number"
                    readOnly
                    value={quantity}
                    style={{ width: 40, textAlign: "center", fontSize: 14 }}
                  />
                  <button onClick={() => updateQuantity(key, 1)} style={btnStyle("green")}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inputs */}
        <div style={{ marginBottom: 20 }}>
          <label>Markup % (min 15%)</label>
          <input type="number" value={markup} min={15} onChange={e => setMarkup(+e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>Service Charge (CAD)</label>
          <input type="text" value={serviceCharge} onChange={e => setServiceCharge(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>Tax %</label>
          <input type="number" value={taxPercent} onChange={e => setTaxPercent(+e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>Stripe Fee %</label>
          <input type="number" value={stripeFeePercent} onChange={e => setStripeFeePercent(+e.target.value)} style={inputStyle} />
          <div style={{ marginTop: 8 }}>
            <label>
              <input type="checkbox" checked={waiveStripeFee} onChange={e => setWaiveStripeFee(e.target.checked)} /> Waive Stripe Fee
            </label>
          </div>
        </div>

        {/* Summary */}
        <div style={{
          backgroundColor: "#f9fafb",
          padding: 20,
          borderRadius: 10,
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ fontSize: 18, marginBottom: 12 }}>Summary</h3>
          {summary.length === 0 ? <p style={{ color: "#888" }}>No products selected.</p> :
            <>
              {summary.map(({ key, quantity, resaleWithTax }) => (
                <div key={key}>
                  <strong>{key}</strong>: {quantity} x ${resaleWithTax.toFixed(2)} CAD
                </div>
              ))}
              <hr style={{ margin: "15px 0" }} />
              <div>Service Charge: {serviceCharge || "N/A"}</div>
              <div>Stripe Fee: ${stripeFee.toFixed(2)} CAD</div>
              <div style={{ marginTop: 10, fontWeight: "bold", fontSize: 16 }}>
                Total: ${finalTotalCAD.toFixed(2)} CAD / ₹{finalTotalINR.toFixed(0)} INR
              </div>
            </>
          }
        </div>
      </div>
    </div>
  );
}

const btnStyle = (color) => ({
  width: 30,
  height: 30,
  fontSize: 16,
  border: "none",
  borderRadius: 6,
  backgroundColor: color === "red" ? "#e74c3c" : "#2ecc71",
  color: "#fff",
  cursor: "pointer"
});

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: 6,
  fontSize: 14,
  borderRadius: 6,
  border: "1px solid #ccc",
  backgroundColor: "#fefefe"
};

export default App;
