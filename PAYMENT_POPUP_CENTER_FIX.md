# Payment Success Popup Centering Fix

## Issue
The payment success/failed popup was sticking to the top near the navbar instead of being centered in the middle of the screen.

## Solution
Changed the layout to use flexbox centering for vertical alignment.

## Changes Made

### File: `wc/app/payment/callback/page.tsx`

**Before:**
```tsx
<div className="min-h-screen bg-black">
    <Navbar />
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12 text-center">
            {/* Content */}
        </div>
    </div>
</div>
```

**After:**
```tsx
<div className="min-h-screen bg-black flex flex-col">
    <Navbar />
    <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12 text-center">
            {/* Content */}
        </div>
    </div>
</div>
```

## What Changed

### Layout Structure
1. **Parent container:** Added `flex flex-col` to create a vertical flex layout
2. **Content wrapper:** Added `flex-1 flex items-center justify-center` to:
   - `flex-1`: Take up remaining space after navbar
   - `flex items-center`: Center vertically
   - `justify-center`: Center horizontally
3. **Card:** Added `w-full` to ensure proper width within centered container

### Visual Result

**Before:**
```
┌─────────────────────┐
│      Navbar         │
├─────────────────────┤
│                     │
│  ┌───────────────┐  │
│  │ Payment Card  │  │ ← Stuck near top
│  └───────────────┘  │
│                     │
│                     │
│                     │
│                     │
└─────────────────────┘
```

**After:**
```
┌─────────────────────┐
│      Navbar         │
├─────────────────────┤
│                     │
│                     │
│  ┌───────────────┐  │
│  │ Payment Card  │  │ ← Centered!
│  └───────────────┘  │
│                     │
│                     │
└─────────────────────┘
```

## Benefits

✅ **Better UX** - Content is centered and easier to focus on
✅ **Professional look** - Follows modern design patterns
✅ **Responsive** - Works on all screen sizes
✅ **Consistent** - Matches modal/popup behavior expectations

## Testing

Test all three states:
- ✅ Loading spinner (centered)
- ✅ Success message (centered)
- ✅ Failed message (centered)

## Status

✅ **Fixed!** Payment popup now appears in the center of the screen.

---

**Note:** This uses Tailwind's flexbox utilities for clean, responsive centering without custom CSS.
