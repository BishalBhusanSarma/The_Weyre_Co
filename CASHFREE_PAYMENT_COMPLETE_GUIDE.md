# Cashfree Payment Integration - Complete Implementation Guide

## Overview
Complete Cashfree payment gateway integration with order management, delivery tracking, and customer support system.

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Cashfree Configuration
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id_here
CASHFREE_SECRET_KEY=your_cashfree_secret_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# For Production
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Files Created

### 1. Payment Integration
- `lib/cashfree.ts` - Cashfree SDK wrapper
- `app/api/cashfree/create-order/route.ts` - Create payment order
- `app/api/cashfree/verify-payment/route.ts` - Verify payment status
- `app/api/cashfree/webhook/route.ts` - Handle payment webhooks
- `app/payment/callback/page.tsx` - Payment success/failure page

### 2. Order Management
- `app/orders/page.tsx` - Customer orders page (updated)
- `app/admin/orders/page.tsx` - Admin order management (complete rewrite)

### 3. Database
- `database_payment_update.sql` - Database schema updates

## Features Implemented

### ✅ Payment Processing
1. **Cashfree Integration**
   - Create payment orders
   - Redirect to Cashfree payment page
   - Handle payment callbacks
   - Verify payment status
   - Webhook handling for async updates

2. **Payment Status**
   - Pending (initial state)
   - Paid (successful payment)
   - Failed (payment failed)
   - Refunded (payment refunded)

### ✅ Order Management (Admin)
1. **View All Orders**
   - Complete order details
   - Customer information
   - Order items with images
   - Payment status
   - Delivery status

2. **Status Management**
   - Delivery Status Dropdown:
     - Pending
     - Shipped
     - Delivered (auto-sets delivered_at)
     - Cancelled
   - Real-time updates
   - Auto-refresh after update

3. **Delhivery Tracking**
   - Input field for tracking ID
   - Save tracking number
   - Visible to customers
   - Hint text for admin

4. **Customer Details**
   - Name, email, phone
   - Complete shipping address
   - Order history

### ✅ Order Tracking (Customer)
1. **View Orders**
   - All orders with status
   - Payment status display
   - Delivery status tracking
   - Order items

2. **Delhivery Tracking**
   - Copyable tracking ID
   - Copy button with one click
   - Hint: "Paste in Delhivery app"
   - Alert confirmation on copy

3. **7-Day Issue Window**
   - "Having an Issue?" button (days 0-7)
   - Issue reporting modal
   - "Buy More Products" after 7 days
   - Auto-calculation from delivered_at

## Payment Flow

### Step 1: Checkout
```typescript
// User clicks "Place Order" on checkout/buynow page
const orderData = {
    orderId: dbOrderId,
    orderAmount: totalAmount,
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: user.phone
}
```

### Step 2: Create Cashfree Order
```typescript
// API call to create Cashfree order
const cashfreeOrder = await createCashfreeOrder(orderData)
// Returns: payment_session_id, order_id
```

### Step 3: Redirect to Payment
```typescript
// Redirect user to Cashfree payment page
window.location.href = cashfreeOrder.payment_link
```

### Step 4: Payment Processing
- User completes payment on Cashfree
- Cashfree processes payment
- Redirects to callback URL

### Step 5: Callback & Verification
```typescript
// /payment/callback?order_id=xxx
// Verify payment status
const status = await verifyPayment(orderId)
// Update database if PAID
```

### Step 6: Webhook (Async)
```typescript
// Cashfree sends webhook
// Update payment status
// Record transaction
```

## Admin Order Management

### Delivery Status Workflow:
```
Pending → Shipped → Delivered
         ↓
      Cancelled
```

### When Status Changes to "Delivered":
1. Sets `delivered_at` timestamp
2. Starts 7-day issue window
3. Customer can report issues
4. After 7 days, shows "Buy More Products"

### Delhivery Tracking:
1. Admin enters tracking ID
2. Clicks "Save"
3. Updates database
4. Customer sees tracking ID
5. Customer can copy with one click
6. Hint shows: "Paste in Delhivery app"

## Customer Order View

### Order Card Display:
```
┌─────────────────────────────────────────┐
│ Order #abc123    Jan 1, 2024            │
│ Total: ₹1,999    Status: Delivered      │
│ Payment: Paid                           │
├─────────────────────────────────────────┤
│ [Product Image] Product Name            │
│                 Qty: 2  ₹999            │
├─────────────────────────────────────────┤
│ Delhivery Tracking ID:                  │
│ [1234567890]  [Copy]                    │
│ 📦 Paste this ID in Delhivery app       │
├─────────────────────────────────────────┤
│ [Having an Issue?]                      │
│ or [Buy More Products]                  │
└─────────────────────────────────────────┘
```

### Tracking ID Copy Feature:
- Click "Copy" button
- Tracking ID copied to clipboard
- Alert: "Tracking ID copied! Paste it in Delhivery app to track your order."
- User opens Delhivery app
- Pastes tracking ID
- Tracks shipment

## Database Schema

### Orders Table (Updated):
```sql
- payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
- payment_id: Cashfree payment ID
- cashfree_order_id: Cashfree order ID
- delivery_status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
- delivered_at: Timestamp (for 7-day window)
- tracking_number: Delhivery tracking ID
- shipping_address: Delivery address
```

### Payment Transactions Table:
```sql
- order_id: Reference to order
- amount: Transaction amount
- payment_status: Status
- cashfree_order_id: Cashfree order ID
- cashfree_payment_id: Cashfree payment ID
- transaction_data: JSONB (full response)
```

### Order Issues Table:
```sql
- order_id: Reference to order
- user_id: Reference to user
- issue_type: Type of issue
- description: Issue details
- status: 'open' | 'in_progress' | 'resolved' | 'closed'
```

## API Endpoints

### POST /api/cashfree/create-order
Creates a new Cashfree payment order
```json
Request:
{
  "orderId": "uuid",
  "orderAmount": 1999,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "9876543210"
}

Response:
{
  "cf_order_id": "order_xxx",
  "payment_session_id": "session_xxx",
  "payment_link": "https://payments.cashfree.com/..."
}
```

### GET /api/cashfree/verify-payment?orderId=xxx
Verifies payment status
```json
Response:
{
  "order_id": "uuid",
  "order_status": "PAID",
  "order_amount": 1999,
  "cf_order_id": "order_xxx"
}
```

### POST /api/cashfree/webhook
Handles Cashfree webhooks
```json
Request:
{
  "type": "PAYMENT_SUCCESS_WEBHOOK",
  "data": {
    "order": {
      "order_id": "uuid",
      "order_status": "PAID",
      "order_amount": 1999
    }
  }
}
```

## Testing

### Test Mode (Sandbox):
1. Use Cashfree sandbox credentials
2. Test card: 4111 1111 1111 1111
3. CVV: Any 3 digits
4. Expiry: Any future date
5. OTP: 123456

### Production Mode:
1. Get production credentials from Cashfree
2. Update environment variables
3. Change API URLs to production
4. Test with real payments

## Security Considerations

1. ✅ API keys in environment variables
2. ✅ Server-side payment verification
3. ✅ Webhook signature verification (recommended)
4. ✅ HTTPS required for production
5. ✅ Payment data not stored in frontend
6. ✅ Transaction audit trail
7. ✅ User authentication required

## Cashfree Dashboard Setup

### 1. Create Account
- Go to cashfree.com
- Sign up for merchant account
- Complete KYC verification

### 2. Get Credentials
- Navigate to Developers section
- Copy App ID
- Copy Secret Key
- Note: Use sandbox for testing

### 3. Configure Webhooks
- Add webhook URL: `https://yourdomain.com/api/cashfree/webhook`
- Select events: PAYMENT_SUCCESS_WEBHOOK, PAYMENT_FAILED_WEBHOOK
- Save configuration

### 4. Set Return URL
- Return URL: `https://yourdomain.com/payment/callback`
- This is where users return after payment

## Deployment Checklist

### Before Going Live:
- [ ] Run database_payment_update.sql
- [ ] Add Cashfree credentials to .env
- [ ] Test payment flow in sandbox
- [ ] Configure webhooks in Cashfree dashboard
- [ ] Set correct BASE_URL
- [ ] Test order status updates
- [ ] Test tracking ID functionality
- [ ] Test 7-day issue window
- [ ] Verify payment status updates
- [ ] Test admin order management
- [ ] Switch to production credentials
- [ ] Test with real payment

## Troubleshooting

### Payment Not Updating:
1. Check webhook configuration
2. Verify API credentials
3. Check server logs
4. Verify database connection

### Tracking ID Not Showing:
1. Check if admin saved tracking number
2. Verify database update
3. Refresh orders page

### 7-Day Window Not Working:
1. Check delivered_at timestamp
2. Verify delivery status is "delivered"
3. Check date calculation logic

## Support

### Customer Support Flow:
1. Customer reports issue (within 7 days)
2. Issue saved to order_issues table
3. Admin views issues in dashboard
4. Admin resolves issue
5. Status updated to resolved

### Admin Dashboard (Future):
- View all issues
- Filter by status
- Assign to support team
- Add resolution notes
- Close issues

## Notes

- Cashfree charges per transaction
- Test thoroughly in sandbox before production
- Keep API keys secure
- Monitor webhook failures
- Set up email notifications for failed payments
- Consider adding SMS notifications for order updates
- Delhivery integration is manual (admin enters tracking ID)
- Consider automating Delhivery API integration in future
