# Having Issue Management & Logo Size Fix

## Issues Fixed ✅

### 1. Remove from "Having Issue" Feature
**Problem**: Orders marked as "having issue" stayed in that category forever, cluttering the admin view.

**Solution**: Added "Mark as Resolved" button for admin to remove orders from having issue list.

#### Implementation:

**New Function**:
```typescript
const removeFromHavingIssue = async (orderId: string) => {
    if (!confirm('Remove this order from "Having Issue" list?')) {
        return
    }

    setUpdating(orderId)

    try {
        const { error } = await supabase
            .from('orders')
            .update({
                has_issue: false,
                issue_reported_at: null
            })
            .eq('id', orderId)

        if (error) throw error

        await loadOrders()
        alert('Order removed from having issue list!')
    } catch (error) {
        console.error('Error updating order:', error)
        alert('Failed to update order')
    } finally {
        setUpdating(null)
    }
}
```

**UI Display**:
```tsx
{order.has_issue && (
    <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-500 rounded-lg">
        <div className="flex items-center justify-between">
            <div>
                <p className="font-bold text-orange-800 mb-1">⚠️ Customer Reported Issue</p>
                <p className="text-sm text-orange-700">
                    Reported on: {new Date(order.issue_reported_at).toLocaleString()}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                    Customer should have sent email with details and unboxing video
                </p>
            </div>
            <button
                onClick={() => removeFromHavingIssue(order.id)}
                disabled={updating === order.id}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium text-sm whitespace-nowrap"
            >
                Mark as Resolved
            </button>
        </div>
    </div>
)}
```

#### Features:
- ✅ Orange alert box shows when order has issue
- ✅ Displays when issue was reported
- ✅ Reminds admin to check email for details
- ✅ "Mark as Resolved" button to remove from list
- ✅ Confirmation dialog before removing
- ✅ Updates database (sets `has_issue = false`, `issue_reported_at = null`)
- ✅ Reloads orders to update UI
- ✅ Order disappears from "Having Issue" filter

### 2. Logo Size Changed to 24x16
**Problem**: Logo was too large in invoice (20x20 or 16x16).

**Solution**: Changed logo dimensions to 24x16 (width x height) in both header and footer.

#### Changes:

**Header Logo** (React JSX):
```tsx
// Before: w-20 h-20 (80x80px)
<div className="relative w-20 h-20 mb-2">

// After: w-24 h-16 (96x64px = 24x16 in rem)
<div className="relative w-24 h-16 mb-2 ml-auto">
```

**Footer Logo** (React JSX):
```tsx
// Before: w-16 h-16 (64x64px)
<div className="relative w-16 h-16 mx-auto mb-2">

// After: w-24 h-16 (96x64px = 24x16 in rem)
<div className="relative w-24 h-16 mx-auto mb-2">
```

**Print Window Logo** (HTML):
```css
/* Before */
.logo {
    width: 80px;
    height: 80px;
}

/* After */
.logo {
    width: 96px;
    height: 64px;
}

/* Footer logo */
.footer-logo {
    width: 96px;
    height: 64px;
}
```

## Admin Workflow

### Managing "Having Issue" Orders:

1. **Customer Reports Issue**:
   - Customer clicks "Having an Issue?" button on their order
   - Order is marked with `has_issue = true`
   - Timestamp saved in `issue_reported_at`
   - Gmail opens for customer to send details + video

2. **Admin Views Issue**:
   - Go to "Order Management"
   - Click "Having Issue" filter tab
   - See all orders with reported issues
   - Orange alert box shows on each order

3. **Admin Resolves Issue**:
   - Check email for customer's issue report
   - Review unboxing video
   - Take appropriate action (refund, replacement, etc.)
   - Click "Mark as Resolved" button
   - Confirm removal
   - Order removed from "Having Issue" list

4. **Clean Admin View**:
   - Only active issues show in filter
   - Resolved issues don't clutter the list
   - Easy to track pending customer issues

## Visual Changes

### Having Issue Alert Box:
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ Customer Reported Issue                          │
│ Reported on: 14/10/2024, 2:30 PM                   │
│ Customer should have sent email with details        │
│                                                      │
│                        [Mark as Resolved] ←Button   │
└─────────────────────────────────────────────────────┘
```

### Logo Dimensions:
```
Before:                After:
┌────────┐            ┌──────────────┐
│        │            │              │
│  Logo  │    →       │     Logo     │
│        │            │              │
│ 20x20  │            │    24x16     │
└────────┘            └──────────────┘
```

## Files Modified

1. `wc/app/admin/orders/page.tsx`:
   - Added `removeFromHavingIssue()` function
   - Added orange alert box UI for orders with issues
   - Added "Mark as Resolved" button

2. `wc/components/Invoice.tsx`:
   - Changed header logo: `w-20 h-20` → `w-24 h-16`
   - Changed footer logo: `w-16 h-16` → `w-24 h-16`
   - Updated print CSS: `80px x 80px` → `96px x 64px`

## Database Fields Used

- `has_issue` (boolean): Whether customer reported an issue
- `issue_reported_at` (timestamp): When issue was reported

## Testing Checklist

- [x] "Having Issue" filter shows orders with issues
- [x] Orange alert box displays on orders with issues
- [x] Shows issue reported timestamp
- [x] "Mark as Resolved" button appears
- [x] Confirmation dialog shows before removing
- [x] Order removed from database (has_issue = false)
- [x] Order disappears from "Having Issue" filter
- [x] Logo size is 24x16 in invoice header
- [x] Logo size is 24x16 in invoice footer
- [x] Logo size is 24x16 in print window
- [x] Logo maintains aspect ratio
- [x] No diagnostics errors

## Benefits

### For Admin:
- ✅ Clean, organized issue tracking
- ✅ Easy to see which issues are pending
- ✅ One-click resolution marking
- ✅ No clutter from resolved issues
- ✅ Clear visual indicator (orange box)

### For System:
- ✅ Proper state management
- ✅ Database stays clean
- ✅ Accurate filtering
- ✅ Audit trail (timestamp preserved until resolved)

### For Invoice:
- ✅ Professional logo sizing
- ✅ Consistent dimensions (24x16)
- ✅ Better visual balance
- ✅ Proper aspect ratio

All issues resolved! 🎉
