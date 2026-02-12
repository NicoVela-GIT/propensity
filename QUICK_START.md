# 🚀 Quick Start - Supabase Migration

**You're here**: Database schema created ✅  
**Next step**: Migrate your 6 properties to Supabase

---

## Run These 4 Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Migrate Your Data
```bash
npm run migrate
```

**Wait for**: "🎉 Migration complete!" message

### 3. Verify in Supabase

Go to: https://app.supabase.com  
→ Your Project → Table Editor → `properties`  
**Should see**: 6 properties

### 4. Enable Supabase

**Edit `.env.local` file** (in project root):

Change:
```bash
NEXT_PUBLIC_USE_SUPABASE=false
```

To:
```bash
NEXT_PUBLIC_USE_SUPABASE=true
```

**Then restart server**:
```bash
# Press Ctrl+C to stop
npm run dev
```

---

## ✅ Test It Works

1. Go to `http://localhost:3000`
2. Click on any property
3. Click "Edit Property"
4. Change the monthly rent
5. Click "Save Changes"
6. **Refresh the page (F5)**
7. ✅ **The change should persist!**

---

## 🎉 Done!

Your app now uses Supabase! Changes will persist across page refreshes.

---

## 📚 More Details

- **Complete guide**: See `SUPABASE_SETUP_COMPLETE.md`
- **Troubleshooting**: See `MIGRATION_GUIDE.md`
- **Original setup**: See `SUPABASE_SETUP_GUIDE.md`

---

## ❓ Need Help?

**Migration failed?**
- Check error message
- See `MIGRATION_GUIDE.md` troubleshooting section

**Changes not persisting?**
- Did you set `NEXT_PUBLIC_USE_SUPABASE=true`?
- Did you restart the dev server?

**Questions?**
Just ask! 🙋‍♂️
