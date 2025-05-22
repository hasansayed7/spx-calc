import { useState, useEffect } from "react";

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
  const [darkMode, setDarkMode] = useState(false);

  // Check user's preferred color scheme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

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
    const basePreTax = baseWithTax / (1 + 0.13);
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

  // Theme styles
  const themeStyles = {
    light: {
      bg: "linear-gradient(rgba(255,255,255,0.97), rgba(255,255,255,0.97)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
      cardBg: "rgba(255,255,255,0.95)",
      textPrimary: "#2b2d42",
      textSecondary: "#6c757d",
      inputBg: "white",
      border: "1px solid rgba(0,0,0,0.08)",
      summaryBg: "rgba(248,249,250,0.8)",
      productCard: "rgba(250,250,250,0.7)",
      highlight: "rgba(58,134,255,0.1)"
    },
    dark: {
      bg: "linear-gradient(rgba(17,24,39,0.95), rgba(17,24,39,0.95)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
      cardBg: "rgba(31,41,55,0.95)",
      textPrimary: "#f3f4f6",
      textSecondary: "#9ca3af",
      inputBg: "rgba(55,65,81,0.8)",
      border: "1px solid rgba(255,255,255,0.08)",
      summaryBg: "rgba(17,24,39,0.8)",
      productCard: "rgba(55,65,81,0.5)",
      highlight: "rgba(59,130,246,0.2)"
    }
  };

  const currentTheme = darkMode ? themeStyles.dark : themeStyles.light;

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      backgroundImage: currentTheme.bg,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      padding: "20px 0",
      color: currentTheme.textPrimary,
      transition: "all 0.3s ease"
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        `}
      </style>

      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 30,
        borderRadius: 16,
        boxShadow: darkMode ? "0 10px 40px rgba(0,0,0,0.3)" : "0 10px 40px rgba(0,0,0,0.12)",
        backgroundColor: currentTheme.cardBg,
        backdropFilter: "blur(8px)",
        border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.3)",
        transition: "all 0.3s ease"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              backgroundColor: "#3a86ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: "700",
              fontFamily: "'Inter', sans-serif"
            }}>
              ET
            </div>
            <div>
              <h1 style={{ 
                fontSize: 28, 
                margin: 0, 
                color: currentTheme.textPrimary,
                fontWeight: "600",
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.5px"
              }}>
                ExcelyTech Pricing Calculator
              </h1>
              <p style={{ 
                margin: 0, 
                color: currentTheme.textSecondary, 
                fontSize: 14,
                fontWeight: "400",
                fontFamily: "'Inter', sans-serif"
              }}>
                Business Continuity & Cloud Solutions
              </p>
            </div>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: darkMode ? "#374151" : "#e5e7eb",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              color: darkMode ? "#f3f4f6" : "#111827",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
          >
            {darkMode ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5001M17.6859 17.69L18.5 18.5001M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Light Mode
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.32031 11.6835C3.32031 16.7601 7.34975 20.7895 12.4264 20.7895C16.1075 20.7895 19.3483 18.8423 20.6768 15.6319C19.6402 16.1186 18.5059 16.3949 17.3215 16.3949C12.2448 16.3949 8.21537 12.3655 8.21537 7.28883C8.21537 5.97441 8.51205 4.72391 9.048 3.61804C5.81638 4.99359 3.32031 8.25258 3.32031 11.6835Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Dark Mode
              </>
            )}
          </button>
        </div>

        {/* Products */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: 20, 
          marginBottom: 30 
        }}>
          {licenseOptions.map(({ key, label, feature }) => {
            const quantity = quantities[key];
            const tier = getQuantityTier(Math.max(1, quantity));
            const baseWithTax = pricingData[tier][key];
            const basePreTax = baseWithTax / 1.13;
            const resalePreTax = basePreTax * (1 + safeMarkup / 100);
            const resaleWithTax = resalePreTax * (1 + safeTax / 100);

            return (
              <div key={key} style={{
                padding: 20,
                border: currentTheme.border,
                borderRadius: 12,
                backgroundColor: currentTheme.productCard,
                transition: "all 0.3s ease",
                ":hover": {
                  boxShadow: darkMode ? "0 5px 15px rgba(0,0,0,0.2)" : "0 5px 15px rgba(0,0,0,0.05)",
                  transform: "translateY(-2px)"
                }
              }}>
                <div style={{ 
                  fontWeight: "600", 
                  marginBottom: 6,
                  color: currentTheme.textPrimary,
                  fontSize: 16,
                  fontFamily: "'Poppins', sans-serif"
                }}>{label}</div>
                <div style={{ 
                  fontSize: 13, 
                  color: currentTheme.textSecondary, 
                  marginBottom: 10,
                  minHeight: 40,
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: "1.5"
                }}>{feature}</div>
                <div style={{ 
                  fontSize: 14, 
                  marginBottom: 12,
                  backgroundColor: currentTheme.highlight,
                  padding: "6px 10px",
                  borderRadius: 6,
                  display: "inline-block",
                  color: "#3a86ff",
                  fontWeight: "500",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Final Price: ${resaleWithTax.toFixed(2)} CAD
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button 
                    onClick={() => updateQuantity(key, -1)} 
                    style={btnStyle("red", darkMode)}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    readOnly
                    value={quantity}
                    style={{ 
                      width: 50, 
                      textAlign: "center", 
                      fontSize: 14,
                      padding: "6px",
                      border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e9ecef",
                      borderRadius: 6,
                      backgroundColor: currentTheme.inputBg,
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: "500",
                      color: currentTheme.textPrimary,
                      transition: "all 0.3s ease"
                    }}
                  />
                  <button 
                    onClick={() => updateQuantity(key, 1)} 
                    style={btnStyle("green", darkMode)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inputs */}
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 30
        }}>
          <div>
            <label style={labelStyle(darkMode)}>Markup % (min 15%)</label>
            <input 
              type="number" 
              value={markup} 
              min={15} 
              onChange={e => setMarkup(+e.target.value)} 
              style={inputStyle(darkMode)} 
            />
          </div>
          <div>
            <label style={labelStyle(darkMode)}>Service Charge (CAD)</label>
            <input 
              type="text" 
              value={serviceCharge} 
              onChange={e => setServiceCharge(e.target.value)} 
              style={inputStyle(darkMode)} 
            />
          </div>
          <div>
            <label style={labelStyle(darkMode)}>Tax %</label>
            <input 
              type="number" 
              value={taxPercent} 
              onChange={e => setTaxPercent(+e.target.value)} 
              style={inputStyle(darkMode)} 
            />
          </div>
          <div>
            <label style={labelStyle(darkMode)}>Stripe Fee %</label>
            <input 
              type="number" 
              value={stripeFeePercent} 
              onChange={e => setStripeFeePercent(+e.target.value)} 
              style={inputStyle(darkMode)} 
            />
            <div style={{ marginTop: 10 }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8,
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                color: currentTheme.textSecondary,
                transition: "all 0.3s ease"
              }}>
                <input 
                  type="checkbox" 
                  checked={waiveStripeFee} 
                  onChange={e => setWaiveStripeFee(e.target.checked)} 
                  style={{ 
                    width: 16, 
                    height: 16,
                    accentColor: "#3a86ff"
                  }}
                /> 
                Waive Stripe Fee
              </label>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{
          backgroundColor: currentTheme.summaryBg,
          padding: 25,
          borderRadius: 12,
          border: currentTheme.border,
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
          transition: "all 0.3s ease"
        }}>
          <h3 style={{ 
            fontSize: 18, 
            marginBottom: 15,
            color: currentTheme.textPrimary,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: "600"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#3a86ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Order Summary
          </h3>
          {summary.length === 0 ? (
            <p style={{ 
              color: currentTheme.textSecondary, 
              textAlign: "center", 
              padding: "10px 0",
              fontFamily: "'Inter', sans-serif"
            }}>
              Select products to see pricing breakdown
            </p>
          ) : (
            <>
              {summary.map(({ key, quantity, resaleWithTax }) => (
                <div key={key} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.3s ease"
                }}>
                  <span style={{ color: currentTheme.textSecondary }}>{key}</span>
                  <span style={{ fontWeight: "500", color: currentTheme.textPrimary }}>
                    {quantity} × ${resaleWithTax.toFixed(2)} CAD
                  </span>
                </div>
              ))}
              <div style={{ 
                margin: "15px 0",
                height: 1,
                backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                transition: "all 0.3s ease"
              }} />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.3s ease"
              }}>
                <span style={{ color: currentTheme.textSecondary }}>Service Charge</span>
                <span style={{ color: currentTheme.textPrimary }}>
                  {serviceCharge ? `$${serviceCharge} CAD` : "N/A"}
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.3s ease"
              }}>
                <span style={{ color: currentTheme.textSecondary }}>Stripe Fee</span>
                <span style={{ color: currentTheme.textPrimary }}>
                  ${stripeFee.toFixed(2)} CAD
                </span>
              </div>
              <div style={{ 
                marginTop: 20,
                padding: "15px",
                backgroundColor: currentTheme.highlight,
                borderRadius: 8,
                textAlign: "center",
                transition: "all 0.3s ease"
              }}>
                <div style={{ 
                  fontWeight: "600", 
                  fontSize: 18,
                  color: currentTheme.textPrimary,
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  Total: ${finalTotalCAD.toFixed(2)} CAD
                </div>
                <div style={{ 
                  fontSize: 16,
                  color: currentTheme.textSecondary,
                  marginTop: 5,
                  fontFamily: "'Inter', sans-serif"
                }}>
                  ≈ ₹{finalTotalINR.toFixed(0)} INR
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const btnStyle = (color, darkMode) => ({
  width: 36,
  height: 36,
  fontSize: 16,
  border: "none",
  borderRadius: 8,
  backgroundColor: color === "red" ? (darkMode ? "#ef4444" : "#e63946") : (darkMode ? "#10b981" : "#2a9d8f"),
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  fontFamily: "'Inter', sans-serif",
  fontWeight: "500",
  ":hover": {
    transform: "scale(1.05)",
    boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)"
  }
});

const inputStyle = (darkMode) => ({
  width: "100%",
  padding: "12px",
  marginTop: 8,
  fontSize: 14,
  borderRadius: 8,
  border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e9ecef",
  backgroundColor: darkMode ? "rgba(55,65,81,0.8)" : "white",
  transition: "all 0.3s ease",
  fontFamily: "'Inter', sans-serif",
  color: darkMode ? "#f3f4f6" : "#111827",
  ":focus": {
    outline: "none",
    borderColor: "#3a86ff",
    boxShadow: "0 0 0 3px rgba(58,134,255,0.2)"
  }
});

const labelStyle = (darkMode) => ({
  display: "block",
  marginBottom: 8,
  fontSize: 14,
  fontWeight: "500",
  color: darkMode ? "#d1d5db" : "#495057",
  fontFamily: "'Inter', sans-serif",
  transition: "all 0.3s ease"
});

export default App;
