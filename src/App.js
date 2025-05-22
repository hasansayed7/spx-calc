import { useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const products = [
  { id: 'desktop', name: 'Desktop', desc: 'Great for individual workstations', icon: '🖥', price: 5.88 },
  { id: 'vms', name: 'VMs', desc: 'Scalable for virtual environments', icon: '☁️', price: 30.00 },
  { id: 'sbs', name: 'SBS', desc: 'Ideal for small business servers', icon: '🧑‍💼', price: 24.05 },
  { id: 'server', name: 'Physical Server', desc: 'Support for enterprise needs', icon: '🖨', price: 43.22 }
];

export default function App() {
  const [quantities, setQuantities] = useState({
    desktop: 0, vms: 0, sbs: 0, server: 0
  });
  const [markup, setMarkup] = useState(15);
  const [tax, setTax] = useState(13);
  const [darkMode, setDarkMode] = useState(false);

  // Calculations
  const subtotal = products.reduce((sum, p) => sum + (p.price * quantities[p.id]), 0);
  const markupAmount = subtotal * (markup / 100);
  const subtotalWithMarkup = subtotal + markupAmount;
  const taxAmount = subtotalWithMarkup * (tax / 100);
  const total = subtotalWithMarkup + taxAmount;

  const updateQuantity = (id, value) => {
    const num = typeof value === 'number' 
      ? Math.max(0, quantities[id] + value)
      : Math.max(0, parseInt(value) || 0);
    setQuantities(prev => ({ ...prev, [id]: num }));
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <FiSun /> : <FiMoon />}
      </button>

      <h1>License Pricing Calculator</h1>

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <span className="product-icon">{product.icon}</span>
              <h3>{product.name}</h3>
            </div>
            <p>{product.desc}</p>
            
            {quantities[product.id] > 0 && (
              <div className="price-info">
                <span>${product.price.toFixed(2)} each</span>
              </div>
            )}

            <div className="quantity-control">
              <button onClick={() => updateQuantity(product.id, -1)}>-</button>
              <input
                type="number"
                value={quantities[product.id]}
                onChange={(e) => updateQuantity(product.id, e.target.value)}
                min="0"
              />
              <button onClick={() => updateQuantity(product.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="config-section">
        <div className="config-card">
          <label>Markup Percentage</label>
          <input
            type="number"
            value={markup}
            onChange={(e) => setMarkup(Math.max(15, parseFloat(e.target.value) || 15))}
            min="15"
          />
          <div className="config-value">Markup: ${markupAmount.toFixed(2)}</div>
        </div>

        <div className="config-card">
          <label>Tax Percentage</label>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
            min="0"
          />
          <div className="config-value">Tax: ${taxAmount.toFixed(2)}</div>
        </div>
      </div>

      <div className="summary">
        <h2>Pricing Summary</h2>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Markup ({markup}%):</span>
          <span>${markupAmount.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Subtotal with Markup:</span>
          <span>${subtotalWithMarkup.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax ({tax}%):</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
