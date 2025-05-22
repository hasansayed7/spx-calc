import { useState } from "react";

const exchangeRate = 61.87;

// Pricing data combined for SPX and Eset products
const pricingData = {
  SPX: {
    "1-25": { Desktop: 6.64, VMs: 33.9, SBS: 27.17, "Physical Server": 48.84 },
    "26-50": { Desktop: 6.4, VMs: 33.9, SBS: 25.75, "Physical Server": 45.36 },
    "51-100": { Desktop: 6.05, VMs: 33.9, SBS: 23.87, "Physical Server": 40.79 },
    "101-150": { Desktop: 5.64, VMs: 33.9, SBS: 21.75, "Physical Server": 35.23 },
    "150+": { Desktop: 5.27, VMs: 31.37, SBS: 20.03, "Physical Server": 31.36 },
  },
  ESET: {
    "01-10": { "Xcel Advance cloud": 2.4, "Xcel Complete cloud": 3.3 },
    "11-25": { "Xcel Advance cloud": 2.4, "Xcel Complete cloud": 3.3 },
    "26-49": { "Xcel Advance cloud": 2.4, "Xcel Complete cloud": 3.3 },
    "50-99": { "Xcel Advance cloud": 2.4, "Xcel Complete cloud": 3.3 },
    "100-249": { "Xcel Advance cloud": 2.4, "Xcel Complete cloud": 3.3 },
  }
};

// Helper to get SPX quantity tier
const getSPXQuantityTier = (quantity) => {
  if (quantity <= 25) return "1-25";
  if (quantity <= 50) return "26-50";
  if (quantity <= 100) return "51-100";
  if (quantity <= 150) return "101-150";
  return "150+";
};

// Helper to get Eset quantity tier
const getEsetQuantityTier = (quantity) => {
  if (quantity <= 10) return "01-10";
  if (quantity <= 25) return "11-25";
  if (quantity <= 49) return "26-49";
  if (quantity <= 99) return "50-99";
  return "100-249";
};

// Product options for dropdown
const productOptions = [
  { label: "SPX Desktop", category: "SPX", type: "Desktop" },
  { label: "SPX VMs", category: "SPX", type: "VMs" },
  { label: "SPX SBS", category: "SPX", type: "SBS" },
  { label: "SPX Physical Server", category: "SPX", type: "Physical Server" },
  { label: "Eset Xcel Advance cloud", category: "ESET", type: "Xcel Advance cloud" },
  { label: "Eset Xcel Complete cloud", category: "ESET", type: "Xcel Complete cloud" },
];

function App() {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(productOptions[0].label);
  const [quantity, setQuantity] = useState(1);
  const [markup, setMarkup] = useState(15);
  const [taxRate, setTaxRate] = useState(13);

  // Add product to cart
  const addToCart = () => {
    if (quantity < 1) return alert("Quantity must be at least 1");

    // Find selected product info
    const prodInfo = productOptions.find(p => p.label === selectedProduct);
    if (!prodInfo) return;

    // Add new line item
    setCart(prev => [
      ...prev,
      {
        id: Date.now(),
        category: prodInfo.category,
        type: prodInfo.type,
        quantity,
        markup,
        taxRate,
      },
    ]);
    // Reset quantity and markup to defaults if you want
    setQuantity(1);
    setMarkup(15);
  };

  // Remove line from cart
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Update quantity or markup in cart line
  const updateCartLine = (id, field, value) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: Number(value) } : item
      )
    );
  };

  // Calculate pricing for a line
  const calculateLine = (line) => {
    const { category, type, quantity, markup, taxRate } = line;
    const safeQuantity = quantity < 1 ? 1 : quantity;

    let tier;
    if (category === "SPX") {
      tier = getSPXQuantityTier(safeQuantity);
    } else if (category === "ESET") {
      tier = getEsetQuantityTier(safeQuantity);
    }

    const baseCostWithoutTax = pricingData[category][tier][type];
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

    return {
      tier,
      baseCostWithoutTax,
      baseCostWithTax,
      resalePriceCAD,
      profitPerUnitCAD,
      totalProfitCAD,
      totalResalePriceCAD,
      baseCostINR,
      baseCostWithoutTaxINR,
      resalePriceINR,
      profitPerUnitINR,
      totalProfitINR,
      totalResalePriceINR,
      profitColor,
      safeQuantity,
    };
  };

  // Calculate cart totals
  const totals = cart.reduce(
    (acc, line) => {
      const lineCalc = calculateLine(line);
      acc.totalProfitCAD += lineCalc.totalProfitCAD;
      acc.totalResaleCAD += lineCalc.totalResalePriceCAD;
      acc.totalProfitINR += lineCalc.totalProfitINR;
      acc.totalResaleINR += lineCalc.totalResalePriceINR;
      return acc;
    },
    { totalProfitCAD: 0, totalResaleCAD: 0, totalProfitINR: 0, totalResaleINR: 0 }
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#40E0D0", // Feroza color
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 700,
          width: "100%",
          padding: 30,
          borderRadius: 12,
          backgroundColor: "#ffffffee",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
          SPX & Eset Pricing Shopping Cart
        </h2>

        {/* Add new product section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
            gap: "12px",
            marginBottom: 20,
          }}
        >
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={{
              padding: "10px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          >
            {productOptions.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="Quantity"
            style={{
              padding: "10px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
          <input
            type="number"
            min="0"
            value={markup}
            onChange={(e) => setMarkup(Number(e.target.value))}
            placeholder="Markup %"
            style={{
              padding: "10px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
          <input
            type="number"
            min="0"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            placeholder="Tax %"
            style={{
              padding: "10px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={addToCart}
            style={{
              backgroundColor: "#059669",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer",
              padding: "10px",
            }}
          >
            Add
          </button>
        </div>

        {/* Cart lines */}
        {cart.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>No items in cart</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 20,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#e5e7eb" }}>
                <th style={{ padding: "8px" }}>Product</th>
                <th style={{ padding: "8px" }}>Quantity Tier</th>
                <th style={{ padding: "8px" }}>Qty</th>
                <th style={{ padding: "8px" }}>Markup %</th>
                <th style={{ padding: "8px" }}>Tax %</th>
                <th style={{ padding: "8px" }}>Resale Price (CAD)</th>
                <th style={{ padding: "8px" }}>Profit (CAD)</th>
                <th style={{ padding: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((line) => {
                const calc = calculateLine(line);
                return (
                  <tr key={line.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "8px" }}>
                      {line.category} - {line.type}
                    </td>
                    <td style={{ padding: "8px" }}>{calc.tier}</td>
                    <td style={{ padding: "8px" }}>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          updateCartLine(line.id, "quantity", e.target.value)
                        }
                        style={{ width: "60px", padding: "4px" }}
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      <input
                        type="number"
                        min="0"
                        value={line.markup}
                        onChange={(e) =>
                          updateCartLine(line.id, "markup", e.target.value)
                        }
                        style={{ width: "60px", padding: "4px" }}
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      <input
                        type="number"
                        min="0"
                        value={line.taxRate}
                        onChange={(e) =>
                          updateCartLine(line.id, "taxRate", e.target.value)
                        }
                        style={{ width: "60px", padding: "4px" }}
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      ${calc.totalResalePriceCAD.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px", color: calc.profitColor }}>
                      ${calc.totalProfitCAD.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <button
                        onClick={() => removeFromCart(line.id)}
                        style={{
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          padding: "4px 8px",
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Totals summary */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: 12,
            padding: 20,
            fontWeight: "bold",
            fontSize: 18,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            Total Resale Price: ${totals.totalResaleCAD.toFixed(2)} CAD / ₹
            {(totals.totalResaleINR).toFixed(2)} INR
          </div>
          <div style={{ color: "#059669" }}>
            Total Profit: ${totals.totalProfitCAD.toFixed(2)} CAD / ₹
            {(totals.totalProfitINR).toFixed(2)} INR
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
