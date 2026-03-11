import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { orderAPI } from '../services/api'

const PAGE_SIZES = [
  { id: 'A4', label: 'A4 (210×297mm)', width: '210mm', height: '297mm', desc: 'Standard office printing' },
  { id: 'A5', label: 'A5 (148×210mm)', width: '148mm', height: '210mm', desc: 'Compact invoice' },
  { id: 'Letter', label: 'Letter (8.5×11in)', width: '8.5in', height: '11in', desc: 'US standard' },
  { id: 'Legal', label: 'Legal (8.5×14in)', width: '8.5in', height: '14in', desc: 'US legal' },
  { id: 'Thermal80', label: 'Thermal 80mm', width: '80mm', height: 'auto', desc: 'POS thermal printer (80mm)' },
  { id: 'Thermal58', label: 'Thermal 58mm', width: '58mm', height: 'auto', desc: 'Mini thermal printer (58mm)' },
  { id: 'A3', label: 'A3 (297×420mm)', width: '297mm', height: '420mm', desc: 'Large format' },
]

export default function Invoice() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState('A4')
  const printRef = useRef()

  useEffect(() => {
    orderAPI.getOne(id).then(r => { setOrder(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  const handlePrint = () => {
    const size = PAGE_SIZES.find(p => p.id === pageSize)
    const printContent = printRef.current.innerHTML
    const win = window.open('', '_blank')
    const isThermal = pageSize.startsWith('Thermal')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order?.invoiceNumber || order?._id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: ${size.width} ${size.height !== 'auto' ? size.height : ''}; margin: ${isThermal ? '2mm' : '15mm'}; }
          body { font-family: ${isThermal ? "'Courier New', monospace" : "'Segoe UI', Arial, sans-serif"}; font-size: ${isThermal ? '10px' : '12px'}; color: #222; background: #fff; }
          .invoice-wrap { max-width: 100%; }
          .inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #e63946; padding-bottom: 15px; }
          .inv-header.thermal { flex-direction: column; align-items: center; text-align: center; }
          .shop-name { font-size: ${isThermal ? '14px' : '22px'}; font-weight: 800; color: #e63946; }
          .inv-meta { text-align: right; }
          .inv-meta.thermal { text-align: center; margin-top: 8px; }
          .inv-num { font-size: ${isThermal ? '11px' : '16px'}; font-weight: 700; color: #1a2342; }
          .inv-date { color: #666; font-size: ${isThermal ? '9px' : '11px'}; }
          .section-title { font-weight: 700; font-size: ${isThermal ? '10px' : '12px'}; color: #1a2342; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-grid { display: ${isThermal ? 'block' : 'grid'}; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .info-box { padding: ${isThermal ? '6px 0' : '12px'}; background: ${isThermal ? 'transparent' : '#f8f9fa'}; border-radius: 6px; font-size: ${isThermal ? '9px' : '11px'}; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .items-table th { background: #1a2342; color: #fff; padding: ${isThermal ? '4px 3px' : '8px 10px'}; text-align: left; font-size: ${isThermal ? '9px' : '11px'}; }
          .items-table td { padding: ${isThermal ? '4px 3px' : '8px 10px'}; border-bottom: 1px solid #eee; font-size: ${isThermal ? '9px' : '11px'}; }
          .items-table tr:last-child td { border-bottom: none; }
          .totals { margin-left: auto; width: ${isThermal ? '100%' : '250px'}; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: ${isThermal ? '10px' : '12px'}; }
          .totals-row.total { font-size: ${isThermal ? '12px' : '15px'}; font-weight: 800; color: #e63946; border-top: 2px solid #e63946; padding-top: 8px; margin-top: 4px; }
          .discount-row { color: #28a745; }
          .footer { margin-top: 20px; text-align: center; color: #999; font-size: ${isThermal ? '8px' : '10px'}; border-top: 1px dashed #ccc; padding-top: 10px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; }
          .badge-online { background: #e3f2fd; color: #1565c0; }
          .badge-offline { background: #f3e5f5; color: #6a1b9a; }
          ${isThermal ? '.dashes { border-top: 1px dashed #000; margin: 6px 0; }' : ''}
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
    </div>
  )

  if (!order) return (
    <div className="container py-5 text-center">
      <i className="bi bi-exclamation-circle" style={{ fontSize: 48, color: 'var(--primary)' }}></i>
      <h4 className="mt-3">Invoice Not Found</h4>
    </div>
  )

  const isThermal = pageSize.startsWith('Thermal')
  const size = PAGE_SIZES.find(p => p.id === pageSize)
  const subtotal = order.itemsPrice || order.orderItems?.reduce((s, i) => s + i.price * i.quantity, 0) || 0
  const discount = order.discountAmount || 0
  const tax = order.taxPrice || 0
  const shipping = order.shippingPrice || 0
  const total = order.totalPrice || 0

  return (
    <div className="container-fluid py-4" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Controls Bar */}
      <div className="container mb-4">
        <div className="rounded-3 p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between"
          style={{ background: '#1a2342', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-printer-fill text-white fs-5"></i>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Print Invoice</span>
            <span className="badge ms-2" style={{ background: order.orderType === 'offline' ? '#9c27b0' : '#1565c0', color: '#fff' }}>
              {order.orderType === 'offline' ? '🏪 Offline/Walk-in' : '🌐 Online Order'}
            </span>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Page Size:</span>
            {PAGE_SIZES.map(s => (
              <button key={s.id}
                onClick={() => setPageSize(s.id)}
                title={s.desc}
                className="btn btn-sm"
                style={{
                  background: pageSize === s.id ? '#e63946' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: pageSize === s.id ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                  fontWeight: pageSize === s.id ? 700 : 400,
                  fontSize: '0.75rem',
                  borderRadius: 6
                }}>
                {s.id}
              </button>
            ))}
            <button onClick={handlePrint} className="btn ms-2"
              style={{ background: '#e63946', color: '#fff', fontWeight: 700, borderRadius: 8, paddingLeft: 20, paddingRight: 20 }}>
              <i className="bi bi-printer me-2"></i>Print
            </button>
          </div>
        </div>
        <div className="text-center mt-2" style={{ color: '#666', fontSize: '0.8rem' }}>
          Selected: <strong>{size.label}</strong> — {size.desc}
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="d-flex justify-content-center">
        <div style={{
          width: isThermal ? (pageSize === 'Thermal58' ? '220px' : '302px') : '794px',
          background: '#fff',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          borderRadius: 10,
          padding: isThermal ? '16px 12px' : '40px',
          fontFamily: isThermal ? "'Courier New', monospace" : "'Segoe UI', Arial, sans-serif",
          fontSize: isThermal ? '10px' : '13px'
        }}>
          <div ref={printRef}>
            <div className="invoice-wrap">
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: isThermal ? 'center' : 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: '2px solid #e63946', paddingBottom: 15, flexDirection: isThermal ? 'column' : 'row', textAlign: isThermal ? 'center' : 'left' }}>
                <div>
                  <div style={{ fontSize: isThermal ? 14 : 24, fontWeight: 800, color: '#e63946', letterSpacing: -0.5 }}>⚡ Shakti Shop</div>
                  <div style={{ color: '#666', fontSize: isThermal ? 9 : 11, marginTop: 2 }}>Your trusted shopping destination</div>
                  {!isThermal && <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>📍 123 Market Street, Pune, MH · 📞 +91 98765 43210</div>}
                </div>
                <div style={{ textAlign: isThermal ? 'center' : 'right', marginTop: isThermal ? 10 : 0 }}>
                  <div style={{ fontSize: isThermal ? 12 : 18, fontWeight: 800, color: '#1a2342' }}>INVOICE</div>
                  <div style={{ fontSize: isThermal ? 10 : 13, fontWeight: 700, color: '#e63946' }}>{order.invoiceNumber || `#${order._id?.slice(-8).toUpperCase()}`}</div>
                  <div style={{ color: '#888', fontSize: isThermal ? 9 : 11 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 9, fontWeight: 700, background: order.orderType === 'offline' ? '#f3e5f5' : '#e3f2fd', color: order.orderType === 'offline' ? '#6a1b9a' : '#1565c0' }}>
                      {order.orderType === 'offline' ? '🏪 WALK-IN' : '🌐 ONLINE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer + Order Info */}
              {!isThermal ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  <div style={{ padding: 14, background: '#f8f9fa', borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: '#1a2342', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bill To</div>
                    {order.orderType === 'offline' ? (
                      <>
                        <div style={{ fontWeight: 700 }}>{order.customerName || 'Walk-in Customer'}</div>
                        {order.customerPhone && <div style={{ color: '#555', fontSize: 11 }}>📞 {order.customerPhone}</div>}
                        {order.customerEmail && <div style={{ color: '#555', fontSize: 11 }}>✉️ {order.customerEmail}</div>}
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700 }}>{order.shippingAddress?.name || order.user?.name}</div>
                        <div style={{ color: '#555', fontSize: 11 }}>{order.user?.email}</div>
                        <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>{order.shippingAddress?.street}, {order.shippingAddress?.city}</div>
                        <div style={{ color: '#555', fontSize: 11 }}>{order.shippingAddress?.state} - {order.shippingAddress?.pincode}</div>
                        {order.shippingAddress?.phone && <div style={{ color: '#555', fontSize: 11 }}>📞 {order.shippingAddress.phone}</div>}
                      </>
                    )}
                  </div>
                  <div style={{ padding: 14, background: '#f8f9fa', borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: '#1a2342', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Order Details</div>
                    <div style={{ fontSize: 11, color: '#555' }}><strong>Status:</strong> <span style={{ textTransform: 'capitalize', color: order.status === 'completed' || order.status === 'delivered' ? '#28a745' : '#e63946' }}>{order.status}</span></div>
                    <div style={{ fontSize: 11, color: '#555' }}><strong>Payment:</strong> {order.paymentMethod}</div>
                    <div style={{ fontSize: 11, color: '#555' }}><strong>Paid:</strong> {order.isPaid ? '✅ Yes' : '❌ Pending'}</div>
                    {order.orderType === 'online' && <div style={{ fontSize: 11, color: '#555' }}><strong>Order Type:</strong> Online / Delivery</div>}
                    {order.notes && <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}><strong>Notes:</strong> {order.notes}</div>}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 12, fontSize: 9, borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0' }}>
                  <div><strong>Customer:</strong> {order.orderType === 'offline' ? (order.customerName || 'Walk-in') : (order.shippingAddress?.name || order.user?.name)}</div>
                  {(order.customerPhone || order.shippingAddress?.phone) && <div><strong>Phone:</strong> {order.customerPhone || order.shippingAddress?.phone}</div>}
                  <div><strong>Payment:</strong> {order.paymentMethod} {order.isPaid ? '✓ PAID' : '— PENDING'}</div>
                </div>
              )}

              {/* Items Table */}
              {!isThermal ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                  <thead>
                    <tr style={{ background: '#1a2342', color: '#fff' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700 }}>#</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700 }}>Item</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700 }}>Unit Price</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700 }}>Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems?.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: '#666' }}>{i + 1}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11 }}>₹{item.price?.toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11 }}>{item.quantity}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#1a2342' }}>₹{(item.price * item.quantity)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '4px 0', marginBottom: 4, display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700 }}>
                    <span>ITEM</span><span>QTY</span><span>PRICE</span><span>AMT</span>
                  </div>
                  {order.orderItems?.map((item, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
                        <span style={{ opacity: 0 }}>—</span>
                        <span>{item.quantity}</span>
                        <span>₹{item.price?.toLocaleString()}</span>
                        <span>₹{(item.price * item.quantity)?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: isThermal ? 'center' : 'flex-end' }}>
                <div style={{ width: isThermal ? '100%' : 280, borderTop: isThermal ? '1px dashed #000' : 'none', paddingTop: isThermal ? 8 : 0 }}>
                  {[
                    { label: 'Subtotal', value: subtotal, show: true },
                    { label: `Discount${order.discountPercent ? ` (${order.discountPercent}%)` : ''}`, value: -discount, show: discount > 0, color: '#28a745' },
                    { label: 'Tax / GST', value: tax, show: tax > 0 },
                    { label: 'Shipping', value: shipping, show: shipping > 0 },
                  ].filter(r => r.show).map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: isThermal ? 10 : 12, color: row.color || '#444' }}>
                      <span>{row.label}</span>
                      <span>{row.value < 0 ? '-' : ''}₹{Math.abs(row.value)?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', fontSize: isThermal ? 14 : 18, fontWeight: 800, color: '#e63946', borderTop: `2px solid ${isThermal ? '#000' : '#e63946'}`, marginTop: 6 }}>
                    <span>TOTAL</span>
                    <span>₹{total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 24, textAlign: 'center', color: '#aaa', fontSize: isThermal ? 8 : 10, borderTop: '1px dashed #ccc', paddingTop: 12 }}>
                <div style={{ fontWeight: 600, color: '#666', marginBottom: 4 }}>Thank you for shopping with Shakti Shop! 🛍️</div>
                <div>For queries: support@shaktishop.in · +91 98765 43210</div>
                {!isThermal && <div style={{ marginTop: 4 }}>This is a computer-generated invoice and does not require a physical signature.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
