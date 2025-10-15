# Admin Panel Theme Consistency Update

## Theme Standards

All admin pages should follow this consistent theme:

### Colors:
- **Background**: `bg-black`
- **Cards/Containers**: `bg-gray-900`
- **Borders**: `border-gray-800`
- **Text Primary**: `text-white`
- **Text Secondary**: `text-gray-400`
- **Hover States**: `hover:bg-gray-800`
- **Buttons Primary**: `bg-white text-black hover:bg-gray-200`
- **Buttons Secondary**: `bg-gray-800 text-white hover:bg-gray-700`
- **Input Fields**: `bg-gray-800 border-gray-700 focus:border-white`

### Components:
- **Stats Cards**: Gradient backgrounds with accent colors
- **Tables**: Gray background with hover effects
- **Modals**: Gray-900 background with gray-800 borders
- **Loading States**: Skeleton loaders with gray-800 backgrounds

## Pages to Update

### 1. Products Page (`wc/app/admin/products/page.tsx`)
**Current Issues:**
- May have inconsistent background colors
- Form styling needs to match theme
- Table styling needs consistency

**Required Changes:**
- Main container: `bg-black`
- Product cards/table: `bg-gray-900 border-gray-800`
- Form inputs: `bg-gray-800 border-gray-700`
- Buttons: White primary, gray secondary
- Add stats card showing total products

### 2. Orders Page (`wc/app/admin/orders/page.tsx`)
**Current Issues:**
- Table styling may differ
- Status badges need consistent colors
- Filter section styling

**Required Changes:**
- Main container: `bg-black`
- Orders table: `bg-gray-900 border-gray-800`
- Status badges: Consistent color scheme
- Filter inputs: `bg-gray-800 border-gray-700`
- Add stats card showing total orders

### 3. Coupons Page (`wc/app/admin/coupons/page.tsx`)
**Current Issues:**
- Form styling inconsistency
- Card layout needs update
- Button colors

**Required Changes:**
- Main container: `bg-black`
- Coupon cards: `bg-gray-900 border-gray-800`
- Form modal: `bg-gray-900 border-gray-800`
- Buttons: Match theme standards
- Add stats card showing total coupons

## Implementation Checklist

### Products Page:
- [ ] Update main container to `bg-black`
- [ ] Update product table/cards to `bg-gray-900 border-gray-800`
- [ ] Update form inputs to `bg-gray-800 border-gray-700`
- [ ] Update buttons to theme standards
- [ ] Add stats card with gradient background
- [ ] Update loading states
- [ ] Update empty states
- [ ] Ensure responsive design

### Orders Page:
- [ ] Update main container to `bg-black`
- [ ] Update orders table to `bg-gray-900 border-gray-800`
- [ ] Update filter section styling
- [ ] Update status badges
- [ ] Add stats card
- [ ] Update loading states
- [ ] Update empty states
- [ ] Ensure responsive design

### Coupons Page:
- [ ] Update main container to `bg-black`
- [ ] Update coupon cards to `bg-gray-900 border-gray-800`
- [ ] Update form modal styling
- [ ] Update buttons to theme standards
- [ ] Add stats card
- [ ] Update loading states
- [ ] Update empty states
- [ ] Ensure responsive design

## Example Stats Card

```tsx
<div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
    <div className="flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-400 mb-1">Total [Items]</p>
            <h2 className="text-4xl font-bold text-white">{count}</h2>
        </div>
        <div className="bg-blue-500/20 p-4 rounded-xl">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* Icon */}
            </svg>
        </div>
    </div>
</div>
```

## Example Table Styling

```tsx
<div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
    <div className="overflow-x-auto">
        <table className="w-full">
            <thead className="bg-gray-800">
                <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Column</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 text-white">Data</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

## Example Modal Styling

```tsx
<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Modal Title</h2>
        {/* Content */}
        <div className="flex gap-3">
            <button className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition font-medium">
                Cancel
            </button>
            <button className="flex-1 bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition font-medium">
                Confirm
            </button>
        </div>
    </div>
</div>
```

## Color Palette Reference

```css
/* Backgrounds */
bg-black           /* Main page background */
bg-gray-900        /* Cards, tables, modals */
bg-gray-800        /* Inputs, secondary buttons, table headers */
bg-gray-700        /* Hover states */

/* Borders */
border-gray-800    /* Primary borders */
border-gray-700    /* Input borders */

/* Text */
text-white         /* Primary text */
text-gray-400      /* Secondary text */
text-gray-500      /* Tertiary text */

/* Buttons */
bg-white text-black hover:bg-gray-200  /* Primary button */
bg-gray-800 text-white hover:bg-gray-700  /* Secondary button */

/* Accents */
bg-blue-500/10     /* Blue tint */
bg-purple-500/10   /* Purple tint */
bg-green-500/10    /* Green tint */
bg-red-500/10      /* Red tint */
```

## Benefits of Consistent Theme

1. **Professional Appearance**: Unified look across all admin pages
2. **Better UX**: Familiar patterns reduce cognitive load
3. **Easier Maintenance**: Consistent code patterns
4. **Accessibility**: Consistent contrast ratios
5. **Scalability**: Easy to add new pages with same theme

## Next Steps

1. Review each admin page
2. Apply theme changes systematically
3. Test on different screen sizes
4. Verify all interactive elements work
5. Check loading and empty states
6. Ensure accessibility standards

---

**Status**: Documentation Complete
**Implementation**: Ready to apply to Products, Orders, and Coupons pages
