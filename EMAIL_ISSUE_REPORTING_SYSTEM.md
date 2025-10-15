# Email-Based Issue Reporting System

## ✅ Features Implemented

### 1. Gmail Integration for Issue Reporting
**Location:** Customer Orders Page (`/orders`)

When customers click "Having an Issue?" button, it now:
- Opens their default email client (Gmail, Outlook, etc.)
- Pre-fills email to: `theweyreco.official@gmail.com`
- Includes order details automatically
- Requests mandatory unboxing video
- Allows optional pictures

### 2. "Having Issue" Filter Tab in Admin
**Location:** Admin Orders Page (`/admin/orders`)

New filter tab shows:
- All delivered orders within 7 days
- Orders eligible for issue reporting
- Easy access for customer service team

---

## 🎯 Why Email-Based System?

### Benefits
✅ **Professional Communication** - Direct email thread
✅ **File Attachments** - Easy to attach videos and pictures
✅ **Email Trail** - Complete conversation history
✅ **No Database Storage** - No need to store large video files
✅ **Familiar Interface** - Customers know how to use email
✅ **Better Support** - Personal touch with email responses

### Previous System
- Modal form on website
- Limited to text description
- No file attachments
- Stored in database
- Less personal

---

## 📧 Email Template

### Pre-filled Email Content

**To:** theweyreco.official@gmail.com

**Subject:** Order Issue Report - Order ID: [First 8 chars]

**Body:**
```
Dear The Weyre Co. Team,

I am writing to report an issue with my recent order.

Order Details:
- Order ID: [Full Order ID]
- Order Date: [Date]
- Total Amount: ₹[Amount]

Products Ordered:
- [Product 1] (Qty: X)
- [Product 2] (Qty: Y)

Issue Description:
[Customer fills this in]

IMPORTANT: 
- Please attach a video of the product unboxing (MANDATORY)
- You may also attach related pictures if available

Customer Details:
- Name: [Customer Name]
- Email: [Customer Email]
- Phone: [Customer Phone]

Thank you for your assistance.

Best regards,
[Customer Name]
```

---

## 🎨 Customer Experience

### Step-by-Step Flow

**1. Customer Receives Order**
```
Order delivered → 7-day window starts
```

**2. Customer Finds Issue**
```
Goes to Orders page → Sees "Having an Issue?" button
```

**3. Clicks Button**
```
Email client opens → Pre-filled template
```

**4. Customer Adds Details**
```
- Describes issue
- Attaches unboxing video (MANDATORY)
- Attaches pictures (OPTIONAL)
```

**5. Sends Email**
```
Email sent to theweyreco.official@gmail.com
```

**6. Support Team Responds**
```
Team reviews → Responds via email → Resolves issue
```

---

## 🎯 Admin "Having Issue" Filter

### What It Shows

**Filter Criteria:**
- Delivery Status: `delivered`
- Has `delivered_at` timestamp
- Within 7 days of delivery

**Purpose:**
- Quick access to orders that might have issues
- Proactive customer service
- Monitor recent deliveries

### Visual Design

```
Filter Tabs:
┌────────┬─────────┬─────────┬───────────┬───────────┬──────────────┬──────────────┐
│ All    │ Pending │ Shipped │ Delivered │ Cancelled │Return/Refund │Having Issue  │
│ (45)   │  (12)   │  (8)    │   (20)    │    (3)    │     (5)      │     (8)      │
│ BLACK  │ YELLOW  │  BLUE   │   GREEN   │    RED    │   PURPLE     │   ORANGE     │
└────────┴─────────┴─────────┴───────────┴───────────┴──────────────┴──────────────┘
```

**Color:** 🟠 Orange (attention needed)

---

## 💡 Use Cases

### Use Case 1: Damaged Product
```
Customer:
1. Receives damaged product
2. Clicks "Having an Issue?"
3. Email opens with order details
4. Describes damage
5. Attaches unboxing video showing damage
6. Sends email

Support Team:
1. Receives email
2. Reviews video
3. Confirms damage
4. Processes replacement/refund
5. Responds to customer
```

### Use Case 2: Wrong Item
```
Customer:
1. Receives wrong item
2. Clicks "Having an Issue?"
3. Describes wrong item received
4. Attaches video showing wrong product
5. Sends email

Support Team:
1. Reviews video
2. Confirms error
3. Arranges correct item delivery
4. Processes return of wrong item
```

### Use Case 3: Missing Parts
```
Customer:
1. Product missing accessories
2. Clicks "Having an Issue?"
3. Lists missing parts
4. Attaches video showing package contents
5. Sends email

Support Team:
1. Reviews video
2. Confirms missing parts
3. Ships missing parts
4. Follows up with customer
```

---

## 🎨 Button Behavior

### Customer Orders Page

**When Button Shows:**
- Order status: `delivered`
- Within 7 days of delivery
- Has `delivered_at` timestamp

**Button Appearance:**
```
┌─────────────────────────┐
│  Having an Issue?       │  Red button
│  (Hover: darker red)    │  Full width
└─────────────────────────┘
```

**On Click:**
```javascript
// Opens email client with pre-filled template
window.location.href = mailtoLink
```

---

## 📊 Admin Dashboard

### "Having Issue" Tab

**Shows:**
- All delivered orders from last 7 days
- Orders where customers can report issues
- Sorted by delivery date (newest first)

**Count Badge:**
- Shows number of eligible orders
- Updates in real-time
- Orange color for visibility

**Use For:**
- Proactive customer service
- Monitor recent deliveries
- Quick access to potential issues
- Follow up with customers

---

## 🔍 Technical Implementation

### Customer Side

**Email Generation:**
```typescript
const handleReportIssue = (order: any) => {
  // Build order items list
  const orderItems = order.order_items.map((item: any) => 
    `- ${item.products.name} (Qty: ${item.quantity})`
  ).join('\n')

  // Create subject and body
  const subject = `Order Issue Report - Order ID: ${order.id.slice(0, 8)}`
  const body = `[Pre-filled template with order details]`

  // Create mailto link
  const mailtoLink = `mailto:theweyreco.official@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  // Open email client
  window.location.href = mailtoLink
}
```

### Admin Side

**Filter Logic:**
```typescript
if (statusFilter === 'having_issue') {
  filtered = filtered.filter(order => {
    if (order.delivery_status !== 'delivered' || !order.delivered_at) return false
    const deliveredDate = new Date(order.delivered_at)
    const now = new Date()
    const daysSinceDelivery = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceDelivery <= 7
  })
}
```

---

## 📝 Email Requirements

### Mandatory
✅ **Unboxing Video**
- Shows product condition
- Proves issue exists
- Required for all claims

### Optional
📷 **Pictures**
- Additional evidence
- Close-up shots
- Different angles

### Why Video is Mandatory?
- **Proof of Condition** - Shows actual state
- **Prevents Fraud** - Harder to fake
- **Clear Evidence** - Better than pictures
- **Complete View** - Shows all aspects
- **Timestamp** - Proves when opened

---

## 🎯 Support Team Workflow

### Receiving Issue Reports

**1. Email Arrives**
```
From: customer@email.com
To: theweyreco.official@gmail.com
Subject: Order Issue Report - Order ID: ABC12345
Attachments: unboxing_video.mp4
```

**2. Review Details**
```
- Check order ID in admin panel
- Verify order details
- Watch unboxing video
- Assess issue severity
```

**3. Take Action**
```
- Approve replacement/refund
- Update order status if needed
- Respond to customer
- Process resolution
```

**4. Follow Up**
```
- Confirm resolution
- Request feedback
- Close ticket
```

---

## 🧪 Testing Checklist

### Customer Side
- [ ] "Having an Issue?" button shows for delivered orders
- [ ] Button only shows within 7 days
- [ ] Button doesn't show after 7 days
- [ ] Clicking opens email client
- [ ] Email has correct recipient
- [ ] Subject line includes order ID
- [ ] Body includes all order details
- [ ] Body includes customer details
- [ ] Body mentions mandatory video
- [ ] Body mentions optional pictures

### Admin Side
- [ ] "Having Issue" tab visible
- [ ] Tab shows correct count
- [ ] Filter shows delivered orders only
- [ ] Filter shows orders within 7 days
- [ ] Filter excludes orders older than 7 days
- [ ] Orange color displays correctly
- [ ] Count updates when orders change

---

## 📊 Comparison

### Before vs After

**Before:**
```
Modal Form
├─ Issue Type dropdown
├─ Description textarea
├─ Submit button
└─ Saves to database

Limitations:
❌ No file attachments
❌ Limited description
❌ No video support
❌ Database storage needed
❌ Less personal
```

**After:**
```
Email System
├─ Opens email client
├─ Pre-filled template
├─ Attach video (mandatory)
├─ Attach pictures (optional)
└─ Direct to support email

Benefits:
✅ File attachments supported
✅ Detailed communication
✅ Video evidence
✅ No database storage
✅ Personal touch
✅ Email thread history
```

---

## 🎊 Summary

**Features Added:**
1. ✅ Email-based issue reporting
2. ✅ Pre-filled email template
3. ✅ Mandatory video requirement
4. ✅ Optional picture attachments
5. ✅ "Having Issue" admin filter tab
6. ✅ 7-day eligibility window

**Files Modified:**
- `wc/app/orders/page.tsx` - Email integration
- `wc/app/admin/orders/page.tsx` - Having Issue filter

**Email Address:**
- `theweyreco.official@gmail.com`

**Result:** Professional, email-based issue reporting system with video evidence requirement! 🚀

---

## 📞 Quick Reference

### For Customers
```
Issue with order?
→ Go to Orders page
→ Click "Having an Issue?"
→ Email opens
→ Describe issue
→ Attach unboxing video (MUST)
→ Attach pictures (optional)
→ Send email
→ Wait for response
```

### For Support Team
```
Email received?
→ Check order in admin
→ Click "Having Issue" tab
→ Find the order
→ Watch video
→ Assess issue
→ Process resolution
→ Reply to customer
```

**Simple, effective, and professional!** ✅
