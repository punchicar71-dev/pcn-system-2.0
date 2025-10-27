# 🚀 Quick Start Guide - Add Vehicle Module

## Prerequisites

✅ Supabase project set up  
✅ Next.js dashboard running  
✅ Environment variables configured  

## 5-Minute Setup

### Step 1: Run Database Migration (2 min)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy content from `vehicle-inventory-migration.sql`
4. Paste and click **Run**
5. Verify tables created:
   - vehicles
   - sellers
   - vehicle_options_master
   - vehicle_options
   - vehicle_custom_options
   - vehicle_images

### Step 2: Add Sample Master Data (1 min)

Run this in SQL Editor to add test data:

```sql
-- Add sample brands
INSERT INTO vehicle_brands (name) VALUES 
  ('Toyota'),
  ('Honda'),
  ('Nissan'),
  ('Suzuki'),
  ('Mitsubishi')
ON CONFLICT DO NOTHING;

-- Add sample models for Toyota
INSERT INTO vehicle_models (brand_id, name) 
SELECT id, 'Aqua' FROM vehicle_brands WHERE name = 'Toyota'
UNION ALL
SELECT id, 'Prius' FROM vehicle_brands WHERE name = 'Toyota'
UNION ALL
SELECT id, 'Vitz' FROM vehicle_brands WHERE name = 'Toyota';

-- Add sample countries
INSERT INTO countries (name, is_active) VALUES 
  ('Japan', true),
  ('UK', true),
  ('Germany', true),
  ('USA', true)
ON CONFLICT DO NOTHING;
```

### Step 3: Verify Environment Variables (30 sec)

Check `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Start Development Server (30 sec)

```bash
cd dashboard
npm run dev
```

### Step 5: Test the Module (1 min)

1. Navigate to `http://localhost:3000/add-vehicle`
2. You should see the 7-step wizard with Step 1 active
3. Try filling in some fields
4. Navigate through steps using Next/Back buttons

## 🎯 Test Scenario

### Complete Vehicle Entry Test:

**Step 1 - Vehicle Details:**
- Vehicle Number: `ABC-1234`
- Brand: Toyota
- Model: Aqua
- Year: 2015
- Country: Japan
- Body Type: Hatchback
- Fuel: Petrol + Hybrid
- Transmission: Auto
- Engine: 1500cc
- Color: White
- Upload 2-3 test images

**Step 2 - Seller Details:**
- First Name: John
- Last Name: Doe
- Mobile: +94771234567
- Email: john@example.com

**Step 3 - Options:**
- Toggle: A/C, Alloy Wheels, Reverse Camera
- Add custom: "Sunroof"

**Step 4 - Selling Details:**
- Amount: 8000000
- Mileage: 50000
- Entry Type: PVC Pvt Ltd
- Status: In Sale

**Step 5 - Notes:**
- Tag Notes: "Clean vehicle, single owner"
- Print Note: "Excellent condition hybrid car with full service history."

**Step 6 - Summary:**
- Review all data
- Click **Publish**

**Step 7 - Success:**
- See success message
- Try **Go to Inventory**

## ✅ Verification Checklist

After setup, verify:

- [ ] Step indicator shows all 7 steps
- [ ] Brand dropdown populated from database
- [ ] Model dropdown updates when brand changes
- [ ] Country dropdown shows countries
- [ ] Image upload shows previews
- [ ] Mobile number auto-formats to +94
- [ ] Currency formats with commas
- [ ] Options are searchable
- [ ] Summary shows all entered data
- [ ] Publish button works (check Supabase dashboard)
- [ ] Success screen appears with vehicle info

## 🐛 Common Issues

### "No brands showing"
```sql
-- Check if brands exist:
SELECT * FROM vehicle_brands;

-- If empty, insert sample data (see Step 2)
```

### "Cannot upload images"
```sql
-- Check storage bucket exists:
SELECT * FROM storage.buckets WHERE id = 'vehicle-images';

-- If missing, create it:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true);
```

### "RLS policy error"
```sql
-- Check if policies exist:
SELECT * FROM pg_policies WHERE tablename = 'vehicles';

-- If missing, run full migration again
```

## 📞 Next Steps

1. ✅ Complete test vehicle entry
2. ✅ Verify data in Supabase dashboard:
   - Check `vehicles` table
   - Check `sellers` table
   - Check `vehicle_images` table
   - Check storage bucket `vehicle-images`
3. ✅ Proceed to build Inventory page
4. ✅ Add edit/delete functionality
5. ✅ Deploy to production

## 💡 Pro Tips

- **Use real images**: Test with actual vehicle photos for better feel
- **Test validation**: Try submitting without required fields
- **Check mobile**: Test on phone for responsive design
- **Monitor console**: Keep browser console open for errors
- **Check network**: Watch Network tab for API calls

## 🎉 Success Criteria

You've successfully set up the module if:
1. You can complete all 7 steps
2. Vehicle saves to database
3. Images upload to storage
4. Success screen shows vehicle details
5. No console errors

---

**Time to Complete**: ~10 minutes  
**Difficulty**: Beginner-Friendly  
**Support**: Check ADD_VEHICLE_MODULE_README.md for details

**Happy Testing! 🚗✨**
