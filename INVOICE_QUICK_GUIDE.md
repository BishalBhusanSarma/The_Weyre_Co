# Invoice System - Quick Reference

## Order ID Format
**Format**: `TWC-YYYYMMDD-XXXXXXX-HHMMSS`

Example: `TWC-20241014-1234567-143025`

## Invoice Features
✅ Single A4 page layout
✅ Customer name & address (bold)
✅ Order items with prices
✅ Discounts & savings
✅ **TOTAL PAID** (bold, large)
✅ Logo as signature
✅ Payment & delivery status

## User Flow

### Client Orders Page
1. Go to "My Orders"
2. Find paid order
3. Click "Download Invoice" (blue button)
4. Invoice modal opens
5. Review invoice
6. Click "🖨️ Print Invoice"
7. Save as PDF

### Admin Orders Page
1. Go to "Order Management"
2. Find paid order
3. Click "Download Invoice (PDF)" (blue button)
4. Invoice modal opens (includes shipping address)
5. Review invoice
6. Click "🖨️ Print Invoice"
7. Save as PDF

## Files
- `wc/lib/generateOrderId.ts` - ID generator
- `wc/components/Invoice.tsx` - Invoice component
- `wc/app/checkout/page.tsx` - Creates orders with custom ID
- `wc/app/orders/page.tsx` - Client invoice download
- `wc/app/admin/orders/page.tsx` - Admin invoice download

## Print Settings
- Page: A4
- Orientation: Portrait
- Margins: 15mm
- Destination: Save as PDF
