import { useState, useEffect, useRef } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import emailjs from "@emailjs/browser";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import etDark from "./assets/et_dark.svg";
import etWhite from "./assets/et_white.svg";

const TURQUOISE = "#40E0D0";
const DARK_BG = "#232323";
const LIGHT_BG = "#f5f6fa";
const WHITE = "#fff";
const TEXT_DARK = "#232323";
const arcservePrice = 5.38;

const pricingData = {
  Desktop: { 
    base: [ 
      { min: 1, max: 25, cost: 5.88 }, 
      { min: 26, max: 50, cost: 5.66 }, 
      { min: 51, max: 100, cost: 5.35 }, 
      { min: 101, max: 150, cost: 4.99 }, 
      { min: 151, max: Infinity, cost: 4.66 } 
    ] 
  },
  VMs: { 
    base: [ 
      { min: 1, max: 25, cost: 30.00 }, 
      { min: 26, max: 50, cost: 30.00 }, 
      { min: 51, max: 100, cost: 30.00 }, 
      { min: 101, max: 150, cost: 30.00 }, 
      { min: 151, max: Infinity, cost: 27.76 } 
    ] 
  },
  SBS: { 
    base: [ 
      { min: 1, max: 25, cost: 24.05 }, 
      { min: 26, max: 50, cost: 22.79 }, 
      { min: 51, max: 100, cost: 21.13 }, 
      { min: 101, max: 150, cost: 19.26 }, 
      { min: 151, max: Infinity, cost: 17.72 } 
    ] 
  },
  "Physical Server": { 
    base: [ 
      { min: 1, max: 25, cost: 43.22 }, 
      { min: 26, max: 50, cost: 40.14 }, 
      { min: 51, max: 100, cost: 36.10 }, 
      { min: 101, max: 150, cost: 31.51 }, 
      { min: 151, max: Infinity, cost: 27.76 } 
    ] 
  }
};

const getBaseCost = (type, qty) => {
  const tier = pricingData[type]?.base.find(
    range => qty >= range.min && qty <= range.max
  );
  return tier ? tier.cost : 0;
};

const licenseOptions = [
  { key: "Desktop", label: "🖥 Desktop", feature: "Great for individual workstations" },
  { key: "VMs", label: "☁️ VMs", feature: "Scalable for virtual environments" },
  { key: "SBS", label: "🧑‍💼 SBS", feature: "Ideal for small business servers" },
  { key: "Physical Server", label: "🖨 Physical Server", feature: "Support for enterprise needs" },
  { key: "Arcserve", label: "🔐 Arcserve SaaS", feature: "Cloud backup solution" }
];

function App() {
  const [quantities, setQuantities] = useState({
    Desktop: 0,
    VMs: 0,
    SBS: 0,
    "Physical Server": 0,
    Arcserve: 0
  });
  const [markupPercent, setMarkupPercent] = useState(15);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [stripeWaived, setStripeWaived] = useState(false);
  const [taxPercent, setTaxPercent] = useState(13);
  const [darkMode, setDarkMode] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const [arcservePlatform, setArcservePlatform] = useState("Office365");
  const [arcserveCloud, setArcserveCloud] = useState("AWS");

  // EmailJS config
  const EMAILJS_SERVICE_ID = "service_vlucwqs";
  const EMAILJS_TEMPLATE_ID = "template_aohvrgo";
  const EMAILJS_PUBLIC_KEY = "t8u7O0F9f-vRqIYxy";

  // Email form fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [sending, setSending] = useState(false);

  // For capturing the summary HTML
  const summaryRef = useRef(null);

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
        shadow: "0 4px 24px rgba(0,0,0,0.18)",
        tableHeader: "#b2b7bb",
        tableBorder: "#444"
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
        shadow: "0 4px 24px rgba(31, 38, 135, 0.06)",
        tableHeader: "#666",
        tableBorder: "#ddd"
      };

  const logoSrc = darkMode ? etDark : etWhite;

  let totalBeforeMarkup = 0;
  const summary = [
    ...licenseOptions.map(({ key }) => {
      const qty = quantities[key];
      if (qty === 0) return null;
      const base = key === "Arcserve" ? arcservePrice : getBaseCost(key, qty);
      const baseWithTax = base * (1 + taxPercent / 100);
      const subtotal = isAnnual ? (baseWithTax * qty * 12) : (baseWithTax * qty);
      totalBeforeMarkup += subtotal;
      return { 
        key: key === "Arcserve" ? `Arcserve SaaS Backup (${arcservePlatform}, ${arcserveCloud})` : key, 
        quantity: qty, 
        base: isAnnual ? (baseWithTax * 12) : baseWithTax, 
        subtotal
      };
    }).filter(Boolean)
  ];

  const markupAmount = (totalBeforeMarkup * markupPercent) / 100;
  const totalAfterMarkup = totalBeforeMarkup + markupAmount;
  const discountAmount = (totalAfterMarkup * discountPercent) / 100;
  const totalAfterDiscount = totalAfterMarkup - discountAmount;
  const taxAmount = 0; // Now included in the unit price
  const stripeFee = stripeWaived ? 0 : (totalAfterDiscount) * 0.029;
  const totalAfterTax = totalAfterDiscount + stripeFee;

  // EmailJS send function
  const sendQuotationEmail = () => {
    if (!customerEmail || !customerName) {
      alert("Please enter customer name and email.");
      return;
    }
    setSending(true);
    const summaryHtml = summaryRef.current ? summaryRef.current.innerHTML : "";
    const templateParams = {
      customer_name: customerName,
      to_email: customerEmail,
      message: summaryHtml,
      billing_period: isAnnual ? "Annual (12 months)" : "Monthly"
    };
    emailjs
      .send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        setSending(false);
        alert("Quotation email sent successfully!");
      })
      .catch((error) => {
        setSending(false);
        alert("Failed to send email: " + error.text);
      });
  };

  // PDF export function (excludes markup)
  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;

    // Title
    doc.setFontSize(22);
    doc.setTextColor("#232323");
    doc.text("ExcelyTech Quotation", pageWidth / 2, y, { align: "center" });
    y += 32;

    // Billing period
    doc.setFontSize(14);
    doc.setTextColor("#666");
    doc.text(`Billing Period: ${isAnnual ? "Annual (12 months)" : "Monthly"}`, 40, y);
    y += 24;

    // Pricing Configuration (excluding markup)
    doc.setFontSize(13);
    doc.setTextColor("#444");
    doc.text(`Tax Percentage: ${taxPercent}%`, 40, y);
    y += 18;
    doc.text(`Discount Percentage: ${discountPercent}%`, 40, y);
    y += 18;
    doc.text(`Stripe Fee: ${stripeWaived ? "Waived" : "2.9%"}`, 40, y);
    y += 28;

    // Product Selections Table
    doc.setFontSize(15);
    doc.setTextColor("#232323");
    doc.text("Product Selection", 40, y);
    y += 14;

    // Table Headers
    doc.setFontSize(12);
    doc.setTextColor("#666");
    doc.text("Type", 40, y);
    doc.text("Qty", 210, y, { align: "right" });
    doc.text(`${isAnnual ? "Annual/Unit (with tax)" : "Base/Unit (with tax)"}`, 300, y, { align: "right" });
    doc.text("Subtotal", pageWidth - 40, y, { align: "right" });
    y += 12;

    doc.setDrawColor(180);
    doc.line(40, y, pageWidth - 40, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor("#232323");
    summary.forEach(item => {
      doc.text(item.key, 40, y);
      doc.text(String(item.quantity), 210, y, { align: "right" });
      doc.text(`$${item.base.toFixed(2)}`, 300, y, { align: "right" });
      doc.text(`$${item.subtotal.toFixed(2)}`, pageWidth - 40, y, { align: "right" });
      y += 16;
    });

    y += 12;
    doc.setDrawColor(200);
    doc.line(40, y, pageWidth - 40, y);
    y += 20;

    // Pricing Summary (excluding markup)
    doc.setFontSize(13);
    doc.setTextColor("#444");
    doc.text(`Total Before Discount: $${totalAfterMarkup.toFixed(2)}`, pageWidth - 40, y, { align: "right" }); y += 18;
    doc.text(`Discount (${discountPercent}%): -$${discountAmount.toFixed(2)}`, pageWidth - 40, y, { align: "right" }); y += 18;
    doc.text(`Stripe Fee: $${stripeFee.toFixed(2)}`, pageWidth - 40, y, { align: "right" }); y += 18;

    doc.setFontSize(15);
    doc.setTextColor("#232323");
    y += 10;
    doc.text(`Grand Total: $${totalAfterTax.toFixed(2)}`, pageWidth - 40, y, { align: "right" });

    y += 36;
    doc.setFontSize(12);
    doc.setTextColor("#888");
    doc.text("If you have any questions or require adjustments, please contact info@excelytech.com", 40, y);

    doc.save(`ExcelyTech_Quotation_${isAnnual ? "Annual" : "Monthly"}.pdf`);
  };

  const renderPriceTable = (type) => {
    if (type === "Arcserve") {
      return (
        <div style={{ 
          marginTop: '0.5rem',
          fontSize: '0.85rem',
          color: theme.textSecondary,
          lineHeight: '1.4',
          width: '100%'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8rem'
          }}>
            <tbody>
              <tr>
                <td style={{ 
                  padding: '0.25rem 0',
                  borderBottom: `1px solid ${theme.tableBorder}`,
                  fontWeight: 600
                }}>Flat Rate:</td>
                <td style={{ 
                  padding: '0.25rem 0',
                  borderBottom: `1px solid ${theme.tableBorder}`,
                  textAlign: 'right'
                }}>
                  ${arcservePrice.toFixed(2)}/{isAnnual ? (arcservePrice * 12).toFixed(2) : 'mo'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    const slabs = pricingData[type]?.base || [];
    return (
      <div style={{ 
        marginTop: '0.5rem',
        fontSize: '0.85rem',
        color: theme.textSecondary,
        lineHeight: '1.4',
        width: '100%'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.8rem'
        }}>
          <thead>
            <tr>
              <th style={{ 
                padding: '0.25rem 0',
                borderBottom: `1px solid ${theme.tableBorder}`,
                textAlign: 'left',
                fontWeight: 600
              }}>Qty Range</th>
              <th style={{ 
                padding: '0.25rem 0',
                borderBottom: `1px solid ${theme.tableBorder}`,
                textAlign: 'right',
                fontWeight: 600
              }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {slabs.map((slab, index) => (
              <tr key={index}>
                <td style={{ 
                  padding: '0.25rem 0',
                  borderBottom: `1px solid ${theme.tableBorder}`
                }}>
                  {slab.min === 1 && slab.max === 25 && "1-25"}
                  {slab.min === 26 && slab.max === 50 && "26-50"}
                  {slab.min === 51 && slab.max === 100 && "51-100"}
                  {slab.min === 101 && slab.max === 150 && "101-150"}
                  {slab.min === 151 && slab.max === Infinity && "151+"}
                </td>
                <td style={{ 
                  padding: '0.25rem 0',
                  borderBottom: `1px solid ${theme.tableBorder}`,
                  textAlign: 'right'
                }}>
                  ${slab.cost.toFixed(2)}/{isAnnual ? (slab.cost * 12).toFixed(2) : 'mo'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      padding: 0,
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

      <div className="main-container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2.5rem 24px 0 24px',
        position: 'relative',
        boxSizing: 'border-box'
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
          color: theme.accent
        }}>
          ExcelyTech Pricing Calculator
        </h1>

        {/* Pricing Cards */}
        <div className="card-row">
          {licenseOptions.map(({ key, label, feature }) => {
            const qty = quantities[key];
            const base = key === "Arcserve" ? arcservePrice : getBaseCost(key, qty);
            const displayBase = isAnnual ? base * 12 : base;
            const taxed = isAnnual ? (base * (1 + taxPercent / 100) * 12) : (base * (1 + taxPercent / 100));

            return (
              <div key={key} className="card">
                <h3 className="card-title" style={{ color: theme.accent }}>{label}</h3>
                <div className="card-feature" style={{ color: theme.textSecondary }}>{feature}</div>
                <div style={{ marginBottom: '1.2rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center' }}>
                  {qty > 0 ? (
                    <>
                      <div style={{ fontSize: '1rem', color: theme.textPrimary }}>
                        <span style={{ opacity: 0.8 }}>Base:</span> <strong>${displayBase.toFixed(2)} CAD</strong>
                      </div>
                      <div style={{ fontSize: '1rem', color: theme.textPrimary, marginLeft: 16 }}>
                        <span style={{ opacity: 0.8 }}>With Tax:</span> <strong>${taxed.toFixed(2)} CAD</strong>
                      </div>
                    </>
                  ) : (
                    <span style={{ color: theme.textSecondary, fontSize: '0.98rem' }}>
                      Select quantity to see price
                    </span>
                  )}
                </div>
                
                {/* Price table section */}
                {renderPriceTable(key)}
                
                {key === "Arcserve" && (
                  <div className="arcserve-dropdowns">
                    <div>
                      <label className="dropdown-label" style={{ color: theme.tableHeader }}>Platform:</label>
                      <select
                        value={arcservePlatform}
                        onChange={e => setArcservePlatform(e.target.value)}
                        className="dropdown-select"
                        style={{
                          background: theme.inputBg,
                          color: theme.textPrimary,
                          border: theme.border
                        }}
                      >
                        <option value="Office365">Office365</option>
                        <option value="G-Suite">G-Suite</option>
                      </select>
                    </div>
                    <div>
                      <label className="dropdown-label" style={{ color: theme.tableHeader }}>Cloud:</label>
                      <select
                        value={arcserveCloud}
                        onChange={e => setArcserveCloud(e.target.value)}
                        className="dropdown-select"
                        style={{
                          background: theme.inputBg,
                          color: theme.textPrimary,
                          border: theme.border
                        }}
                      >
                        <option value="AWS">AWS</option>
                        <option value="Azure">Azure</option>
                      </select>
                    </div>
                  </div>
                )}
                
                <div className="card-actions">
                  <button
                    onClick={() => incrementQuantity(key, -1)}
                    className="card-btn minus"
                    style={{ background: theme.buttonSecondary }}
                  >-</button>
                  <input
                    type="number"
                    value={qty}
                    min="0"
                    onChange={(e) => updateQuantity(key, e.target.value)}
                    className="card-input"
                    style={{
                      background: theme.inputBg,
                      border: theme.border,
                      color: theme.textPrimary
                    }}
                  />
                  <button
                    onClick={() => incrementQuantity(key, 1)}
                    className="card-btn plus"
                    style={{ background: theme.buttonPrimary }}
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Email & PDF Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5rem',
          margin: '2rem 0 1.5rem 0',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Customer Name"
            style={{
              padding: '0.7rem 1rem',
              borderRadius: 8,
              border: theme.border,
              background: theme.inputBg,
              color: theme.textPrimary,
              fontSize: '1rem',
              width: 220
            }}
          />
          <input
            type="email"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            placeholder="Customer Email"
            style={{
              padding: '0.7rem 1rem',
              borderRadius: 8,
              border: theme.border,
              background: theme.inputBg,
              color: theme.textPrimary,
              fontSize: '1rem',
              width: 260
            }}
          />
          <button
            onClick={sendQuotationEmail}
            disabled={sending}
            style={{
              background: theme.buttonPrimary,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.8rem 2.2rem",
              fontWeight: 700,
              fontSize: "1.08rem",
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending ? 0.7 : 1,
              boxShadow: theme.shadow
            }}
          >
            {sending ? "Sending..." : "Send Quotation Email"}
          </button>
          <button
            onClick={exportPDF}
            style={{
              background: theme.buttonPrimary,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.8rem 2.2rem",
              fontWeight: 700,
              fontSize: "1.08rem",
              cursor: "pointer",
              boxShadow: theme.shadow
            }}
          >
            Download Quotation PDF
          </button>
        </div>

        {/* Pricing Config & Summary Side by Side */}
        <div className="bottom-row">
          {/* Pricing Configuration */}
          <div className="bottom-card" style={{
            background: theme.cardBg,
            border: theme.border,
            boxShadow: theme.shadow
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1.2rem',
              color: theme.accent,
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
                <label style={{ fontWeight: 600, color: theme.tableHeader }}>
                  <input
                    type="checkbox"
                    checked={isAnnual}
                    onChange={() => setIsAnnual(v => !v)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Annual Billing (12 months upfront)
                </label>
              </div>
              <div>
                <label style={{ fontWeight: 600, color: theme.tableHeader }}>
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
                <label style={{ fontWeight: 600, color: theme.tableHeader }}>
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
                <label style={{ fontWeight: 600, color: theme.tableHeader }}>
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
                <label style={{ fontWeight: 600, color: theme.tableHeader }}>
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
          <div className="bottom-card" style={{
            background: theme.cardBg,
            border: theme.border,
            boxShadow: theme.shadow
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1.2rem',
              color: theme.accent,
              letterSpacing: '0.01em'
            }}>
              Pricing Summary {isAnnual ? "(Annual)" : "(Monthly)"}
            </h2>
            <div ref={summaryRef} id="quote-summary">
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
                      <th style={{ textAlign: 'left', padding: '0.6rem 0', color: theme.tableHeader, fontWeight: 700 }}>Type</th>
                      <th style={{ textAlign: 'center', padding: '0.6rem 0', color: theme.tableHeader, fontWeight: 700 }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '0.6rem 0', color: theme.tableHeader, fontWeight: 700 }}>{isAnnual ? "Annual/Unit (with tax)" : "Base/Unit (with tax)"}</th>
                      <th style={{ textAlign: 'right', padding: '0.6rem 0', color: theme.tableHeader, fontWeight: 700 }}>Subtotal</th>
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
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, paddingTop: '0.8rem', color: theme.tableHeader }}>Total Before Markup</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, paddingTop: '0.8rem', color: theme.textPrimary }}>${totalBeforeMarkup.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', color: theme.tableHeader }}>Markup ({markupPercent}%)</td>
                      <td style={{ textAlign: 'right', color: theme.textPrimary }}>${markupAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', color: theme.tableHeader }}>Discount ({discountPercent}%)</td>
                      <td style={{ textAlign: 'right', color: theme.textPrimary }}>-${discountAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', color: theme.tableHeader }}>Stripe Fee {stripeWaived ? "(Waived)" : "(2.9%)"}</td>
                      <td style={{ textAlign: 'right', color: theme.textPrimary }}>${stripeFee.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 900, fontSize: '1.15rem', color: theme.tableHeader }}>Grand Total</td>
                      <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '1.15rem', color: theme.textPrimary }}>${totalAfterTax.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
        .main-container {
          box-sizing: border-box;
        }
        .card-row {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 2rem;
          margin-bottom: 2.5rem;
          flex-wrap: nowrap;
        }
        .card {
          background: ${theme.cardBg};
          border: ${theme.border};
          box-shadow: ${theme.shadow};
          border-radius: 1rem;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          width: 19.2%;
          min-width: 200px;
          max-width: 100%;
          min-height: 410px;
          box-sizing: border-box;
        }
        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }
        .card-feature {
          font-size: 0.98rem;
          margin-bottom: 1.2rem;
        }
        .card-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          margin-top: auto;
          box-sizing: border-box;
        }
        .card-btn, .card-input {
          min-width: 0;
          box-sizing: border-box;
        }
        .card-btn {
          flex: 0 0 44px;
          width: 44px;
          height: 44px;
          border-radius: 0.5rem;
          font-size: 1.3rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-input {
          flex: 1 1 48px;
          min-width: 40px;
          max-width: 60px;
          text-align: center;
          border-radius: 0.5rem;
          font-weight: 600;
          padding: 0.6rem 0.5rem;
          font-size: 1.1rem;
          outline: none;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .arcserve-dropdowns {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .dropdown-label {
          font-weight: 600;
          margin-right: 8px;
          display: block;
          margin-bottom: 4px;
          font-size: 0.9rem;
          color: ${theme.tableHeader};
        }
        .dropdown-select {
          width: 100%;
          padding: 0.5rem 0.7rem;
          border-radius: 6px;
          font-size: 0.95rem;
          background: ${theme.inputBg};
          color: ${theme.textPrimary};
          border: ${theme.border};
        }
        .bottom-row {
          display: flex;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .bottom-card {
          flex: 1 1 0;
          min-width: 0;
          max-width: 100%;
          padding: 2rem 1.5rem;
          border-radius: 1rem;
          box-sizing: border-box;
        }
        @media (max-width: 1200px) {
          .card-row {
            gap: 1.2rem;
          }
          .card {
            width: 23%;
            min-width: 180px;
          }
          .bottom-row {
            gap: 1.2rem;
          }
        }
        @media (max-width: 900px) {
          .main-container {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .card-row {
            flex-wrap: wrap;
            gap: 1rem;
          }
          .card {
            width: 48%;
            min-width: 180px;
            margin-bottom: 1rem;
          }
          .bottom-row {
            flex-direction: column;
            gap: 1rem;
          }
        }
        @media (max-width: 700px) {
          .card-row {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .card {
            width: 100%;
            min-width: 0;
            max-width: 100%;
          }
          .arcserve-dropdowns {
            flex-direction: column;
            gap: 10px;
          }
          .bottom-row {
            flex-direction: column;
            gap: 1rem;
          }
        }
        `}
      </style>
    </div>
  );
}

export default App;