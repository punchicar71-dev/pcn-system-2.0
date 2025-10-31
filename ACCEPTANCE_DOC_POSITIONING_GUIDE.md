# Acceptance Document Field Positioning Guide

## Quick Reference for Adjusting Field Positions

When you upload your acceptance.png template, you may need to adjust where the data appears on the document. Here's how to do it:

## Location in Code
File: `dashboard/src/components/vehicle/Step7Success.tsx`
Function: `handlePrintAcceptanceDoc()`
Section: Look for the `<style>` tag with CSS classes

## Field Position Classes

### 1. Date Field
```css
.date {
  top: 240px;      /* Distance from top of page */
  right: 120px;    /* Distance from right edge */
  font-size: 13px;
}
```
**Displays**: Current date (DD/MM/YYYY format)
**Example**: 31/10/2025

---

### 2. Address & City
```css
.address-city {
  top: 312px;        /* Distance from top */
  left: 330px;       /* Distance from left edge */
  font-size: 13px;
  max-width: 400px;  /* Prevents text from being too wide */
}
```
**Displays**: `{address}, {city}`
**Example**: 46/KL, Gemunupura, Kothalawala, Kaduwela

---

### 3. Seller Name
```css
.seller-name {
  top: 346px;      /* Distance from top */
  left: 170px;     /* Distance from left edge */
  font-size: 13px;
}
```
**Displays**: `{firstName} {lastName}`
**Example**: John Doe

---

### 4. Vehicle Number
```css
.vehicle-number {
  top: 380px;        /* Distance from top */
  left: 470px;       /* Distance from left edge */
  font-size: 13px;
  font-weight: 600;  /* Makes text bold */
}
```
**Displays**: Vehicle registration number
**Example**: CAA-1234

---

### 5. Brand & Model
```css
.brand-model {
  top: 415px;      /* Distance from top */
  left: 100px;     /* Distance from left edge */
  font-size: 13px;
}
```
**Displays**: `{brand}, {model}`
**Example**: Toyota, Aqua

---

### 6. ID Number (NIC)
```css
.id-number {
  top: 798px;      /* Distance from top */
  right: 260px;    /* Distance from right edge */
  font-size: 13px;
}
```
**Displays**: National ID number
**Example**: 123456789V

---

### 7. Mobile Number
```css
.mobile-number {
  top: 838px;      /* Distance from top */
  left: 260px;     /* Distance from left edge */
  font-size: 13px;
}
```
**Displays**: Contact mobile number
**Example**: 0771234567

---

## How to Adjust Positions

### Step-by-Step Process:

1. **Print a Test Document**
   - Add a test vehicle through the system
   - Click "Print Acceptance Doc" on Step 7
   - Review where the text appears on your template

2. **Identify Issues**
   - Is text too high? Increase `top` value
   - Is text too low? Decrease `top` value
   - Is text too far left? Increase `left` value
   - Is text too far right? Decrease `left` value or increase `right` value

3. **Update CSS Values**
   - Open `Step7Success.tsx`
   - Find the `handlePrintAcceptanceDoc()` function
   - Locate the `<style>` section
   - Update the pixel values for the field you want to adjust

4. **Test Again**
   - Save the file
   - Refresh your browser
   - Test print again to verify

### Example Adjustment:

**Problem**: Date is too low on the page

**Before:**
```css
.date {
  top: 240px;
  right: 120px;
}
```

**After** (move up 20 pixels):
```css
.date {
  top: 220px;  /* Changed from 240px */
  right: 120px;
}
```

---

## A4 Page Reference

Standard A4 dimensions used in the template:
- **Width**: 210mm (≈ 794 pixels)
- **Height**: 297mm (≈ 1123 pixels)

### Position Guide:
```
Top of page:    0px
Quarter page:   280px
Half page:      560px
Three-quarter:  840px
Bottom:         1123px

Left edge:      0px
Quarter width:  198px
Half width:     397px
Right edge:     794px
```

---

## Common Adjustments

### Making Text Bigger
```css
.field-name {
  font-size: 16px;  /* Increase from 13px */
}
```

### Making Text Bold
```css
.field-name {
  font-weight: 600;  /* or 700 for bolder */
}
```

### Limiting Text Width
```css
.field-name {
  max-width: 300px;  /* Text will wrap if longer */
}
```

### Changing Text Color
```css
.field-name {
  color: #000;  /* Black */
  /* or */
  color: #333;  /* Dark gray */
}
```

---

## Testing Tips

1. **Use Browser Dev Tools**
   - After print window opens, press F12
   - Use "Select Element" tool to inspect field positions
   - Temporarily modify CSS to see live changes

2. **Print to PDF**
   - Select "Save as PDF" in print dialog
   - This lets you check positioning without wasting paper

3. **Test with Different Data Lengths**
   - Short names: "Jo Do"
   - Long names: "Somapala Wickramasinghe"
   - Long addresses to check wrapping

4. **Check All Fields**
   - Make sure all 7 fields are visible
   - Verify no text overlaps
   - Ensure text fits within template boundaries

---

## Quick Copy-Paste Template

Use this as a starting point and adjust the values:

```css
.date {
  top: 240px;
  right: 120px;
  font-size: 13px;
}

.address-city {
  top: 312px;
  left: 330px;
  font-size: 13px;
  max-width: 400px;
}

.seller-name {
  top: 346px;
  left: 170px;
  font-size: 13px;
}

.vehicle-number {
  top: 380px;
  left: 470px;
  font-size: 13px;
  font-weight: 600;
}

.brand-model {
  top: 415px;
  left: 100px;
  font-size: 13px;
}

.id-number {
  top: 798px;
  right: 260px;
  font-size: 13px;
}

.mobile-number {
  top: 838px;
  left: 260px;
  font-size: 13px;
}
```

---

## Need Help?

If you're having trouble positioning the fields:

1. Take a screenshot of the printed document
2. Mark where each field should be
3. Measure distances from edges using an image editor
4. Update the CSS values accordingly

Remember: The template image (`acceptance.png`) will show in the background, and the text will overlay on top of it. Adjust the positions until the text aligns with the appropriate fields on your template image.
