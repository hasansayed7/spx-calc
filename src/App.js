import { useState } from "react";

const pricingData = {
  "1-25": { Desktop: 6.64, VMs: 33.9, SBS: 27.17, "Physical Server": 48.84 },
  "26-50": { Desktop: 6.4, VMs: 33.9, SBS: 25.75, "Physical Server": 45.36 },
  "51-100": { Desktop: 6.05, VMs: 33.9, SBS: 23.87, "Physical Server": 40.79 },
  "101-150": { Desktop: 5.64, VMs: 33.9, SBS: 21.75, "Physical Server": 35.23 },
  "150+": { Desktop: 5.27, VMs: 31.37, SBS: 20.03, "Physical Server": 31.36 }
};

const licenseOptions = [
  {
    key: "Desktop",
    label: "🖥 Desktop",
    feature: "Great for individual workstations"
  },
  {
    key: "VMs",
    label: "☁️ VMs",
    feature: "Scalable for virtual environments"
  },
  {
    key: "SBS",
    label: "🧑‍💼 SBS",
    feature: "Ideal for small business servers"
  },
  {
    key: "Physical Server",
    label: "🖨 Physical Server",
    feature: "Powerful support for enterprise needs"
  }
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

  const exchangeRate = 61.87;
  const safeMarkup = markup < 15 ? 15 : markup;

  let totalCAD = 0;
  let totalINR = 0;
  let totalProfitCAD = 0;
  let totalProfitINR = 0;

  const summary = licenseOptions.map(({ key }) => {
    const quantity = Math.max(0, quantities[key]);
    if (quantity === 0) return null;

    const tier = getQuantityTier(quantity);
    const base = pricingData[tier][key];
    const resale = base * (1 + safeMarkup / 100);
    const profit = resale - base;

    const subtotalCAD = resale * quantity;
    const profitTotalCAD = profit * quantity;

    totalCAD += subtotalCAD;
    totalINR += subtotalCAD * exchangeRate;
    totalProfitCAD += profitTotalCAD;
    totalProfitINR += profitTotalCAD * exchangeRate;

    return {
      key,
      quantity,
      resale,
      profitTotalCAD
    };
  }).filter(Boolean);

  const updateQuantity = (key, delta) => {
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40, backgroundColor: "#f4f7fb", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 800,
          width: "100%",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
          fontFamily: "Segoe UI, sans-serif"
        }}
      >
        <h2 style={{ fontSize: 28, marginBottom: 30, textAlign: "center", color: "#2c3e50" }}>
          ExcelyTech Margin Calculator
        </h2>

        {/* Product Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 }}>
          {licenseOptions.map(({ key, label, feature }) => {
            const quantity = quantities[key];
            const tier = getQuantityTier(Math.max(1, quantity));
            const pricePerUnit = pricingData[tier][key];
            const resale = pricePerUnit * (1 + safeMarkup / 100);
            const profit = resale - pricePerUnit;

            return (
              <div
                key={key}
                style={{
                  borderRadius: 10,
                  padding: 20,
                  border: "1px solid #ddd",
                  backgroundColor: "#fafafa",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                }}
              >
                <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>{feature}</div>
                <div style={{ fontSize: 14, marginBottom: 10 }}>
                  Price: ${pricePerUnit.toFixed(2)} CAD → Resale: ${resale.toFixed(2)} CAD<br />
                  <span style={{ fontSize: 13, color: "#888" }}>Per unit profit: ${profit.toFixed(2)} CAD</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => updateQuantity(key, -1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      fontSize: 18,
                      cursor: "pointer"
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    readOnly
                    style={{
                      width: 50,
                      textAlign: "center",
                      fontSize: 16,
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      backgroundColor: "#fff",
                      padding: "6px 0"
                    }}
                  />
                  <button
                    onClick={() => updateQuantity(key, 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: "#2ecc71",
                      color: "#fff",
                      border: "none",
                      fontSize: 18,
                      cursor: "pointer"
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Markup */}
        <div style={{ marginBottom: 30 }}>
          <label style={{ display: "block", fontWeight: 600, color: "#34495e", marginBottom: 8 }}>Markup % (min 15%)</label>
          <input
            type="number"
            min={15}
            value={markup}
            onChange={(e) => setMarkup(Math.max(Number(e.target.value), 15))}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #ccc",
              backgroundColor: "#f9fafb"
            }}
          />
        </div>

        {/* Summary */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: 20,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)"
          }}
        >
          <h3 style={{ fontSize: 20, marginBottom: 16, color: "#2c3e50" }}>Summary</h3>
          {summary.length === 0 && <p style={{ color: "#888" }}>No products selected.</p>}
          {summary.map((item) => (
            <div key={item.key} style={{ marginBottom: 15 }}>
              <strong>{item.key}</strong>: {item.quantity} x ${item.resale.toFixed(2)} CAD
              <div style={{ fontSize: 13, color: "#666" }}>
                Profit: ${item.profitTotalCAD.toFixed(2)} CAD
              </div>
            </div>
          ))}
          {summary.length > 0 && (
            <>
              <hr style={{ margin: "20px 0" }} />
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#27ae60" }}>
                Total Resale: ${totalCAD.toFixed(2)} CAD / ₹{totalINR.toFixed(0)} INR<br />
                Total Profit: ${totalProfitCAD.toFixed(2)} CAD / ₹{totalProfitINR.toFixed(0)} INR
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
