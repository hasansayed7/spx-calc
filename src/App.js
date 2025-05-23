import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import etDark from "./assets/et_dark.svg";
import etWhite from "./assets/et_white.svg";

// Turquoise (feroza) hex code
const TURQUOISE = "#40E0D0";
const DARK_BG = "#232323";
const LIGHT_BG = "#f5f6fa";
const WHITE = "#fff";
const TEXT_DARK = "#232323";

const pricingData = {
  Desktop: { base: [ { min: 1, max: 25, cost: 5.88 }, { min: 26, max: 50, cost: 5.66 }, { min: 51, max: 100, cost: 5.35 }, { min: 101, max: 150, cost: 4.99 }, { min: 151, max: Infinity, cost: 4.66 } ] },
  VMs: { base: [ { min: 1, max: 25, cost: 30.00 }, { min: 26, max: 50, cost: 30.00 }, { min: 51, max: 100, cost: 30.00 }, { min: 101, max: 150, cost: 30.00 }, { min: 151, max: Infinity, cost: 27.76 } ] },
  SBS: { base: [ { min: 1, max: 25, cost: 24.05 }, { min: 26, max: 50, cost: 22.79 }, { min: 51, max: 100, cost: 21.13 }, { min: 101, max: 150, cost: 19.26 }, { min: 151, max: Infinity, cost: 17.72 } ] },
  "Physical Server": { base: [ { min: 1, max: 25, cost: 43.22 }, { min: 26, max: 50, cost: 40.14 }, { min: 51, max: 100, cost: 36.10 }, { min: 101, max: 150, cost: 31.51 }, { min: 151, max: Infinity, cost: 27.76 } ] }
};

const getBaseCost = (type, qty) => {
  const tier = pricingData[type].base.find(
    range => qty >= range.min && qty <= range.max
  );
  return tier ? tier.cost : 0;
};

const licenseOptions = [
  { key: "Desktop", label: "🖥 Desktop", feature: "Great for individual workstations" },
  { key: "VMs", label: "☁️ VMs", feature: "Scalable for virtual environments" },
  { key: "SBS", label: "🧑‍💼 SBS", feature: "Ideal for small business servers" },
  { key: "Physical Server", label: "🖨 Physical Server", feature: "Support for enterprise needs" }
];

function App() {
  const [quantities, setQuantities] = useState({
    Desktop: 0,
    VMs: 0,
    SBS: 0,
    "Physical Server": 0
  });
  const [markupPercent, setMarkupPercent] = useState(15);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [stripeWaived, setStripeWaived] = useState(false);
  const [taxPercent, setTaxPercent] = useState(13);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const updateQuantity = (key, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setQuantities(prev => ({
        ...prev,
        [key]: Math.max(0, numValue)
      }));
    }
  };

  const incrementQuantity = (key, delta) => {
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const handleMarkupChange = (value) => {
    const numValue = parseFloat(value) || 15;
    setMarkupPercent(Math.max(15, numValue));
  };

  const handleDiscountChange = (value) => {
    let numValue = parseFloat(value) || 0;
    if (numValue > 100) numValue = 100;
    if (numValue < 0) numValue = 0;
    setDiscountPercent(numValue);
  };

  const handleTaxChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setTaxPercent(Math.max(0, numValue));
  };

  let totalBeforeMarkup = 0;
  const summary = licenseOptions.map(({ key }) => {
    const qty = quantities[key];
    if (qty === 0) return null;
    const base = getBaseCost(key, qty);
    const subtotal = base * qty;
    totalBeforeMarkup += subtotal;
    return { key, quantity: qty, base, subtotal, taxed: base * (1 + taxPercent / 100) };
  }).filter(Boolean);

  const markupAmount = (totalBeforeMarkup * markupPercent) / 100;
  const totalAfterMarkup = totalBeforeMarkup + markupAmount;
  const discountAmount = (totalAfterMarkup * discountPercent) / 100;
  const totalAfterDiscount = totalAfterMarkup - discountAmount;
  const taxAmount = (totalAfterDiscount * taxPercent) / 100;
  const stripeFee = stripeWaived ? 0 : (totalAfterDiscount + taxAmount) * 0.029;
  const totalAfterTax = totalAfterDiscount + taxAmount + stripeFee;

  const theme = darkMode
    ? {
        bg: DARK_BG,
        cardBg: "#232323",
        textPrimary: "#fff",
        textSecondary: "#b2b7bb",
        accent: TURQUOISE,
        buttonPrimary: TURQUOISE,
        buttonSecondary: "#ff1744",
        inputBg: "#232323",
        border: "1.5px solid #343a3f",
        shadow: "0 4px 24px rgba(0,0,0,0.18)"
      }
    : {
        bg: LIGHT_BG,
        cardBg: WHITE,
        textPrimary: TEXT_DARK,
        textSecondary: "#5c6bc0",
        accent: TURQUOISE,
        buttonPrimary: TURQUOISE,
        buttonSecondary: "#ff1744",
        inputBg: "#f7fafc",
        border: "1.5px solid #e3e8f7",
        shadow: "0 4px 24px rgba(31, 38, 135, 0.06)"
      };

  const logoSrc = darkMode ? etDark : etWhite;

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      padding: '2vw 0',
      position: 'relative'
    }}>
      {/* Logo at top left */}
      <a
        href="https://excelytech.com"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          textDecoration: "none"
        }}
        aria-label="ExcelyTech Home"
      >
        <img
          src={logoSrc}
          alt="ExcelyTech Logo"
          style={{
            height: 44,
            width: "auto",
            display: "block"
          }}
        />
      </a>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        position: 'relative'
      }}>
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '2rem',
            background: theme.buttonPrimary,
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: theme.shadow,
            zIndex: 10,
            transition: 'background 0.3s'
          }}
        >
          {darkMode ? <FiSun size={22} /> : <FiMoon size={22} />}
        </button>

        <h1 style={{
          textAlign: 'center',
          fontSize: '2.4rem',
          fontWeight: 800,
          letterSpacing: '0.01em',
          margin: '0 0 2.5rem 0',
          color: theme.accent // Turquoise
        }}>
          ExcelyTech Pricing Calculator
        </h1>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          {licenseOptions.map(({ key, label, feature }) => {
            const qty = quantities[key];
            const base = getBaseCost(key, qty);
            const taxed = base * (1 + taxPercent / 100);

            return (
              <div key={key} style={{
                borderRadius: '1rem',
                boxShadow: theme.shadow,
                border: theme.border,
                background: theme.cardBg,
                padding: '2rem 1.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  marginBottom: '0.2rem',
                  color: theme.accent // Turquoise
                }}>{label}</h3>
                <div style={{
                  fontSize: '0.98rem',
                  color: theme.textSecondary,
                  marginBottom: '1.2rem'
                }}>{feature}</div>
                <div style={{ marginBottom: '1.2rem', minHeight: '2.5rem' }}>
                  {qty > 0 ? (
                    <>
                      <div style={{ fontSize: '1rem', color: theme.textPrimary }}>
                        <span style={{ opacity: 0.8 }}>Base:</span> <strong>${base.toFixed(2)} CAD</strong>
                      </div>
                      <div style={{ fontSize: '1rem', color: theme.textPrimary }}>
                        <span style={{ opacity: 0.8 }}>With Tax:</span> <strong>${taxed.toFixed(2)} CAD</strong>
                      </div>
                    </>
                  ) : (
                    <span style={{ color: theme.textSecondary, fontSize: '0.98rem' }}>
                      Select quantity to see price
                    </span>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  maxWidth: '220px',
                  margin: '0 auto'
                }}>
                  <button
                    onClick={() => incrementQuantity(key, -1)}
                    style={{
                      background: theme.buttonSecondary,
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'background 0.2s'
                    }}
                  >-</button>
                  <input
                    type="number"
                    value={qty}
                    min="0"
                    onChange={(e) => updateQuantity(key, e.target.value)}
                    style={{
                      width: '72px',
                      textAlign: 'center',
                      background: theme.inputBg,
                      border: theme.border,
                      borderRadius: '0.5rem',
                      color: theme.textPrimary,
                      fontWeight: 600,
                      padding: '0.6rem 0.5rem',
                      fontSize: '1.1rem',
                      outline: 'none',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                    }}
                  />
                  <button
                    onClick={() => incrementQuantity(key, 1)}
                    style={{
                      background: theme.buttonPrimary,
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'background 0.2s'
                    }}
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Config & Summary Side by Side */}
        <div
          style={{
            display: 'flex',
            gap: '2.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem'
          }}
        >
          {/* Pricing Configuration */}
          <div style={{
            flex: '1 1 320px',
            minWidth: '300px',
            maxWidth: '480px',
            padding: '2rem 1.5rem',
            borderRadius: '1rem',
            background: theme.cardBg,
            border: theme.border,
            boxShadow: theme.shadow
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1.2rem',
              color: theme.accent, // Turquoise
              letterSpacing: '0.01em'
            }}>
              Pricing Configuration
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div>
                <label style={{ fontWeight: 600, color: theme.textPrimary }}>
                  Markup Percentage (min 15%):{" "}
                  <input
                    type="number"
                    value={markupPercent}
                    min={15}
                    onChange={e => handleMarkupChange(e.target.value)}
                    style={{
                      marginLeft: '0.5rem',
                      width: '70px',
                      background: theme.inputBg,
                      border: theme.border,
                      borderRadius: '0.5rem',
                      color: theme.textPrimary,
                      padding: '0.35rem 0.7rem',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  />%
                </label>
              </div>
              <div>
                <label style={{ fontWeight: 600, color: theme.textPrimary }}>
                  Discount Percentage:{" "}
                  <input
                    type="number"
                    value={discountPercent}
                    min={0}
                    max={100}
                    onChange={e => handleDiscountChange(e.target.value)}
                    style={{
                      marginLeft: '0.5rem',
                      width: '70px',
                      background: theme.inputBg,
                      border: theme.border,
                      borderRadius: '0.5rem',
                      color: theme.textPrimary,
                      padding: '0.35rem 0.7rem',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  />%
                </label>
              </div>
              <div>
                <label style={{ fontWeight: 600, color: theme.textPrimary }}>
                  Tax Percentage:{" "}
                  <input
                    type="number"
                    value={taxPercent}
                    min={0}
                    onChange={e => handleTaxChange(e.target.value)}
                    style={{
                      marginLeft: '0.5rem',
                      width: '70px',
                      background: theme.inputBg,
                      border: theme.border,
                      borderRadius: '0.5rem',
                      color: theme.textPrimary,
                      padding: '0.35rem 0.7rem',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  />%
                </label>
              </div>
              <div>
                <label style={{ fontWeight: 600, color: theme.textPrimary }}>
                  <input
                    type="checkbox"
                    checked={stripeWaived}
                    onChange={() => setStripeWaived(v => !v)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Waive Stripe Fee (2.9%)
                </label>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div style={{
            flex: '2 1 420px',
            minWidth: '320px',
            maxWidth: '650px',
            padding: '2rem 1.5rem',
            borderRadius: '1rem',
            background: theme.cardBg,
            border: theme.border,
            boxShadow: theme.shadow
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1.2rem',
              color: theme.accent, // Turquoise
              letterSpacing: '0.01em'
            }}>
              Pricing Summary
            </h2>
            {summary.length === 0 ? (
              <div style={{ color: theme.textSecondary }}>
                No licenses selected yet.
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '1.5rem',
                fontSize: '1.07rem'
              }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.6rem 0', color: theme.textSecondary, fontWeight: 700 }}>Type</th>
                    <th style={{ textAlign: 'center', padding: '0.6rem 0', color: theme.textSecondary, fontWeight: 700 }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '0.6rem 0', color: theme.textSecondary, fontWeight: 700 }}>Base/Unit</th>
                    <th style={{ textAlign: 'right', padding: '0.6rem 0', color: theme.textSecondary, fontWeight: 700 }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map(item => (
                    <tr key={item.key}>
                      <td style={{ padding: '0.5rem 0', color: theme.textPrimary }}>{item.key}</td>
                      <td style={{ textAlign: 'center', padding: '0.5rem 0', color: theme.textPrimary }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem 0', color: theme.textPrimary }}>${item.base.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem 0', color: theme.textPrimary }}>${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, paddingTop: '0.8rem', color: theme.textSecondary }}>Total Before Markup</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, paddingTop: '0.8rem', color: theme.textPrimary }}>${totalBeforeMarkup.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', color: theme.textSecondary }}>Markup ({markupPercent}%)</td>
                    <td style={{ textAlign: 'right', color: theme.textPrimary }}>${markupAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', color: theme.textSecondary }}>Discount ({discountPercent}%)</td>
                    <td style={{ textAlign: 'right', color: theme.textPrimary }}>-${discountAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', color: theme.textSecondary }}>Tax ({taxPercent}%)</td>
                    <td style={{ textAlign: 'right', color: theme.textPrimary }}>${taxAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', color: theme.textSecondary }}>Stripe Fee {stripeWaived ? "(Waived)" : "(2.9%)"}</td>
                    <td style={{ textAlign: 'right', color: theme.textPrimary }}>${stripeFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 900, fontSize: '1.15rem', color: theme.textSecondary }}>Grand Total</td>
                    <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '1.15rem', color: theme.textPrimary }}>${totalAfterTax.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
      <style>
        {`
        @media (max-width: 900px) {
          div[style*="display: flex"][style*="gap: 2.5rem"] {
            flex-direction: column !important;
          }
        }
        `}
      </style>
    </div>
  );
}

export default App;
