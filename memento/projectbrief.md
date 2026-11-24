# Project Brief — Society Management Portal

## Project Name
Society Management Portal

## Overview
A full-stack web portal for managing a residential housing society with 50 flats. The system serves society admins, residents (owners and tenants), and security guards with role-specific dashboards and functionality.

## Society Profile
- **Total Flats**: 50
  - Ground Floor: Parking only (no residential units)
  - Floors 1–4: 12 flats per floor (48 flats total)
  - Floor 5: 2 Penthouses
- **Lifts**: 2
- **Car Parkings**: 40 slots
- **Borewell**: 1
- **Water Tank**: 1
- **Staff**: 2 security guards, 1 cleaner

## Core Goals
1. Admin can manage flats, residents, billing, staff, and assets from a single dashboard
2. Residents can view and pay maintenance bills, raise complaints, and read notices
3. Security guards can log visitor entry/exit; residents get notified
4. Maintenance billing auto-calculated: `(flat_sq_ft × rate_per_sqft) + fixed_charge`
5. Asset tracking for lifts, borewell, water tank, and parking slots

## Tech Stack
- **Frontend**: React 18 + TypeScript (SPA)
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL 15
- **Auth**: JWT (role-based)
- **ORM**: Prisma (TypeScript-native ORM with migrations)

## User Roles
| Role | Key Capability |
|------|----------------|
| Admin/Secretary | Full access — manage all modules |
| Owner Resident | Pay bills, raise complaints, view notices, see own visitor log |
| Tenant Resident | Same as owner |
| Security Guard | Log visitor entry/exit only |

## Maintenance Formula
```
Monthly Bill = (flat_sq_ft × rate_per_sqft) + fixed_charge
```
Example: 1000 sq ft flat, rate=1.0, fixed=700 → ₹1000 + ₹700 = **₹1700/month**
Both `rate_per_sqft` and `fixed_charge` are admin-configurable via `society_settings`.