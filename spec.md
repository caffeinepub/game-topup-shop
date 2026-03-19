# Game Topup Shop

## Current State
Admin panel has a Members tab where the Super Admin can search users by Principal ID and change their role (Admin/User/Guest). There is no sub-admin role -- only full admins (who have all access) and regular users.

## Requested Changes (Diff)

### Add
- New `subAdmin` concept tracked in backend via a `subAdmins` map
- Backend function `setSubAdmin(user, bool)` -- only Super Admin can call
- Backend function `getUserAdminType(user)` -- returns `#superAdmin`, `#subAdmin`, or `#none`
- Backend functions for products, orders, recharge now also allow subAdmins
- In AdminPage Members tab: Super Admin can assign 'Sub-Admin' role to any user
- Sub-Admin sees only Products, Orders, Recharge tabs in admin panel
- Super Admin sees all tabs: Products, Offers/Announcements, Orders, Recharge, Members

### Modify
- Backend: `addProduct`, `updateProduct`, `deleteProduct`, `getAllOrders`, `updateOrderStatus`, `approveRechargeRequest`, `rejectRechargeRequest`, `getRechargeRequests` (admin view) -- now also allow subAdmins
- AdminPage: conditionally render tabs based on whether user is superAdmin or subAdmin
- App.tsx/AdminPage access check: allow subAdmins to access `/admin` route
- Members tab role assignment: add 'Sub-Admin' option

### Remove
- Nothing removed

## Implementation Plan
1. Add `subAdmins` map in backend, add `setSubAdmin` and `getUserAdminType` public functions
2. Update permission checks in product/order/recharge backend functions to allow subAdmins
3. Update `backend.d.ts` with new functions and types
4. In AdminPage, call `getUserAdminType` on mount to determine admin level
5. Conditionally show tabs: subAdmin gets Products+Orders+Recharge; superAdmin gets all
6. Add Sub-Admin option in Members tab role management
7. Update App.tsx admin route guard to allow subAdmins
