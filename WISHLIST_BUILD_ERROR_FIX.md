# Wishlist Build Error Fix

## Error
```
Type error: Cannot find name 'setLoginMessage'.
Line 119: setLoginMessage('buy this product')
```

## Root Cause
The wishlist page was using `setLoginMessage` and `setShowLoginPopup` but these state variables were not declared.

## Fix Applied

### File: `wc/app/wishlist/page.tsx`

#### 1. Added Missing State Variables
```typescript
const [showLoginPopup, setShowLoginPopup] = useState(false)
const [loginMessage, setLoginMessage] = useState('')
```

#### 2. Added Missing Import
```typescript
import LoginRequiredPopup from '@/components/LoginRequiredPopup'
```

#### 3. Added Missing Component
```typescript
<LoginRequiredPopup
    show={showLoginPopup}
    onClose={() => setShowLoginPopup(false)}
    message={loginMessage}
/>
```

## What This Does
When a user who is not logged in tries to:
- Buy a product from wishlist
- Add to cart from wishlist

They will see a popup asking them to log in, instead of getting an error.

## Status
✅ Build error fixed
✅ Wishlist page compiles successfully
✅ Login popup functionality restored
