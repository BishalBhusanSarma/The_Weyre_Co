# Order Flow Visual Guide

## 🛒 Complete Order Journey

### 1. Customer Places Order

```
┌─────────────────────────────────────┐
│         CHECKOUT PAGE               │
├─────────────────────────────────────┤
│ Product Subtotal:        ₹1,000     │
│ Product Discount:         -₹200     │
│ Coupon Discount:          -₹100     │
│ Delivery Charge:           +₹80     │
│─────────────────────────────────────│
│ TOTAL TO PAY:             ₹780      │
│                                     │
│ ☐ Test Mode (Skip Payment)         │
│                                     │
│ [Proceed to Payment]                │
└─────────────────────────────────────┘
```

### 2. Order Created

```
┌─────────────────────────────────────┐
│         ORDER DETAILS               │
├─────────────────────────────────────┤
│ Order ID: TWC-A7K9M2X4P1Q8          │
│ Status: Pending                     │
│ Payment: Paid                       │
│                                     │
│ Total: ₹780                         │
│ Delivery Charge: ₹80                │
│ RTO Charge: ₹0                      │
└─────────────────────────────────────┘
```

### 3. Normal Order Flow (No Refund)

```
Pending → Shipped → Delivered
   ↓         ↓          ↓
  ₹0       ₹0         ₹0
(No RTO)  (No RTO)   (No RTO)

Revenue: +₹780
Delivery Cost: -₹80
Net Profit: ₹700
```

### 4. Refund Flow (With RTO)

```
Delivered → Return Requested → Refunded
    ↓              ↓               ↓
   ₹0            ₹0              ₹80
(No RTO)      (No RTO)        (RTO Applied)

Customer Refund: ₹700 (₹780 - ₹80 RTO)
Revenue Impact: -₹780
RTO Cost: -₹80
Total Loss: ₹860
```

## 💰 Financial Breakdown

### Successful Order
```
┌──────────────────────────────────┐
│ REVENUE SIDE                     │
├──────────────────────────────────┤
│ Customer Paid:          ₹780     │
│                                  │
│ COST SIDE                        │
├──────────────────────────────────┤
│ Delivery Charge:        -₹80     │
│ Product Cost:           -₹500    │
│──────────────────────────────────│
│ NET PROFIT:             ₹200     │
└──────────────────────────────────┘
```

### Refunded Order
```
┌──────────────────────────────────┐
│ REVENUE SIDE                     │
├──────────────────────────────────┤
│ Customer Paid:          ₹780     │
│ Customer Refund:        -₹700    │
│ (₹780 - ₹80 RTO)                 │
│──────────────────────────────────│
│ Net Revenue:            ₹80      │
│                                  │
│ COST SIDE                        │
├──────────────────────────────────┤
│ Delivery Charge:        -₹80     │
│ RTO Charge:             -₹80     │
│ Product Cost:           -₹500    │
│──────────────────────────────────│
│ NET LOSS:               -₹580    │
└──────────────────────────────────┘
```

## 📊 Analytics Dashboard View

```
┌─────────────────────────────────────────────┐
│         ANALYTICS DASHBOARD                 │
├─────────────────────────────────────────────┤
│                                             │
│ Total Revenue:              ₹10,000         │
│ Total Returns:              -₹2,000         │
│ ─────────────────────────────────────────   │
│ Net Sales:                  ₹8,000          │
│                                             │
│ Total Delivery Charges:     -₹800           │
│ (10 orders × ₹80)                           │
│                                             │
│ Total RTO Costs:            -₹160           │
│ (2 refunds × ₹80)                           │
│ ─────────────────────────────────────────   │
│ NET PROFIT:                 ₹7,040          │
│                                             │
└─────────────────────────────────────────────┘
```

## 🔄 Order Status Flow

```
┌─────────┐
│ PENDING │ ← Order Created
└────┬────┘
     │
     ↓
┌─────────┐
│ SHIPPED │ ← Admin ships order
└────┬────┘
     │
     ├──→ ┌───────────┐
     │    │ DELIVERED │ ← Normal completion
     │    └───────────┘
     │
     └──→ ┌────────────────┐
          │ RETURN_REFUND  │ ← Customer returns
          └────────────────┘
                 ↓
          RTO Charge: ₹80
          Customer Refund: Order Total - ₹80
```

## 🧪 Test Mode Flow

```
┌─────────────────────────────────────┐
│         TEST MODE ENABLED           │
├─────────────────────────────────────┤
│                                     │
│ ☑ Test Mode (Skip Payment)         │
│                                     │
│ [Place Test Order]                  │
│         ↓                           │
│   Order Created                     │
│   Payment: PAID                     │
│   Status: PENDING                   │
│         ↓                           │
│   Redirect to Orders Page           │
│                                     │
│ (No payment gateway involved)       │
└─────────────────────────────────────┘
```

## 📝 Order ID Format

```
Old Format:
550e8400-e29b-41d4-a716-446655440000
(UUID - Generic)

New Format:
TWC-A7K9M2X4P1Q8
(The Weyre Co - Premium)

Structure:
TWC - {12 random alphanumeric characters}
 ↑           ↑
Brand    Unique ID
```

## 🎯 Key Takeaways

1. **Every Order**: +₹80 delivery charge
2. **Every Refund**: -₹80 RTO charge (from customer refund)
3. **Business Cost**: ₹80 delivery + ₹80 RTO per refund
4. **Order ID**: Always starts with "TWC-"
5. **Test Mode**: For testing only, creates paid orders instantly

## 💡 Pro Tips

- **Delivery Charge**: Transparent pricing, shown separately
- **RTO Charge**: Protects business from return shipping costs
- **Order ID**: Premium branding with TWC prefix
- **Test Mode**: Perfect for testing without payment gateway
- **Analytics**: Automatically tracks all costs and revenue
