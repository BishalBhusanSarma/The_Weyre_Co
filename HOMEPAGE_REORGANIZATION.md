# Homepage Reorganization

## New Section Order

The homepage has been reorganized for better user experience:

### 1. **Trending Carousel** (Top)
- Shows first 5 trending products
- Auto-rotating carousel
- Large display with product details
- White borders (4px) around card and image

### 2. **Trending Now Products** (After Carousel)
- Shows products 6-17 (12 products initially)
- Grid layout (4 columns on desktop)
- "Show More" button loads 12 additional products
- White button with black text

### 3. **Shop by Category** (Middle)
- All product categories
- Grid layout (5 columns on desktop)
- Black cards with white borders on hover
- Quick navigation to filtered products

### 4. **Featured Collection** (Bottom)
- Shows 12 featured products initially
- Grid layout (4 columns on desktop)
- "Show More" button loads 12 additional products
- White button with black text

## Changes Made

### Section Reordering
- ✅ Moved Trending Now products to top (after carousel)
- ✅ Moved Shop by Category to middle
- ✅ Moved Featured Collection to bottom

### Trending Now Updates
- ✅ Shows 12 products initially (products 6-17 from trending list)
- ✅ First 5 products reserved for carousel
- ✅ "Show More" button increments by 12
- ✅ Button styled with white background and black text

### Featured Collection Updates
- ✅ "Show More" button now increments by 12 (was 8)
- ✅ Button styled with white background and black text
- ✅ Consistent with other sections

## User Flow

1. **Landing** → User sees trending carousel
2. **Scroll Down** → More trending products (12 visible)
3. **Click Show More** → 12 more trending products load
4. **Continue Scrolling** → Shop by Category section
5. **Browse Categories** → Quick access to filtered products
6. **Keep Scrolling** → Featured Collection (12 visible)
7. **Click Show More** → 12 more featured products load

## Benefits

- ✅ **Better Product Discovery** - Trending items get prime real estate
- ✅ **Consistent Pagination** - All sections use 12-product increments
- ✅ **Logical Flow** - Hot items → Categories → Curated picks
- ✅ **Improved UX** - Users see what's popular first
- ✅ **Faster Engagement** - Trending products catch attention immediately

## Technical Details

### State Management
- `displayedTrending` - Controls trending products display (initial: 12)
- `displayedFeatured` - Controls featured products display (initial: 12)
- Both increment by 12 on "Show More" click

### Product Slicing
- **Carousel**: `trendingProducts.slice(0, 5)` - First 5 products
- **Trending Section**: `trendingProducts.slice(5, 5 + displayedTrending)` - Products 6+
- **Featured Section**: `featuredProducts.slice(0, displayedFeatured)` - All featured

### Button Logic
- Trending: Shows when `trendingProducts.length > (5 + displayedTrending)`
- Featured: Shows when `featuredProducts.length > displayedFeatured`

## Testing Checklist
- [ ] Verify carousel shows first 5 trending products
- [ ] Check Trending Now section shows 12 products initially
- [ ] Confirm "Show More" loads 12 more trending products
- [ ] Verify Shop by Category appears after Trending
- [ ] Check Featured Collection appears last
- [ ] Confirm Featured "Show More" loads 12 products
- [ ] Test all buttons have white background with black text
- [ ] Verify responsive layout on mobile/tablet

## Files Modified
- ✅ `app/page.tsx` - Reorganized sections and updated pagination
