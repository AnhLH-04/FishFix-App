# Mobile Payment Integration Guide (FishFix App)

## Scope
This guide is for mobile app implementation only. Payment state is always read from backend.

Supported backend flows:
- VNPAY redirect checkout
- SePay VietQR bank transfer

## Backend APIs used by app

### 1) Create VNPAY payment
`POST /api/bookings/{bookingId}/payments` (Bearer required)

Request:
```json
{
  "method": "VNPAY",
  "returnUrl": "https://<be-domain>/api/payments/vnpay/return",
  "clientContext": {
    "appScheme": "fishfix",
    "returnPath": "payment-result"
  }
}
```

Response:
```json
{
  "paymentId": "guid",
  "status": "PENDING",
  "checkoutUrl": "https://sandbox.vnpayment.vn/...",
  "expiresAtUtc": "2026-03-02T10:10:00Z"
}
```

### 2) Create SePay QR payment
`POST /api/payments/sepay/create` (Bearer required)

Request:
```json
{
  "bookingId": "guid",
  "amount": 450000,
  "orderCode": null,
  "description": "optional"
}
```

Response:
```json
{
  "orderCode": "ORD_20260302153012_1234",
  "amount": 450000,
  "paymentCode": "PAY_ORD_20260302153012_1234",
  "qrImageUrl": "https://qr.sepay.vn/img?acc=...&bank=...&amount=450000&des=PAY_ORD_...",
  "paymentId": "guid"
}
```

### 3) Query payment status by paymentId
`GET /api/payments/{paymentId}` (Bearer required)

### 4) Query order status by orderCode (SePay polling)
`GET /api/orders/{orderCode}` (Bearer required)

Response:
```json
{
  "orderCode": "ORD_20260302153012_1234",
  "amount": 450000,
  "status": "PENDING",
  "paidAtUtc": null
}
```

## Status mapping app should handle
Payment status from `GET /api/payments/{paymentId}`:
- `CREATED`
- `PENDING`
- `SUCCEEDED`
- `FAILED`
- `CANCELLED`
- `REFUNDED`
- `EXPIRED`

Order status from `GET /api/orders/{orderCode}`:
- `PENDING`
- `PAID`
- `EXPIRED`

## App flow - VNPAY
1. Call create payment API.
2. Open `checkoutUrl` in in-app browser/external browser.
3. On resume/deeplink, poll `GET /api/payments/{paymentId}` every 2-3 seconds.
4. Stop when terminal status (`SUCCEEDED/FAILED/CANCELLED/EXPIRED`).

## App flow - SePay
1. Call create SePay API.
2. Show `qrImageUrl` and `paymentCode` to user.
3. Poll `GET /api/orders/{orderCode}` every 2-3 seconds.
4. Stop when `PAID` or timeout.

## Deep link setup
Example (Expo):
```json
{
  "expo": {
    "scheme": "fishfix"
  }
}
```

Backend return endpoint can redirect to:
- `fishfix://payment-result?paymentId=<paymentId>`

## UX requirements
- Show clear pending state while waiting gateway/webhook.
- Allow retry query action if timeout.
- If app is killed, reload booking detail and re-fetch status.
- Never show paid success before backend confirms.

## Security requirements
- Do not keep any gateway secret in app.
- Do not trust client-side paid flag.
- Always use backend query as final truth.

## Related docs
- VNPAY setup: `docs/PAYMENT/vnpay_setup_guide.md`
- SePay setup: `docs/PAYMENT/sepay_setup_guide.md`
