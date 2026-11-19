# Paint Billing ERP & POS

A dedicated, offline-first Point of Sale (POS) and Enterprise Resource Planning (ERP) software tailored specifically for **Paint Retail & Wholesale Stores**.

---

## Key Features

1. **POS Billing Terminal**:
   - Quick Brand filter tabs (Asian Paints, Berger, Dulux, Birla Opus, etc.)
   - Pack size selector matrix (`100ml` to `20L` cans, `1kg` to `40kg` putty bags, `1 Pc` tools)
   - Real-time Price Tier switching (`Retail`, `Contractor`, `Wholesale`)
   - Barcode scanning & quick shade lookup
   - Keyboard hotkeys (`F1`: Shade Card, `F2`: Contractor Khata, `F4`: Checkout, `Alt+E`: Estimator)

2. **Color Tinting & Shade Code System**:
   - Search by brand code (e.g. `0420`, `L152`) or shade name (`Morning Glory`)
   - Automatic base can matching (`White Base`, `Base 1`, `Base 2`, `Deep Base`, `Accent Base`)
   - Machine tint formula logging (shots/ml of colorants added)

3. **Contractor Khata & Referral Commission**:
   - Registered painter credit limits & running balance tracking
   - Chronological passbook ledger (debits on credit sales, credits on payment received)
   - 5% referral commission calculation per bill
   - One-click WhatsApp statement dispatch

4. **Square-Foot Area & Paint Estimator**:
   - Built-in calculator (`Alt+E`): carpet area + wall height + surface type (fresh plaster vs repainting)
   - Computes exact Wall Putty (kg), Wall Primer (Liters), and Topcoat Paint (Liters) needed

5. **Multi-Mode Payments & GST Invoicing**:
   - Cash (with change counter), UPI/QR, Card, Split Payments, and Khata Credit
   - Full A4 GST Tax Invoice layout + 80mm Thermal Receipt format
   - Direct WhatsApp bill sharing

6. **Embedded Zero-Config Database**:
   - Powered by SQLite with Write-Ahead Logging (WAL) for sub-millisecond local speed
   - Zero database installation required on customer Windows PCs
   - Fully operational offline

---

## How to Run & Build on Windows

### 1. Development Mode (Browser)
```bash
npm run dev
```
Open [http://localhost:3050](http://localhost:3050) in your browser.

### 2. Development Mode (Desktop Electron App)
```bash
npm run electron:dev
```
Launches the native desktop window.

### 3. Build & Package for Windows (.exe Installer)
```bash
npm run electron:build
```
This generates:
- **NSIS Setup Installer** (`dist/Paint Billing ERP Setup 1.0.0.exe`) — includes Desktop Shortcut, Start Menu entry, and Windows Uninstaller.
- **Portable Executable** (`dist/Paint Billing ERP 1.0.0.exe`) — single `.exe` file that runs instantly without installation.
