# SePay Setup Guide (FishFix BE + Mobile App)

## Scope
- Generate dynamic VietQR from backend for bank transfer payment.
- Confirm incoming transfer via SePay webhook.
- Keep booking/payment state controlled by backend only.

## 1) Prerequisites on SePay
1. Create SePay account and connect bank account.
2. Get API key from SePay dashboard.
3. Prepare webhook URL (public HTTPS):
- `https://<your-domain>/api/payments/sepay/webhook`
4. Configure webhook in SePay dashboard to send transaction events.

## 2) Backend configuration
Set secrets in env/secret store.

```bash
SePay__ApiKey=YOUR_SEPAY_API_KEY
SePay__AccountNumber=YOUR_BANK_ACCOUNT_NUMBER
SePay__BankCodeOrName=MBBank
SePay__QrBaseUrl=https://qr.sepay.vn/img
```

Config keys already exist in:
- `src/Host.Api/appsettings.json.example`

Field meaning:
- `ApiKey`: used to validate webhook header `Authorization: Apikey <ApiKey>`
- `AccountNumber`: receiver bank account for QR generation
- `BankCodeOrName`: bank code/name used by SePay QR
- `QrBaseUrl`: default `https://qr.sepay.vn/img`

## 3) Current backend endpoints
- Create SePay payment (auth): `POST /api/payments/sepay/create`
- SePay webhook (anonymous + API key header check): `POST /api/payments/sepay/webhook`
- Query by order code (auth): `GET /api/orders/{orderCode}`
- Optional query by payment id (auth): `GET /api/payments/{paymentId}`

## 4) Create QR API
Request example:

```json
{
  "bookingId": "guid",
  "amount": 450000,
  "orderCode": null,
  "description": "optional"
}
```

Behavior:
- Backend loads booking and validates ownership.
- Backend uses booking amount as source of truth.
- Backend creates payment with method `SEPAY` and status `PENDING`.
- Backend generates `paymentCode = PAY_<OrderCode>` and QR URL.

Response example:

```json
{
  "orderCode": "ORD_20260302153012_1234",
  "amount": 450000,
  "paymentCode": "PAY_ORD_20260302153012_1234",
  "qrImageUrl": "https://qr.sepay.vn/img?acc=...&bank=...&amount=450000&des=PAY_ORD_...",
  "paymentId": "guid"
}
```

## 5) Webhook API contract
Endpoint:
- `POST /api/payments/sepay/webhook`

Required header:
- `Authorization: Apikey <SEPAY_API_KEY>`

Processing rules in backend:
1. If Authorization is invalid: return `401`.
2. If `transferType != in`: return `200 {"success":true}`.
3. Deduplicate by:
- `id` (SePay transaction id)
- `referenceCode` (if provided)
4. Parse payment marker from `content`, fallback `code`:
- pattern `PAY_<OrderCode>`
5. Match payment by `OrderCode`.
6. Validate amount equality.
7. Always store raw webhook payload in `payment.sepay_transactions`.
8. If matched + amount valid + not already succeeded:
- mark payment `SUCCEEDED`
- confirm booking
9. Return `200 {"success":true}` for all non-auth failures to avoid infinite retries.

## 6) Expected payload fields
Typical fields parsed:
- `id`
- `gateway`
- `transactionDate`
- `accountNumber`
- `code`
- `content`
- `transferType`
- `transferAmount`
- `accumulated`
- `subAccount`
- `referenceCode`
- `description`

## 7) Database and migration
SePay integration stores webhook audit rows in:
- `payment.sepay_transactions`

Run migrations for payment + booking contexts:

```bash
dotnet ef database update --project src/Modules/Payment/Payment.Infrastructure --startup-project src/Host.Api --context PaymentDbContext
dotnet ef database update --project src/Modules/Booking/Booking.Infrastructure --startup-project src/Host.Api --context BookingDbContext
```

If app logs show missing column error (example `CancelledAtUtc does not exist`), database schema is behind code. Run migrations before testing payment flow.

## 8) End-to-end test flow
1. Create booking in app.
2. Call `POST /api/payments/sepay/create`.
3. Display `qrImageUrl` in app.
4. Make bank transfer with transfer content containing `PAY_<OrderCode>`.
5. SePay sends webhook to backend.
6. App polls `GET /api/orders/{orderCode}` every 2-3 seconds.
7. Stop polling when status is `PAID` or timeout.

## 9) Postman/curl webhook test
Example local simulation:

```bash
curl -X POST "https://<your-domain>/api/payments/sepay/webhook" \
  -H "Content-Type: application/json" \
  -H "Authorization: Apikey YOUR_SEPAY_API_KEY" \
  -d '{
    "id": 123456789,
    "gateway": "Vietcombank",
    "transactionDate": "2026-03-02T16:25:00+07:00",
    "accountNumber": "1234567890",
    "code": "",
    "content": "CK PAY_ORD_20260302153012_1234",
    "transferType": "in",
    "transferAmount": 450000,
    "referenceCode": "FT26062ABCDE"
  }'
```

## 10) Security notes
- Never commit `SePay__ApiKey`.
- Never trust paid state from app.
- Do not log raw secrets.
- Keep raw webhook JSON for audit/troubleshooting.

## Related docs
- App integration: `docs/PAYMENT/mobile_payment_app_guide.md`
- VNPAY setup: `docs/PAYMENT/vnpay_setup_guide.md`
