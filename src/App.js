import { useState } from "react";

const pricingData = {
  "1-25": { Desktop: 6.64, VMs: 33.9, SBS: 27.17, "Physical Server": 48.84 },
  "26-50": { Desktop: 6.4, VMs: 33.9, SBS: 25.75, "Physical Server": 45.36 },
  "51-100": { Desktop: 6.05, VMs: 33.9, SBS: 23.87, "Physical Server": 40.79 },
  "101-150": { Desktop: 5.64, VMs: 33.9, SBS: 21.75, "Physical Server": 35.23 },
  "150+": { Desktop: 5.27, VMs: 31.37, SBS: 20.03, "Physical Server": 31.36 },
};

const getQuantityTier = (quantity) => {
  if (quantity <= 25) return "1-25";
  if (quantity <= 50) return "26-50";
  if (quantity <= 100) return "51-100";
  if (quantity <= 150) return "101-150";
  return "150+";
};

function App() {
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState("Desktop");
  const [markup, setMarkup] = useState(15);
  const [taxRate, setTaxRate] = useState(13);

  const exchangeRate = 61.87;

  const safeQuantity = quantity < 1 ? 1 : quantity;
  const tier = getQuantityTier(safeQuantity);
  const baseCostWithoutTax = pricingData[tier][type];
  const baseCostWithTax = baseCostWithoutTax * (1 + taxRate / 100);
  const resalePriceCAD = baseCostWithTax * (1 + markup / 100);
  const profitPerUnitCAD = resalePriceCAD - baseCostWithTax;
  const totalProfitCAD = profitPerUnitCAD * safeQuantity;
  const totalResalePriceCAD = resalePriceCAD * safeQuantity;

  const baseCostINR = baseCostWithTax * exchangeRate;
  const baseCostWithoutTaxINR = baseCostWithoutTax * exchangeRate;
  const resalePriceINR = resalePriceCAD * exchangeRate;
  const profitPerUnitINR = profitPerUnitCAD * exchangeRate;
  const totalProfitINR = totalProfitCAD * exchangeRate;
  const totalResalePriceINR = totalResalePriceCAD * exchangeRate;

  const profitColor = markup < 15 ? "#dc2626" : "#059669";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#40E0D0", // Feroza color
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          width: "100%",
          padding: 30,
          borderRadius: 12,
          backgroundColor: "#ffffffee",
          fontFamily: "Segoe UI, sans-serif",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
          SPX Pricing Calculator
        </h2>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: 600 }}>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 5,
            }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: 600 }}>License Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 5,
            }}
          >
            <option value="Desktop">Desktop</option>
            <option value="VMs">VMs</option>
            <option value="SBS">SBS</option>
            <option value="Physical Server">Physical Server</option>
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: 600 }}>Markup %</label>
          <input
            type="number"
            value={markup}
            onChange={(e) => setMarkup(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 5,
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600 }}>Tax Rate % (based on province)</label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 5,
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: "#ffffffdd",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            marginTop: 20,
          }}
        >
          <h3
            style={{
              fontSize: 20,
              marginBottom: 16,
              color: "#111827",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: 10,
            }}
          >
            Pricing Summary
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px 8px",
              fontSize: 16,
              lineHeight: "1.6",
              color: "#1f2937",
            }}
          >
            <div><strong>Quantity Tier:</strong></div>
            <div>{tier}</div>

            <div><strong>Base Cost (without tax):</strong></div>
            <div>${baseCostWithoutTax.toFixed(2)} CAD / ₹{baseCostWithoutTaxINR.toFixed(2)} INR</div>

            <div><strong>Base Cost (with tax):</strong></div>
            <div>${baseCostWithTax.toFixed(2)} CAD / ₹{baseCostINR.toFixed(2)} INR</div>

            <div><strong>Resale Price (per unit):</strong></div>
            <div>${resalePriceCAD.toFixed(2)} CAD / ₹{resalePriceINR.toFixed(2)} INR</div>

            <div><strong>Profit (per unit):</strong></div>
            <div style={{ color: profitColor }}>
              ${profitPerUnitCAD.toFixed(2)} CAD / ₹{profitPerUnitINR.toFixed(2)} INR
            </div>

            <div><strong>Total Resale Price:</strong></div>
            <div>${totalResalePriceCAD.toFixed(2)} CAD / ₹{totalResalePriceINR.toFixed(2)} INR</div>

            <div><strong>Total Profit:</strong></div>
            <div style={{ fontWeight: "bold", color: profitColor }}>
              ${totalProfitCAD.toFixed(2)} CAD / ₹{totalProfitINR.toFixed(2)} INR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
