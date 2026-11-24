# Product Context — Society Management Portal

## Why This Project Exists
Managing a residential housing society manually (spreadsheets, WhatsApp groups, paper receipts) is error-prone, opaque, and inefficient. This portal digitizes and centralizes all society operations so the admin, residents, and security staff operate from a single source of truth.

## Problems It Solves
| Problem | Solution |
|---------|----------|
| Manual maintenance bill calculations and collection | Auto-generated monthly bills using sq_ft + ₹700 formula |
| No transparency for residents on dues | Resident portal with bill history and payment status |
| Visitor entry tracked only on paper registers | Digital visitor log by security guard with resident notifications |
| No central place for society notices | Notice board module visible to all residents |
| Asset service dates forgotten | Asset management with last/next service date tracking |
| No record of complaints resolution | Complaint module with status tracking |
| Parking slot management is informal | Parking slot assignment per flat with vehicle number |

## How It Should Work

### Admin Flow
1. Admin logs in → sees dashboard summary (pending bills, open complaints, recent visitors, asset alerts)
2. Admin manages flats (create/edit flat records with sq_ft, floor, type)
3. Admin manages residents (assign owner/tenant to flat, track move-in/out)
4. Admin generates monthly maintenance bills (bulk action) → system calculates per flat
5. Admin records payments received (cash/UPI/bank transfer)
6. Admin posts notices and manages complaints
7. Admin tracks asset service schedules

### Resident Flow
1. Resident logs in → sees their flat details, current bill, notices
2. Views bill history and payment status
3. Raises a complaint (plumbing/electrical/lift/common area/other)
4. Reads society notices
5. Gets notified when a visitor arrives for their flat

### Security Guard Flow
1. Guard logs in → simple visitor entry form
2. Enters: visitor name, flat number, purpose, and submits
3. System records entry time and notifies the resident
4. Guard logs exit time when visitor leaves

## User Experience Goals
- **Admin**: Power and control — all data visible, bulk actions available, clean tabular views
- **Resident**: Simplicity — only what matters to them, mobile-friendly layout
- **Security Guard**: Ultra-simple — one screen, one form, minimal friction
- **All roles**: Fast load, clear notifications, no unnecessary complexity