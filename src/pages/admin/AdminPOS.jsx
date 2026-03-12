import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI, orderAPI } from "../../services/api";
import toast from "react-hot-toast";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="col">
      <div className="card h-100 border-0 shadow-sm p-3 placeholder-glow text-center">
        <div className="placeholder rounded mx-auto mb-2" style={{ width: 72, height: 72 }} />
        <div className="placeholder rounded col-10 mx-auto mb-1" style={{ height: 12 }} />
        <div className="placeholder rounded col-6 mx-auto" style={{ height: 12 }} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   UPI MODAL – fully responsive
──────────────────────────────────────────────────────────── */
function UPIModal({ show, upiLink, total, orderId, onPaid, onFailed, onClose }) {
  const [phase, setPhase] = useState("qr");
  const [marking, setMarking] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    if (show && orderId) { setPhase("qr"); setMarking(false); }
    if (!show) stopPoll();
    // eslint-disable-next-line
  }, [show, orderId]);

  const stopPoll = () => { clearInterval(pollRef.current); pollRef.current = null; };

  const startPolling = () => {
    setPhase("polling");
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await orderAPI.getPaymentStatus(orderId);
        const s = (data.paymentStatus || "").toUpperCase();
        if (s === "SUCCESS") { stopPoll(); setPhase("success"); setTimeout(() => { onPaid(); }, 1800); }
        else if (s === "FAILED") { stopPoll(); setPhase("failed"); setTimeout(() => { onFailed(); }, 1800); }
      } catch { /* keep polling */ }
    }, 3000);
  };

  const handleMarkPaid = async () => {
    setMarking(true);
    try {
      await orderAPI.markPaid(orderId, { transactionId: "MANUAL" });
      stopPoll(); setPhase("success"); setTimeout(() => { onPaid(); }, 1800);
    } catch { toast.error("Could not confirm payment. Try again."); }
    finally { setMarking(false); }
  };

  const handleMarkFailed = async () => {
    setMarking(true);
    try {
      await orderAPI.markFailed(orderId);
      stopPoll(); setPhase("failed"); setTimeout(() => { onFailed(); }, 1800);
    } catch { toast.error("Could not cancel payment."); }
    finally { setMarking(false); }
  };

  useEffect(() => () => stopPoll(), []);

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
      <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable px-3 px-sm-0" style={{ maxWidth: 420 }}>
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">

            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold" style={{ fontSize: "clamp(14px, 4vw, 18px)" }}>
                {phase === "qr"      && <><i className="bi bi-phone me-2 text-danger" />UPI Payment</>}
                {phase === "polling" && <><i className="bi bi-hourglass-split me-2 text-warning" />Waiting for Payment…</>}
                {phase === "success" && <><i className="bi bi-check-circle-fill me-2 text-success" />Payment Confirmed</>}
                {phase === "failed"  && <><i className="bi bi-x-circle-fill me-2 text-danger" />Payment Cancelled</>}
              </h5>
              {phase === "qr" && <button type="button" className="btn-close" onClick={onClose} />}
            </div>

            <div className="modal-body text-center px-3 px-sm-4 pb-4">
              {phase === "qr" && (
                <>
                  <p className="text-muted small mb-3">Show this QR to the customer to scan with any UPI app</p>
                  <div className="d-inline-block p-2 p-sm-3 rounded-3 mb-3" style={{ background: "#f8f9fa", border: "2px dashed #dee2e6" }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`}
                      alt="UPI QR" className="rounded-2"
                      style={{ width: "min(200px, 60vw)", height: "min(200px, 60vw)" }}
                    />
                  </div>
                  <div className="rounded-3 py-3 mb-4" style={{ background: "#fff5f5" }}>
                    <div className="text-muted small">Amount</div>
                    <div className="fw-black text-danger" style={{ fontSize: "clamp(22px, 6vw, 32px)" }}>₹{fmt(total)}</div>
                  </div>
                  <button className="btn btn-danger w-100 fw-bold py-2 rounded-3 mb-2" onClick={startPolling}>
                    <i className="bi bi-arrow-repeat me-2" />Customer Scanned — Start Checking
                  </button>
                  <button className="btn btn-outline-secondary w-100 py-2 rounded-3" onClick={onClose}>Cancel</button>
                </>
              )}

              {phase === "polling" && (
                <div className="py-2">
                  <div className="d-flex align-items-center justify-content-center mb-4"
                    style={{ width: 80, height: 80, borderRadius: "50%", background: "#fefce8", margin: "0 auto", boxShadow: "0 0 0 10px rgba(253,224,71,.2)" }}>
                    <div className="spinner-border text-warning" style={{ width: 32, height: 32 }} />
                  </div>
                  <h6 className="fw-bold mb-1">Checking payment status…</h6>
                  <p className="text-muted small mb-4">Automatically checking every 3 seconds.<br />Once customer pays, this will update instantly.</p>
                  <div className="rounded-3 py-3 mb-4" style={{ background: "#fefce8" }}>
                    <div className="text-muted small">Amount</div>
                    <div className="fw-black" style={{ color: "#a16207", fontSize: "clamp(20px, 5vw, 28px)" }}>₹{fmt(total)}</div>
                  </div>
                  <button className="btn btn-success w-100 fw-bold py-2 rounded-3 mb-2" onClick={handleMarkPaid} disabled={marking}>
                    {marking ? <><span className="spinner-border spinner-border-sm me-2" />Confirming…</> : <><i className="bi bi-check-circle-fill me-2" />Payment Received — Confirm</>}
                  </button>
                  <button className="btn btn-outline-danger w-100 py-2 rounded-3" onClick={handleMarkFailed} disabled={marking}>
                    <i className="bi bi-x-circle me-2" />Customer Didn't Pay — Cancel
                  </button>
                </div>
              )}

              {phase === "success" && (
                <div className="py-3">
                  <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#bbf7d0,#4ade80)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 0 12px rgba(74,222,128,.15)", animation: "popIn .4s cubic-bezier(.34,1.56,.64,1) both" }}>
                    <i className="bi bi-check-lg text-white" style={{ fontSize: 40 }} />
                  </div>
                  <h4 className="fw-black text-success mb-1">Payment Received!</h4>
                  <p className="text-muted small mb-3">UPI payment confirmed. Invoice opening…</p>
                  <div className="rounded-3 py-3" style={{ background: "#f0fdf4" }}>
                    <div className="text-muted small">Amount Paid</div>
                    <div className="fw-black text-success" style={{ fontSize: "clamp(22px, 6vw, 32px)" }}>₹{fmt(total)}</div>
                  </div>
                </div>
              )}

              {phase === "failed" && (
                <div className="py-3">
                  <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#fecaca,#f87171)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 0 12px rgba(248,113,113,.15)", animation: "popIn .4s cubic-bezier(.34,1.56,.64,1) both" }}>
                    <i className="bi bi-x-lg text-white" style={{ fontSize: 34 }} />
                  </div>
                  <h4 className="fw-black text-danger mb-1">Payment Cancelled</h4>
                  <p className="text-muted small">The order has been cancelled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────────────────── */
export default function AdminPOS() {
  const [products, setProducts]     = useState([]);
  const [search, setSearch]         = useState("");
  const [cart, setCart]             = useState([]);
  const [discount, setDiscount]     = useState({ type: "percent", value: 0 });
  const [customer, setCustomer]     = useState({ name: "", phone: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [taxRate, setTaxRate]       = useState(0);
  const [notes, setNotes]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [searching, setSearching]   = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [cartOpen, setCartOpen]     = useState(false); // mobile cart drawer

  const navigate = useNavigate();

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const discountAmount =
    discount.type === "percent"
      ? Math.round(((subtotal + taxAmount) * discount.value) / 100)
      : Math.min(Number(discount.value), subtotal + taxAmount);
  const total = subtotal + taxAmount - discountAmount;

  const upiID     = "www.vishalsonwane3@ybl";
  const payeeName = "Shakti Toys";
  const upiLink   = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR`;

  useEffect(() => {
    setSearching(true);
    productAPI
      .getAll({ search, limit: 30, isActive: true })
      .then((r) => setProducts(r.data.products || r.data || []))
      .finally(() => setSearching(false));
  }, [search]);

  const resetSale = () => {
    setCart([]); setCustomer({ name: "", phone: "", email: "" });
    setDiscount({ type: "percent", value: 0 }); setNotes("");
    setPendingOrderId(null); setCartOpen(false);
  };

  const addToCart = (product) => {
    if (product.stock <= 0) { toast.error("Out of stock!"); return; }
    setCart((prev) => {
      const existing = prev.find((i) => i.product === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) { toast.error(`Only ${product.stock} in stock`); return prev; }
        return prev.map((i) => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product: product._id, name: product.name, price: product.price, image: product.images?.[0] || "", quantity: 1, maxStock: product.stock }];
    });
    toast.success(`${product.name} added!`, { duration: 900 });
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart((prev) => prev.map((i) => {
      if (i.product !== productId) return i;
      if (qty > i.maxStock) { toast.error(`Only ${i.maxStock} in stock`); return i; }
      return { ...i, quantity: qty };
    }));
  };

  const removeFromCart = (productId) => setCart((prev) => prev.filter((i) => i.product !== productId));

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error("Cart is empty!"); return; }
    setLoading(true);
    try {
      const { data } = await orderAPI.createOffline({
        orderItems: cart.map((i) => ({ product: i.product, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        paymentMethod,
        itemsPrice: subtotal, taxPrice: taxAmount, discountAmount,
        discountPercent: discount.type === "percent" ? discount.value : 0,
        totalPrice: total,
        customerName: customer.name || "Walk-in Customer",
        customerPhone: customer.phone || "",
        customerEmail: customer.email || "",
        notes,
      });
      if (paymentMethod === "OFFLINE_UPI") {
        setPendingOrderId(data._id);
        setShowUPIModal(true);
      } else {
        toast.success("Sale completed! Opening invoice…");
        window.open(`/invoice/${data._id}`, "_blank");
        resetSale();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPaid = () => {
    toast.success("UPI payment confirmed! 🎉");
    if (pendingOrderId) window.open(`/invoice/${pendingOrderId}`, "_blank");
    setShowUPIModal(false); resetSale();
  };

  const handleUPIFailed = () => { toast.error("Payment cancelled."); setShowUPIModal(false); resetSale(); };
  const handleModalClose = () => setShowUPIModal(false);

  /* ── Cart Panel (shared markup, used in both sidebar and drawer) ── */
  const CartPanel = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="pos-right-body">
        {/* Customer */}
        <div className="sec-label"><i className="bi bi-person-fill me-1" />Customer Details</div>
        <div className="row g-2 mb-2">
          <div className="col-6">
            <input className="form-control form-control-sm pos-input" placeholder="Customer name"
              value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
          </div>
          <div className="col-6">
            <input className="form-control form-control-sm pos-input" placeholder="Phone"
              value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
          </div>
          <div className="col-12">
            <input className="form-control form-control-sm pos-input" placeholder="Email (optional)"
              value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
          </div>
        </div>

        <div className="pos-divider" />

        {/* Cart header */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="sec-label mb-0">
            <i className="bi bi-cart3 me-1" />Cart
            {cart.length > 0 && <span className="badge bg-danger rounded-pill ms-2" style={{ fontSize: 10 }}>{cart.length}</span>}
          </div>
          {cart.length > 0 && (
            <button className="btn btn-link p-0 text-danger text-decoration-none" style={{ fontSize: 12 }} onClick={() => setCart([])}>Clear all</button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-4 mb-1" style={{ color: "rgba(255,255,255,.22)" }}>
            <i className="bi bi-cart" style={{ fontSize: 38 }} />
            <div className="mt-2" style={{ fontSize: 13 }}>Cart is empty</div>
            <div style={{ fontSize: 11, opacity: .75 }}>Click products to add them</div>
          </div>
        ) : (
          <div className="mb-1">
            {cart.map((item) => (
              <div key={item.product} className="cart-row anim">
                <img src={item.image || "https://via.placeholder.com/44"} alt={item.name}
                  className="rounded-2 object-fit-cover flex-shrink-0" style={{ width: 42, height: 42 }} />
                <div className="flex-grow-1 overflow-hidden">
                  <div className="fw-semibold text-white text-truncate" style={{ fontSize: 12.5 }}>{item.name}</div>
                  <small style={{ color: "rgba(255,255,255,.38)" }}>₹{fmt(item.price)}/unit</small>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQty(item.product, item.quantity - 1)}>−</button>
                  <input type="number" className="qty-input" value={item.quantity}
                    onChange={(e) => updateQty(item.product, parseInt(e.target.value) || 0)} />
                  <button className="qty-btn" onClick={() => updateQty(item.product, item.quantity + 1)}>+</button>
                </div>
                <div className="fw-bold text-white flex-shrink-0" style={{ fontSize: 13, minWidth: 52, textAlign: "right" }}>
                  ₹{fmt(item.price * item.quantity)}
                </div>
                <button className="btn btn-link p-0 ms-1" style={{ color: "#f87171", fontSize: 15, lineHeight: 1 }}
                  onClick={() => removeFromCart(item.product)}>
                  <i className="bi bi-trash3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pos-divider" />

        {/* Billing */}
        <div className="sec-label"><i className="bi bi-calculator me-1" />Billing Options</div>
        <div className="row g-2 mb-2">
          <div className="col-6">
            <label className="form-label mb-1" style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>Discount</label>
            <div className="input-group input-group-sm">
              <select className="form-select pos-input flex-grow-0" style={{ width: 54, flexShrink: 0 }}
                value={discount.type} onChange={(e) => setDiscount({ ...discount, type: e.target.value })}>
                <option value="percent">%</option>
                <option value="flat">₹</option>
              </select>
              <input type="number" className="form-control pos-input" placeholder="0" min={0}
                value={discount.value} onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="col-6">
            <label className="form-label mb-1" style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>Tax %</label>
            <input type="number" className="form-control form-control-sm pos-input" placeholder="0" min={0}
              value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="mb-1">
          <label className="form-label mb-1" style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>Order Notes</label>
          <textarea className="form-control form-control-sm pos-input" rows={2}
            placeholder="Any special instructions…" value={notes}
            onChange={(e) => setNotes(e.target.value)} style={{ resize: "none" }} />
        </div>

        <div className="pos-divider" />

        {/* Payment method */}
        <div className="sec-label"><i className="bi bi-credit-card me-1" />Payment Method</div>
        <div className="d-flex gap-2 mb-1">
          {[
            { id: "CASH",        label: "Cash", icon: "bi-cash-coin" },
            { id: "CARD",        label: "Card", icon: "bi-credit-card-2-front" },
            { id: "OFFLINE_UPI", label: "UPI",  icon: "bi-phone" },
          ].map((m) => (
            <button key={m.id}
              className={`pay-btn btn${paymentMethod === m.id ? " active" : ""}`}
              onClick={() => setPaymentMethod(m.id)}>
              <i className={`bi ${m.icon} d-block mb-1`} style={{ fontSize: 18 }} />
              {m.label}
            </button>
          ))}
        </div>

        <div className="pos-divider" />

        {/* Summary */}
        <div className="sec-label"><i className="bi bi-receipt me-1" />Order Summary</div>
        <div className="sum-row">
          <span>Subtotal</span>
          <span className="text-white fw-semibold">₹{fmt(subtotal)}</span>
        </div>
        {taxAmount > 0 && (
          <div className="sum-row">
            <span>Tax ({taxRate}%)</span>
            <span className="text-white fw-semibold">+₹{fmt(taxAmount)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="sum-row">
            <span>Discount</span>
            <span className="fw-semibold" style={{ color: "#4ade80" }}>−₹{fmt(discountAmount)}</span>
          </div>
        )}
        <div className="sum-total mb-0">
          <span>Total</span>
          <span>₹{fmt(total)}</span>
        </div>
      </div>

      {/* Checkout button */}
      <div className="px-3 pb-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          style={{
            background: cart.length > 0 ? "linear-gradient(135deg,#e63946 0%,#c1121f 100%)" : undefined,
            boxShadow: cart.length > 0 ? "0 6px 22px rgba(230,57,70,.45)" : undefined,
          }}
        >
          {loading
            ? <><span className="spinner-border spinner-border-sm me-2" />Creating order…</>
            : cart.length === 0
            ? "Add items to cart"
            : <><i className="bi bi-printer-fill me-2" />Complete Sale — ₹{fmt(total)}</>
          }
        </button>
      </div>
    </div>
  );

  /* ─────────────────── RENDER ─────────────────────────────── */
  return (
    <>
      <style>{`
        :root {
          --pos-dark:   #0f1b35;
          --pos-accent: #e63946;
          --pos-muted:  rgba(255,255,255,0.42);
          --pos-border: rgba(255,255,255,0.1);
        }

        /* ── Root layout ── */
        .pos-root {
          height: calc(100vh - 64px);
          display: flex;
          overflow: hidden;
          background: #f0f2f7;
          position: relative;
        }

        /* ── Left: product grid ── */
        .pos-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 16px 14px 12px 16px;
          min-width: 0;
        }

        /* ── Search ── */
        .pos-search .bi-search {
          position: absolute; top: 50%; left: 13px;
          transform: translateY(-50%);
          color: #adb5bd; font-size: 15px; pointer-events: none;
        }
        .pos-search input {
          padding-left: 38px !important;
          border-radius: 12px !important;
          border: 2px solid #e2e8f0 !important;
          font-size: 14px; background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          transition: border-color .15s, box-shadow .15s;
        }
        .pos-search input:focus {
          border-color: var(--pos-accent) !important;
          box-shadow: 0 0 0 3px rgba(230,57,70,.12) !important;
        }

        /* ── Product grid ── */
        .pos-grid { flex: 1; overflow-y: auto; padding-right: 2px; }
        .pos-grid::-webkit-scrollbar { width: 5px; }
        .pos-grid::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

        .product-card {
          cursor: pointer;
          border: 2px solid transparent !important;
          border-radius: 14px !important;
          transition: all .15s ease;
        }
        .product-card:hover {
          border-color: var(--pos-accent) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(230,57,70,.18) !important;
        }
        .product-card:active { transform: translateY(-1px) scale(.98); }
        .product-card.oos { opacity: .45; cursor: not-allowed; pointer-events: none; }

        /* ── Right sidebar (desktop) ── */
        .pos-right {
          width: 380px;
          flex-shrink: 0;
          background: var(--pos-dark);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: -4px 0 30px rgba(0,0,0,.2);
        }
        .pos-right-body {
          flex: 1; overflow-y: auto;
          padding: 16px 16px 6px;
          display: flex; flex-direction: column;
        }
        .pos-right-body::-webkit-scrollbar { width: 4px; }
        .pos-right-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 4px; }

        /* ── Mobile bottom drawer ── */
        .pos-drawer-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,.55);
          z-index: 1040;
          backdrop-filter: blur(2px);
        }
        .pos-drawer {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 88vh;
          background: var(--pos-dark);
          border-radius: 20px 20px 0 0;
          z-index: 1045;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 -8px 40px rgba(0,0,0,.4);
          transform: translateY(100%);
          transition: transform .3s cubic-bezier(.4,0,.2,1);
        }
        .pos-drawer.open { transform: translateY(0); }
        .pos-drawer-handle {
          width: 40px; height: 4px;
          background: rgba(255,255,255,.2);
          border-radius: 2px;
          margin: 10px auto 4px;
          flex-shrink: 0;
        }
        .pos-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 6px 16px 10px;
          border-bottom: 1px solid var(--pos-border);
          flex-shrink: 0;
        }

        /* ── Mobile FAB cart button ── */
        .pos-cart-fab {
          display: none;
          position: fixed;
          bottom: 20px; right: 20px;
          z-index: 1030;
          width: 60px; height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg,#e63946,#c1121f);
          border: none;
          color: #fff;
          font-size: 22px;
          box-shadow: 0 6px 24px rgba(230,57,70,.5);
          cursor: pointer;
          align-items: center; justify-content: center;
          transition: transform .15s;
        }
        .pos-cart-fab:active { transform: scale(.93); }
        .pos-cart-fab .fab-badge {
          position: absolute; top: -2px; right: -2px;
          width: 22px; height: 22px;
          background: #fff;
          color: var(--pos-accent);
          border-radius: 50%;
          font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--pos-accent);
        }

        /* ── Shared panel styles ── */
        .sec-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 1.1px; text-transform: uppercase;
          color: var(--pos-muted); margin-bottom: 9px;
        }
        .pos-divider { border-top: 1px solid var(--pos-border); margin: 10px 0; }
        .pos-input {
          background: rgba(255,255,255,.07) !important;
          border: 1.5px solid var(--pos-border) !important;
          border-radius: 9px !important;
          color: #fff !important; font-size: 13px !important;
        }
        .pos-input::placeholder { color: rgba(255,255,255,.3) !important; }
        .pos-input:focus {
          background: rgba(255,255,255,.11) !important;
          border-color: rgba(230,57,70,.65) !important;
          box-shadow: 0 0 0 3px rgba(230,57,70,.15) !important;
          color: #fff !important; outline: none;
        }
        .pos-input option { background: #1a2342; color: #fff; }

        .cart-row {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 4px; border-radius: 10px; margin-bottom: 4px;
          transition: background .1s;
        }
        .cart-row:hover { background: rgba(255,255,255,.05); }
        .qty-ctrl { display: flex; align-items: center; }
        .qty-btn {
          width: 28px; height: 28px; border: none; border-radius: 6px;
          background: rgba(255,255,255,.1); color: #fff;
          font-size: 17px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background .1s;
          -webkit-tap-highlight-color: transparent;
        }
        .qty-btn:hover { background: rgba(255,255,255,.22); }
        .qty-btn:active { background: rgba(255,255,255,.3); }
        .qty-input {
          width: 32px; text-align: center;
          background: transparent; border: none;
          color: #fff; font-weight: 700; font-size: 13px; outline: none;
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

        .pay-btn {
          flex: 1; border-radius: 10px !important;
          border: 1.5px solid var(--pos-border) !important;
          background: rgba(255,255,255,.05) !important;
          color: var(--pos-muted) !important;
          font-size: 12px; font-weight: 600;
          padding: 10px 4px !important; transition: all .15s !important; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .pay-btn:hover { background: rgba(230,57,70,.25) !important; color: #fff !important; }
        .pay-btn.active {
          background: var(--pos-accent) !important;
          border-color: var(--pos-accent) !important; color: #fff !important;
        }

        .sum-row {
          display: flex; justify-content: space-between;
          font-size: 13px; color: rgba(255,255,255,.58); margin-bottom: 7px;
        }
        .sum-total {
          display: flex; justify-content: space-between; align-items: baseline;
          font-size: 22px; font-weight: 900; color: #fff;
          border-top: 1px solid var(--pos-border);
          padding-top: 12px; margin-top: 4px;
        }
        .checkout-btn {
          width: 100%; padding: 14px; border: none; border-radius: 12px;
          font-weight: 800; font-size: 15px; letter-spacing: .3px;
          cursor: pointer; transition: all .2s; color: #fff;
          -webkit-tap-highlight-color: transparent;
        }
        .checkout-btn:disabled {
          background: rgba(255,255,255,.1) !important;
          color: rgba(255,255,255,.3) !important;
          cursor: not-allowed; box-shadow: none !important;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim { animation: fadeUp .22s ease both; }

        /* ══════════════════════════
           RESPONSIVE BREAKPOINTS
        ══════════════════════════ */

        /* ── Tablet: ≤ 991px — narrow sidebar ── */
        @media (max-width: 991px) {
          .pos-right { width: 320px; }
          .pos-left { padding: 12px 10px 10px 12px; }
        }

        /* ── Mobile: ≤ 767px — hide sidebar, show FAB + drawer ── */
        @media (max-width: 767px) {
          .pos-root { height: calc(100vh - 56px); }
          .pos-right { display: none !important; }
          .pos-left { padding: 10px 10px 80px 10px; } /* bottom padding for FAB */
          .pos-cart-fab { display: flex; }
          .pos-drawer-overlay.open { display: block; }
          .pos-drawer { display: flex; }
        }

        /* ── Small phones ── */
        @media (max-width: 480px) {
          .pos-left { padding: 8px 8px 80px 8px; }
          .sum-total { font-size: 18px; }
          .checkout-btn { font-size: 14px; padding: 13px; }
        }
      `}</style>

      <div className="pos-root">

        {/* ════ LEFT: Products ════ */}
        <div className="pos-left">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-2 mb-sm-3">
            <div>
              <h5 className="fw-black mb-0" style={{ color: "#0f1b35", letterSpacing: -0.3, fontSize: "clamp(14px, 3.5vw, 18px)" }}>
                <span className="me-2 d-inline-block rounded-circle"
                  style={{ width: 10, height: 10, background: "#e63946", verticalAlign: "middle" }} />
                Point of Sale
              </h5>
              <small className="text-muted d-none d-sm-block">Walk-in / Offline Sales Terminal</small>
            </div>
            <span className="badge rounded-pill border text-secondary bg-white fw-semibold" style={{ fontSize: 11 }}>
              {products.length} products
            </span>
          </div>

          {/* Search */}
          <div className="pos-search position-relative mb-2 mb-sm-3">
            <i className="bi bi-search" />
            <input
              className="form-control"
              style={{ fontSize: "clamp(13px, 3.5vw, 16px)" }}
              placeholder="Search by name, SKU, brand…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Product grid */}
          <div className="pos-grid">
            <div className="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2 g-sm-3">
              {searching
                ? [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
                : products.length === 0
                ? (
                  <div className="col-12 text-center py-5">
                    <i className="bi bi-box-seam fs-1 text-muted opacity-50" />
                    <p className="text-muted mt-2">
                      {search ? `No results for "${search}"` : "No products available"}
                    </p>
                  </div>
                )
                : products.map((p) => (
                  <div key={p._id} className="col">
                    <div
                      className={`card h-100 shadow-sm text-center p-2 product-card anim${p.stock <= 0 ? " oos" : ""}`}
                      onClick={() => addToCart(p)}
                    >
                      <div className="position-relative d-inline-block mx-auto mb-1 mb-sm-2">
                        <img
                          src={p.images?.[0] || "https://via.placeholder.com/80"}
                          alt={p.name}
                          className="rounded-3 object-fit-cover"
                          style={{ width: "clamp(56px, 12vw, 72px)", height: "clamp(56px, 12vw, 72px)" }}
                        />
                        {p.stock <= 0 && (
                          <span className="badge bg-danger position-absolute" style={{ top: -6, right: -6, fontSize: 9 }}>Out</span>
                        )}
                        {p.stock > 0 && p.stock <= 5 && (
                          <span className="badge bg-warning text-dark position-absolute" style={{ top: -6, right: -6, fontSize: 9 }}>Low</span>
                        )}
                      </div>
                      <div className="fw-bold text-truncate mb-1" style={{ fontSize: "clamp(11px, 2.5vw, 13px)", color: "#1a2342" }}>{p.name}</div>
                      <div className="fw-black" style={{ color: "#e63946", fontSize: "clamp(12px, 3vw, 14px)" }}>₹{fmt(p.price)}</div>
                      <small style={{ color: p.stock <= 5 ? "#f59e0b" : "#22c55e", fontSize: 10 }}>
                        {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
                      </small>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ════ RIGHT: Cart sidebar (tablet + desktop) ════ */}
        <div className="pos-right">
          <CartPanel />
        </div>

        {/* ════ MOBILE: Cart FAB button ════ */}
        <button className="pos-cart-fab" onClick={() => setCartOpen(true)} aria-label="Open cart">
          <i className="bi bi-cart3" />
          {cart.length > 0 && <span className="fab-badge">{cart.length}</span>}
        </button>

        {/* ════ MOBILE: Drawer overlay ════ */}
        <div className={`pos-drawer-overlay${cartOpen ? " open" : ""}`} onClick={() => setCartOpen(false)} />

        {/* ════ MOBILE: Bottom drawer ════ */}
        <div className={`pos-drawer${cartOpen ? " open" : ""}`}>
          <div className="pos-drawer-handle" />
          <div className="pos-drawer-header">
            <span className="fw-bold text-white" style={{ fontSize: 15 }}>
              <i className="bi bi-cart3 me-2" />
              Cart {cart.length > 0 && <span className="badge bg-danger rounded-pill ms-1" style={{ fontSize: 10 }}>{cart.length}</span>}
            </span>
            <button className="btn btn-link p-0" style={{ color: "rgba(255,255,255,.5)", fontSize: 20, lineHeight: 1 }}
              onClick={() => setCartOpen(false)}>
              <i className="bi bi-chevron-down" />
            </button>
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <CartPanel />
          </div>
        </div>

      </div>

      {/* UPI Modal */}
      <UPIModal
        show={showUPIModal}
        upiLink={upiLink}
        total={total}
        orderId={pendingOrderId}
        onPaid={handleUPIPaid}
        onFailed={handleUPIFailed}
        onClose={handleModalClose}
      />
    </>
  );
}