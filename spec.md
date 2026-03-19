# Game Topup Shop

## Current State
- Full-stack game topup platform with products, orders, wallet, admin panel
- Add Money page lets users fill a form (amount, payment method, transaction ID) but only shows a toast -- recharge requests are NOT saved to the backend
- Admin panel has Products, Orders, Settings tabs -- no recharge request management
- Backend has creditWallet (admin manually credits) but no RechargeRequest entity

## Requested Changes (Diff)

### Add
- RechargeRequest type: { id, userId, amount, paymentMethod, transactionId, status (#pending | #approved | #rejected), createdAt }
- submitRechargeRequest(amount, paymentMethod, transactionId) -- user submits a request, saves to backend
- getMyRechargeRequests() -- user sees their own requests with status
- getAllRechargeRequests() -- admin sees all requests
- approveRechargeRequest(id) -- admin approves, auto-credits user wallet with request amount
- rejectRechargeRequest(id) -- admin rejects, sets status to rejected
- "Recharge" tab in Admin Panel showing all requests with Approve/Reject buttons
- AddMoneyPage: on submit, call backend submitRechargeRequest instead of just showing a toast
- AddMoneyPage / ProfilePage: show user's own recharge request history with status badges

### Modify
- AddMoneyPage: wire form submission to backend
- AdminPage: add new "Recharge" tab

### Remove
- Nothing removed

## Implementation Plan
1. Add RechargeRequest type and storage to main.mo
2. Add submitRechargeRequest, getMyRechargeRequests, getAllRechargeRequests, approveRechargeRequest, rejectRechargeRequest functions
3. Regenerate backend.d.ts bindings
4. Update useQueries.ts hooks for new APIs
5. Update AddMoneyPage to call backend on submit and show history
6. Update AdminPage to add Recharge tab with approve/reject actions
