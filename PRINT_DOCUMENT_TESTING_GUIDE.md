# Print Document Feature - Testing Guide

## 🧪 Complete Testing Checklist

### Pre-Test Setup
- [ ] Dashboard is running (`npm run dev`)
- [ ] Database has pending vehicle sales
- [ ] Template images exist in `/dashboard/public/documents/`
- [ ] Browser developer tools open for debugging

---

## 1️⃣ Visual Tests

### Print Icon Display
- [ ] Print icon visible in Actions column
- [ ] Icon positioned between "Sold out" and Delete
- [ ] Icon size matches other action icons (20px)
- [ ] Gray color (#6B7280) applied
- [ ] Hover changes color to darker gray (#111827)
- [ ] Hover adds background color (gray-100)
- [ ] Border radius creates rounded corners
- [ ] Tooltip "Print Documents" appears on hover

### Table Layout
- [ ] Actions column not too wide
- [ ] All buttons aligned properly
- [ ] No layout shift when hovering
- [ ] Responsive on different screen sizes

---

## 2️⃣ Modal Tests

### Opening Modal
- [ ] Click print icon opens modal
- [ ] Modal appears centered on screen
- [ ] Backdrop overlay is visible (50% black)
- [ ] Modal animation smooth
- [ ] No console errors when opening

### Modal Content
- [ ] "Document Print" header visible
- [ ] Close (X) button in top-right
- [ ] Vehicle information displays correctly:
  - [ ] Brand name
  - [ ] Model name
  - [ ] Year
  - [ ] Vehicle number (in green)
- [ ] "Documents are ready to print!" message shows
- [ ] All 5 buttons visible:
  - [ ] Print Cash Seller
  - [ ] Print Cash Dealer
  - [ ] Advance Note
  - [ ] Print Finance Seller
  - [ ] Print Finance Dealer
- [ ] Printer icons visible on buttons
- [ ] Buttons have proper styling (border, padding)

### Modal Interactions
- [ ] Hover on buttons changes appearance
- [ ] Click close (X) button closes modal
- [ ] Click outside modal closes it (backdrop click)
- [ ] ESC key closes modal (if implemented)
- [ ] Modal scrollable if content overflows

---

## 3️⃣ Data Loading Tests

### Database Query
- [ ] Sale data fetches on modal open
- [ ] Loading state displays briefly
- [ ] No errors in console
- [ ] All related data joins work:
  - [ ] Vehicle details
  - [ ] Brand/Model names
  - [ ] Customer information
  - [ ] Seller information
  - [ ] Sales agent information
  - [ ] Finance company (if applicable)

### Data Display
Test with different scenarios:
- [ ] **Cash sale:** All cash fields populated
- [ ] **Finance sale:** Finance company shows
- [ ] **With PCN advance:** Advance amount displays
- [ ] **Missing optional data:** Handles gracefully (no errors)
- [ ] **Special characters:** Names with apostrophes, etc.
- [ ] **Long text:** Addresses that might overflow

---

## 4️⃣ Document Generation Tests

### Template Loading
Test each document type:

#### Cash Seller
- [ ] Template image loads
- [ ] No 404 errors in console
- [ ] Image displays full resolution

#### Cash Dealer
- [ ] Template image loads
- [ ] No 404 errors in console
- [ ] Image displays full resolution

#### Advance Note
- [ ] Template image loads
- [ ] No 404 errors in console
- [ ] Image displays full resolution

#### Finance Seller
- [ ] Template image loads
- [ ] No 404 errors in console
- [ ] Image displays full resolution

#### Finance Dealer
- [ ] Template image loads
- [ ] No 404 errors in console
- [ ] Image displays full resolution

### Data Overlay
For each document type, verify:
- [ ] Text appears in RED (#FF0000)
- [ ] Font is bold Arial 32px
- [ ] Text positioned correctly (not overlapping)
- [ ] All required fields populated
- [ ] Dates formatted correctly (MM/DD/YYYY)
- [ ] Currency formatted with Rs. prefix
- [ ] Numbers have comma separators
- [ ] Calculated fields correct (balance = sell - advance)

### Specific Field Tests

#### Cash Seller Fields:
- [ ] Seller Name (top)
- [ ] Seller Address
- [ ] Seller City
- [ ] Date
- [ ] Vehicle Number
- [ ] Vehicle Brand/Model
- [ ] Customer Address
- [ ] Customer Name
- [ ] Selling Amount
- [ ] Seller NIC
- [ ] Customer NIC

#### Cash Dealer Fields:
- [ ] Vehicle Number
- [ ] Date
- [ ] Vehicle Brand/Model
- [ ] Customer Address
- [ ] Customer Name
- [ ] Selling Amount
- [ ] Customer Name (bottom)
- [ ] Customer Mobile
- [ ] Customer NIC

#### Advance Note Fields:
- [ ] Date
- [ ] Vehicle Number
- [ ] Vehicle Brand/Model
- [ ] Customer Address
- [ ] Customer Name
- [ ] Selling Amount
- [ ] PCN Advance Amount
- [ ] Close Date
- [ ] Customer Mobile
- [ ] Customer NIC

#### Finance Seller Fields:
- [ ] Seller Name
- [ ] Seller Address
- [ ] Seller City
- [ ] Date
- [ ] Vehicle Number
- [ ] Vehicle Brand/Model
- [ ] Customer Address
- [ ] Customer Name
- [ ] Selling Amount
- [ ] Advance Amount
- [ ] Balance (calculated)
- [ ] Finance Company
- [ ] Seller NIC
- [ ] Customer NIC

#### Finance Dealer Fields:
- [ ] Vehicle Number
- [ ] Date
- [ ] Vehicle Brand/Model
- [ ] Customer Address
- [ ] Customer Name
- [ ] Selling Amount
- [ ] Advance Amount
- [ ] Balance (calculated)
- [ ] Finance Company
- [ ] Customer Name (bottom)
- [ ] Customer Mobile
- [ ] Customer NIC

---

## 5️⃣ Print Functionality Tests

### Print Dialog
- [ ] Browser print dialog opens
- [ ] Document preview visible
- [ ] Page size correct (matches template)
- [ ] Print quality acceptable
- [ ] Colors preserved (red text visible)

### Print Options
- [ ] Can select printer
- [ ] Can change number of copies
- [ ] Can select page range
- [ ] Can adjust print settings
- [ ] Can save as PDF
- [ ] PDF saves correctly
- [ ] PDF opens and displays correctly

### Post-Print
- [ ] Print window closes after printing
- [ ] Modal still open (doesn't auto-close)
- [ ] Can print multiple documents in succession
- [ ] No memory leaks after multiple prints

---

## 6️⃣ Error Handling Tests

### Network Errors
- [ ] Handles database connection issues
- [ ] Shows appropriate error message
- [ ] Doesn't crash modal

### Missing Data
- [ ] Handles null seller gracefully
- [ ] Handles missing finance company
- [ ] Handles missing PCN advance
- [ ] Handles missing optional fields

### Image Loading Errors
- [ ] Detects if template image fails to load
- [ ] Shows error message to user
- [ ] Doesn't break other document types

### Invalid Data
- [ ] Handles very long text (truncate or wrap)
- [ ] Handles special characters in names
- [ ] Handles zero/negative amounts
- [ ] Handles invalid dates

---

## 7️⃣ Performance Tests

### Load Time
- [ ] Modal opens quickly (<500ms)
- [ ] Data fetches quickly (<1s)
- [ ] Template loads quickly (<2s)
- [ ] Canvas rendering quick (<1s)

### Memory Usage
- [ ] No memory leaks after multiple opens
- [ ] Canvas clears properly
- [ ] Images garbage collected
- [ ] No growing memory footprint

### Multiple Operations
- [ ] Can open modal multiple times
- [ ] Can print different vehicles in sequence
- [ ] Can print same vehicle multiple times
- [ ] Can switch between document types

---

## 8️⃣ Browser Compatibility Tests

### Chrome
- [ ] Print icon displays
- [ ] Modal works
- [ ] Print dialog opens
- [ ] PDF generation works

### Firefox
- [ ] Print icon displays
- [ ] Modal works
- [ ] Print dialog opens
- [ ] PDF generation works

### Safari
- [ ] Print icon displays
- [ ] Modal works
- [ ] Print dialog opens
- [ ] PDF generation works

### Edge
- [ ] Print icon displays
- [ ] Modal works
- [ ] Print dialog opens
- [ ] PDF generation works

---

## 9️⃣ Responsive Design Tests

### Desktop (1920x1080)
- [ ] Modal centered
- [ ] All buttons visible
- [ ] Text readable
- [ ] Print icon sized correctly

### Laptop (1366x768)
- [ ] Modal fits on screen
- [ ] Scrolling works if needed
- [ ] All content accessible

### Tablet (768x1024)
- [ ] Modal adapts to screen
- [ ] Buttons stack properly
- [ ] Touch targets large enough

### Mobile (375x667)
- [ ] Modal takes full width
- [ ] Buttons full width
- [ ] Text sizes appropriate
- [ ] Can scroll content

---

## 🔟 Integration Tests

### With Pending Sales Table
- [ ] Refresh after print maintains table state
- [ ] Pagination preserved
- [ ] Search filter preserved
- [ ] Sort order maintained

### With Other Modals
- [ ] Doesn't conflict with View Details modal
- [ ] Doesn't conflict with Delete modal
- [ ] Doesn't conflict with Sold Out modal
- [ ] Z-index stacking correct

### With Navigation
- [ ] Modal closes on tab change
- [ ] Modal closes on page navigation
- [ ] No route conflicts

---

## 🎯 Real-World Scenarios

### Scenario 1: Print Cash Sale Documents
1. Find pending cash sale
2. Click print icon
3. Print Cash Seller
4. Print Cash Dealer
5. Verify both correct

### Scenario 2: Print Finance Sale Documents
1. Find pending finance sale
2. Click print icon
3. Print Finance Seller
4. Print Finance Dealer
5. Verify both correct
6. Check finance company name

### Scenario 3: Print Advance Note
1. Find sale with advance
2. Click print icon
3. Print Advance Note
4. Verify PCN advance amount

### Scenario 4: Multiple Documents
1. Open print modal
2. Print Cash Seller
3. Print Advance Note
4. Print Finance Dealer
5. All should work without closing modal

### Scenario 5: Different Vehicles
1. Print document for Vehicle A
2. Close modal
3. Print document for Vehicle B
4. Verify different data

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________
Browser: _______________
OS: _______________

✅ = Pass
❌ = Fail
⚠️ = Issue (note below)

Visual Tests:        ___
Modal Tests:         ___
Data Loading Tests:  ___
Document Gen Tests:  ___
Print Tests:         ___
Error Handling:      ___
Performance:         ___
Browser Compat:      ___
Responsive:          ___
Integration:         ___

Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

Overall Status: _______________
```

---

## 🚨 Common Issues & Solutions

### Issue: Template image not loading
**Solution:** Check file path, verify image exists in `/public/documents/`

### Issue: Data not appearing on document
**Solution:** Check coordinates, verify data exists in database

### Issue: Print dialog doesn't open
**Solution:** Check browser popup blocker settings

### Issue: Text overlapping
**Solution:** Adjust X/Y coordinates in PrintDocumentModal.tsx

### Issue: Wrong data displayed
**Solution:** Verify database query includes all required joins

### Issue: Modal won't close
**Solution:** Check event handlers, verify state management

---

## ✅ Sign-Off Checklist

Before marking as complete:
- [ ] All visual tests passed
- [ ] All modal tests passed
- [ ] All data loading tests passed
- [ ] All document generation tests passed
- [ ] All print functionality tests passed
- [ ] Error handling robust
- [ ] Performance acceptable
- [ ] Works on all major browsers
- [ ] Responsive design verified
- [ ] Integration with existing features confirmed
- [ ] Real-world scenarios tested
- [ ] Documentation complete

---

**Testing Status:** Ready for QA

**Estimated Testing Time:** 2-3 hours

**Priority Issues:** None (all core functionality working)

**Nice-to-Have Improvements:** Listed in main documentation

---

## 📝 Notes Section

Use this space to record any observations, edge cases, or suggestions:

```
_________________________________________
_________________________________________
_________________________________________
_________________________________________
_________________________________________
```

---

**Document Version:** 1.0  
**Last Updated:** November 2, 2025  
**Status:** ✅ Ready for Testing
