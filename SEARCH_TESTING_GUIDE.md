# 🧪 Search Testing Guide - Step by Step

## ✅ Quick Test Checklist

### Initial Page Load
- [ ] Navigate to `/vehicles` page
- [ ] See "Loading vehicles..." spinner
- [ ] Vehicles load after 1-2 seconds
- [ ] Each vehicle shows green "In Stock" badge
- [ ] Result counter shows total vehicles

### Search Functionality
- [ ] Click in search field
- [ ] Type "Toyota" - results filter instantly
- [ ] Type "Corolla" - further filters
- [ ] Results update without page refresh
- [ ] Result counter updates

### Clear Search
- [ ] Click X button in search field
- [ ] Search clears instantly
- [ ] All vehicles show again
- [ ] Result counter resets

### Clear Filters
- [ ] Apply search query
- [ ] "Clear Filters" button appears
- [ ] Click "Clear Filters" 
- [ ] All filters reset
- [ ] Full list shows again

### Error Handling
- [ ] Open browser console (F12)
- [ ] No red errors should appear
- [ ] Network tab shows successful requests
- [ ] API responses include vehicle data

---

## 🔍 Detailed Testing Scenarios

### Scenario 1: Basic Search
```
1. Go to /vehicles
2. Wait for "Loading vehicles..." to finish
3. Type "Honda" in search
4. Observe: Results filter to show Honda vehicles
5. Result counter updates (e.g., "5 Vehicles Available")
6. Type "Civic" to further filter
7. Observe: More specific results
8. Click X to clear
9. Observe: All vehicles show again
```

### Scenario 2: Brand Filter
```
1. Go to /vehicles
2. Scroll down to "Advance filters"
3. Select a brand from Brand dropdown
4. Observe: Vehicles update to show that brand only
5. Try searching within that brand
6. Combine search + brand filter
7. Click "Clear Filters"
8. Observe: Everything resets
```

### Scenario 3: Price Range Filter
```
1. Go to /vehicles
2. Scroll to price range inputs (if available)
3. Enter min price (e.g., 5000000)
4. Enter max price (e.g., 10000000)
5. Results filter to price range
6. Try search within price range
7. Click "Clear Filters"
8. Observe: Price inputs clear, all vehicles show
```

### Scenario 4: Multiple Filters
```
1. Go to /vehicles
2. Search "Toyota"
3. Select "Petrol" fuel type
4. Select "Automatic" transmission
5. Observe: Results show Toyota, Petrol, Automatic only
6. Result counter shows limited results
7. Click "Clear Filters"
8. All filters reset, full list shows
9. Result counter updates
```

### Scenario 5: No Results
```
1. Go to /vehicles
2. Search "ZzZzZzZ" (nonsense)
3. Observe: "No vehicles found" message
4. Message suggests: "Try adjusting your search criteria"
5. Click X to clear search
6. Observe: Vehicles appear again
```

### Scenario 6: Error Recovery
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to /vehicles
4. If error occurs, see "Error loading vehicles" message
5. Click "Try Again" button
6. Observe: Page retries loading
7. If still error, check network tab for error details
```

---

## 🖥️ Browser Console Verification

### Expected Console Output:
```javascript
// Should NOT see errors like:
// ❌ Error fetching vehicles
// ❌ Failed to fetch
// ❌ Uncaught Error

// Should see normal console logs only
// Network requests should show Status: 200
```

### How to Check:
1. Press `F12` (Developer Tools)
2. Go to "Console" tab
3. Look for any RED error messages
4. Go to "Network" tab
5. Look for `api/vehicles` requests
6. Should show Status "200" (green)

---

## 📊 Expected Results

### Initial Load
```
Status: 200
Response: {
  vehicles: [
    { id: 1, brand: "Toyota", model: "Aqua", price: 5490000, ... },
    { id: 2, brand: "Honda", model: "Civic", price: 6000000, ... },
    ...
  ],
  total: 45,
  limit: 12,
  offset: 0
}
```

### Search "Toyota"
```
Input: "toyota"
Filtered vehicles: 12 (example)
Result counter: "12 Vehicles Available"
All results have brand matching "Toyota"
```

### Clear Search
```
Input: "" (empty)
Vehicles: Show all again
Result counter: "45 Vehicles Available" (full list)
```

---

## 🚨 Troubleshooting

### Problem: Vehicles Don't Load
**Solution:**
1. Check internet connection
2. Check browser console for errors
3. Check if Supabase is accessible
4. Click "Try Again" button
5. Refresh page (Ctrl+R)

### Problem: Search Not Filtering
**Solution:**
1. Verify search text entered
2. Check browser console for errors
3. Check Network tab - API should return 200
4. Ensure vehicles exist in database
5. Try clearing search and re-entering

### Problem: "Error loading vehicles" Message
**Solution:**
1. Click "Try Again" button
2. Check browser console for details
3. Check Network tab for API response
4. Refresh page
5. Contact support if persists

### Problem: Filters Not Working
**Solution:**
1. Verify filter options are selected
2. Check "Clear Filters" button appears
3. Results should update when filter changes
4. Try closing and reopening page
5. Check browser console for errors

---

## ✨ Expected Behavior

### Loading States
```
✅ Initial load: Shows spinner + "Loading vehicles..."
✅ Search filtering: Shows spinner + "Searching vehicles..."
✅ After load: Hides spinner, shows results
```

### Result Display
```
✅ Each vehicle shows:
  - Vehicle image (or placeholder)
  - Brand name
  - Model name
  - Year
  - Price (formatted with spaces)
  - Fuel type
  - Transmission
  - Green "In Stock" badge
  - "View Details" button
```

### Filtering
```
✅ Search: Updates results instantly
✅ Brand filter: Shows only selected brand
✅ Fuel filter: Shows only selected fuel type
✅ Price filter: Shows only in price range
✅ Clear Filters: Resets all filters
```

### Error Handling
```
✅ API error: Shows error message
✅ No results: Shows friendly message
✅ Network error: Shows "Try Again" button
✅ Invalid input: Gracefully handles
```

---

## 📱 Mobile Testing

### On Mobile Browsers:
- [ ] Search field is full width
- [ ] Buttons are touch-friendly (large)
- [ ] Results are readable
- [ ] Scrolling works smoothly
- [ ] Filters scroll properly
- [ ] Badge visible on cards
- [ ] Loading spinner displays correctly

### On Tablet:
- [ ] Layout adapts to screen size
- [ ] Sidebar appears/hides appropriately
- [ ] Search works on tablet
- [ ] Touch interactions responsive

---

## 🎯 Performance Testing

### Expected Times:
- **Initial Load**: <2 seconds
- **Search Response**: <300ms
- **Filter Update**: <100ms
- **Page Interaction**: Smooth/Responsive

### Performance Check:
1. Open DevTools (F12)
2. Go to "Performance" tab
3. Click "Record"
4. Perform search
5. Stop recording
6. Check for Long Tasks (should be minimal)
7. Look for smooth frame rate

---

## ✅ Final Verification

Before considering complete:
- [ ] Initial page load works
- [ ] Search filters results
- [ ] Clear button clears search
- [ ] Filters work individually
- [ ] Filters work together
- [ ] "Clear Filters" resets everything
- [ ] Error states handle gracefully
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Mobile responsive works
- [ ] "In Stock" badge shows
- [ ] Result counter accurate

---

## 📞 Support

If any test fails:
1. Check browser console (F12)
2. Check Network tab for API response
3. Review error message details
4. Refer to `SEARCH_BUG_FIX_REPORT.md`
5. Contact development team

---

**Testing Status**: Ready for QA
**Last Updated**: October 31, 2025
**Test Date**: _______________
**Tester Name**: _______________
**Pass/Fail**: _______________
