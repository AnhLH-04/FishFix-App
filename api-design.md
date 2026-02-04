# API Design (Draft for Frontend Implementation)

Base URL (dev):
- http://localhost:5135

Headers:
- Content-Type: application/json
- Authorization: Bearer <access_token> (for protected endpoints)

Status conventions:
- 200 OK: success
- 400 Bad Request: validation or business rule failure
- 401 Unauthorized: invalid or missing token
- 404 Not Found: resource not found

---

## Auth and Identity

### Register
POST /api/identity/register

Request:
```json
{
  "email": "demo@fishfix.local",
  "phone": "0123456789",
  "password": "P@ssw0rd!",
  "fullName": "Demo User",
  "role": "customer"
}
```

Notes:
- role must be "customer" or "worker".
- email and phone must be unique.

Response 200:
```json
{
  "userId": "11111111-1111-1111-1111-111111111111"
}
```

Response 400:
```json
{
  "message": "Email already exists."
}
```

### Login
POST /api/identity/login

Request:
```json
{
  "identifier": "demo@fishfix.local",
  "password": "P@ssw0rd!"
}
```

Notes:
- identifier can be email or phone.

Response 200:
```json
{
  "accessToken": "<jwt>"
}
```

Response 401:
- Empty body

### Phone Login (Request OTP)
POST /api/identity/phone/request-login

Request:
```json
{
  "phone": "+84912345678"
}
```

Response 200:
```json
{
  "message": "OTP đã gửi.",
  "expiresInSeconds": 120,
  "isNewUser": false
}
```

Notes:
- No authentication required
- If phone is new, `isNewUser: true` and account will be created after verification
- OTP expires in 120 seconds
- Max 3 requests per 10 minutes
- 60 seconds cooldown between requests

Response 429:
```json
{
  "message": "Quá nhiều yêu cầu OTP. Vui lòng thử lại sau.",
  "retryAfterSeconds": 600
}
```

### Phone Login (Verify OTP)
POST /api/identity/phone/verify-login

Request:
```json
{
  "phone": "+84912345678",
  "otp": "123456"
}
```

Response 200:
```json
{
  "accessToken": "<jwt>",
  "message": "Đăng nhập thành công.",
  "isNewUser": false
}
```

Notes:
- No authentication required
- Returns JWT token on success
- `isNewUser: true` if this is a newly created account

Response 400:
```json
{
  "message": "OTP không đúng. Còn 4 lần thử."
}
```


### Get Current User (Protected)
GET /api/identity/me

Headers:
- Authorization: Bearer <access_token>

Response 200:
```json
{
  "userId": "11111111-1111-1111-1111-111111111111",
  "email": "demo@fishfix.local",
  "fullName": "Demo User",
  "phone": "0123456789",
  "roleId": 1
}
```

Response 401/404:
- Empty body

### Update Profile (Protected)
PUT /api/identity/me

Headers:
- Authorization: Bearer <access_token>

Request:
```json
{
  "fullName": "New Name",
  "phone": "0987654321"
}
```

Response 200:
- Empty body

Response 400:
```json
{
  "message": "Unable to update profile."
}
```

### Verify Email
GET /api/identity/verify-email

Query Parameters:
- `email` (required): User's email address
- `token` (required): Verification token from email

Example:
```
GET /api/identity/verify-email?email=demo@fishfix.local&token=abc123xyz
```

Response 200:
```json
{
  "message": "Email verified successfully"
}
```

Response 400:
```json
{
  "message": "Invalid or expired verification token"
}
```

Notes:
- Token expires after 24 hours
- After successful verification, a welcome email is sent
- User's `isVerified` status changes to `true`

### Resend Verification Email
POST /api/identity/resend-verification

Request:
```json
{
  "email": "demo@fishfix.local"
}
```

Response 200:
```json
{
  "message": "Verification email sent"
}
```

Response 400:
```json
{
  "message": "Email already verified"
}
```

Notes:
- Can only resend if email is not yet verified
- Previous token is invalidated when new one is generated
- New token valid for 24 hours

### Forgot Password
POST /api/identity/forgot-password

Request:
```json
{
  "email": "demo@fishfix.local"
}
```

Response 200:
```json
{
  "message": "Nếu email tồn tại, bạn sẽ nhận được mã xác nhận."
}
```

Notes:
- Always returns success (prevents email enumeration)
- **6-digit OTP** sent via email
- **OTP expires after 5 minutes**
- Email shows OTP prominently for mobile app users

### Reset Password
POST /api/identity/reset-password

Request:
```json
{
  "email": "demo@fishfix.local",
  "token": "847291",
  "newPassword": "NewP@ssw0rd!"
}
```

Notes:
- `token` is the 6-digit OTP from email
- OTP valid for 5 minutes only

Response 200:
```json
{
  "message": "Mật khẩu đã được đặt lại thành công."
}
```

Response 400:
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn."
}
```

---

## Phone Authentication (Supabase Auth)

All phone auth uses Supabase Auth with Twilio for SMS delivery.

### Request Phone Login
POST /api/identity/phone/request-login

Request:
```json
{
  "phone": "+84912345678"
}
```

Response 200:
```json
{
  "message": "OTP đã được gửi.",
  "expiresInSeconds": 60
}
```

Response 400:
```json
{
  "message": "Số điện thoại không hợp lệ. Sử dụng định dạng +84xxxxxxxxx."
}
```

Notes:
- No authentication required
- OTP managed by Supabase (sent via Twilio)
- If phone is new, account created on verify

### Verify Phone Login
POST /api/identity/phone/verify-login

Request:
```json
{
  "phone": "+84912345678",
  "otp": "123456"
}
```

Response 200:
```json
{
  "accessToken": "<jwt>",
  "message": "Đăng nhập thành công.",
  "isNewUser": false
}
```

Response 400:
```json
{
  "message": "OTP không hợp lệ."
}
```

Notes:
- Returns JWT on success
- `isNewUser: true` if first time login with this phone

### Link Phone to Account
POST /api/identity/phone/link

Headers:
- `Authorization: Bearer {token}` (required)

Request:
```json
{
  "phone": "+84912345678"
}
```

Response 200:
```json
{
  "message": "OTP đã được gửi đến số điện thoại của bạn.",
  "expiresInSeconds": 60
}
```

Notes:
- For existing users who want to add phone
- Phone must not be used by another account

### Verify Link Phone
POST /api/identity/phone/verify-link

Headers:
- `Authorization: Bearer {token}` (required)

Request:
```json
{
  "phone": "+84912345678",
  "otp": "123456"
}
```

Response 200:
```json
{
  "verified": true,
  "message": "Số điện thoại đã được liên kết thành công."
}
```

---

## Categories

### Get All Categories
GET /api/categories

Query Parameters:
- `activeOnly` (optional, default: true): Filter active categories only

Response 200:
```json
[
  {
    "categoryId": 1,
    "name": "Điện lạnh",
    "description": "Sửa chữa thiết bị điện lạnh",
    "iconUrl": null,
    "parentId": null,
    "displayOrder": 1,
    "isActive": true
  },
  {
    "categoryId": 4,
    "name": "Máy giặt",
    "description": "Sửa chữa máy giặt",
    "iconUrl": null,
    "parentId": 1,
    "displayOrder": 1,
    "isActive": true
  }
]
```

Notes:
- Categories with `parentId = null` are root categories
- Sub-categories reference their parent via `parentId`

---

## Job

### Create Job
POST /api/jobs

Request:
```json
{
  "customerId": "11111111-1111-1111-1111-111111111111",
  "categoryId": 1,
  "title": "Sửa máy giặt",
  "description": "Máy giặt không vắt được",
  "address": "123 Nguyen Van Linh, Q7",
  "ward": "Tan Phong",
  "district": "Quan 7",
  "city": "Ho Chi Minh",
  "latitude": 10.7285,
  "longitude": 106.7214,
  "estimatedBudget": 500000,
  "urgency": "medium",
  "preferredDate": "2026-01-20",
  "preferredTimeStart": "09:00:00",
  "preferredTimeEnd": "12:00:00"
}
```

Notes:
- urgency: "low", "medium", "high", "emergency"
- Optional fields: ward, district, city, latitude, longitude, estimatedBudget, preferredDate, preferredTimeStart, preferredTimeEnd

Response 200:
```json
{
  "jobId": "22222222-2222-2222-2222-222222222222"
}
```

### Get Job by ID
GET /api/jobs/{jobId}

Response 200:
```json
{
  "jobId": "22222222-2222-2222-2222-222222222222",
  "customerId": "11111111-1111-1111-1111-111111111111",
  "categoryId": 1,
  "title": "Sửa máy giặt",
  "description": "Máy giặt không vắt được",
  "address": "123 Nguyen Van Linh, Q7",
  "ward": "Tan Phong",
  "district": "Quan 7",
  "city": "Ho Chi Minh",
  "latitude": 10.7285,
  "longitude": 106.7214,
  "estimatedBudget": 500000,
  "status": "open",
  "urgency": "medium",
  "preferredDate": "2026-01-20",
  "preferredTimeStart": "09:00:00",
  "preferredTimeEnd": "12:00:00",
  "viewCount": 0,
  "createdAt": "2026-01-15T07:30:00Z"
}
```

Response 404:
- Empty body

### Get Jobs by Customer
GET /api/jobs?customerId={customerId}

Response 200:
```json
[
  {
    "jobId": "22222222-2222-2222-2222-222222222222",
    "customerId": "11111111-1111-1111-1111-111111111111",
    "categoryId": 1,
    "title": "Sửa máy giặt",
    ...
  }
]
```

Response 400:
```json
{
  "message": "customerId is required"
}
```

---

## Bid

### Create Bid
POST /api/jobs/{jobId}/bids

Request:
```json
{
  "workerId": "33333333-3333-3333-3333-333333333333",
  "amount": 450000,
  "message": "Tôi có thể sửa trong 2 giờ",
  "estimatedHours": 2.0,
  "estimatedCompletion": "2026-01-20T12:00:00Z"
}
```

Notes:
- Optional fields: message, estimatedHours, estimatedCompletion

Response 200:
```json
{
  "bidId": "44444444-4444-4444-4444-444444444444"
}
```

Response 400:
```json
{
  "message": "Worker already bid on this job."
}
```

### Get Bids for Job
GET /api/jobs/{jobId}/bids

Response 200:
```json
[
  {
    "bidId": "44444444-4444-4444-4444-444444444444",
    "jobId": "22222222-2222-2222-2222-222222222222",
    "workerId": "33333333-3333-3333-3333-333333333333",
    "amount": 450000,
    "message": "Tôi có thể sửa trong 2 giờ",
    "estimatedHours": 2.0,
    "estimatedCompletion": "2026-01-20T12:00:00Z",
    "status": "pending",
    "createdAt": "2026-01-15T08:00:00Z"
  }
]
```

### Accept Bid
PUT /api/bids/{bidId}/accept

Response 200:
- Empty body

Response 404:
- Empty body (bid not found or not pending)

---

## Booking

### Create Booking
POST /api/bookings

Request:
```json
{
  "jobId": "22222222-2222-2222-2222-222222222222",
  "bidId": "44444444-4444-4444-4444-444444444444",
  "customerId": "11111111-1111-1111-1111-111111111111",
  "workerId": "33333333-3333-3333-3333-333333333333",
  "finalAmount": 450000,
  "scheduledDate": "2026-01-20",
  "scheduledTimeStart": "09:00:00",
  "scheduledTimeEnd": "12:00:00",
  "depositAmount": 100000
}
```

Notes:
- Optional fields: scheduledTimeStart, scheduledTimeEnd, depositAmount

Response 200:
```json
"55555555-5555-5555-5555-555555555555"
```

---

## Payment

### Create Payment
POST /api/bookings/{bookingId}/payments

Request:
```json
{
  "amount": 100000,
  "paymentType": "deposit",
  "paymentMethod": "vnpay"
}
```

Notes:
- paymentType: "deposit", "final", "refund"
- paymentMethod: "vnpay", "momo", "zalopay", "cash", "bank_transfer"

Response 200:
```json
{
  "paymentId": "66666666-6666-6666-6666-666666666666"
}
```

### Get Payments by Booking
GET /api/bookings/{bookingId}/payments

Response 200:
```json
[
  {
    "paymentId": "66666666-6666-6666-6666-666666666666",
    "bookingId": "55555555-5555-5555-5555-555555555555",
    "amount": 100000,
    "paymentType": "deposit",
    "paymentMethod": "vnpay",
    "status": "pending",
    "transactionId": null,
    "paidAt": null,
    "createdAt": "2026-01-16T01:00:00Z"
  }
]
```

---

## Review

### Create Review
POST /api/bookings/{bookingId}/reviews

Request:
```json
{
  "reviewerId": "11111111-1111-1111-1111-111111111111",
  "revieweeId": "33333333-3333-3333-3333-333333333333",
  "rating": 5,
  "comment": "Làm việc rất tốt",
  "punctualityRating": 5,
  "qualityRating": 5,
  "friendlinessRating": 5
}
```

Notes:
- One review per booking
- rating: 1-5

Response 200:
```json
{
  "reviewId": "77777777-7777-7777-7777-777777777777"
}
```

Response 400:
```json
{
  "message": "Review already exists for this booking."
}
```

### Get Worker Reviews
GET /api/workers/{workerId}/reviews

Response 200:
```json
[
  {
    "reviewId": "77777777-7777-7777-7777-777777777777",
    "bookingId": "55555555-5555-5555-5555-555555555555",
    "reviewerId": "11111111-1111-1111-1111-111111111111",
    "revieweeId": "33333333-3333-3333-3333-333333333333",
    "rating": 5,
    "comment": "Làm việc rất tốt",
    "punctualityRating": 5,
    "qualityRating": 5,
    "friendlinessRating": 5,
    "workerResponse": null,
    "createdAt": "2026-01-16T02:00:00Z"
  }
]
```

---

## Inspection Report

### Create Inspection Report
POST /api/bookings/{bookingId}/inspections

Request:
```json
{
  "jobId": "22222222-2222-2222-2222-222222222222",
  "workerId": "33333333-3333-3333-3333-333333333333",
  "customerId": "11111111-1111-1111-1111-111111111111",
  "diagnosisSummary": "Máy giặt bị hỏng motor",
  "rootCause": "Motor cháy do quá tải",
  "severityLevel": "high",
  "estimatedCostMin": 500000,
  "estimatedCostMax": 800000,
  "notes": "Cần thay motor mới"
}
```

Response 200:
```json
{
  "inspectionId": "88888888-8888-8888-8888-888888888888"
}
```

### Get Inspection by Booking
GET /api/bookings/{bookingId}/inspections

Response 200:
```json
{
  "inspectionId": "88888888-8888-8888-8888-888888888888",
  "bookingId": "55555555-5555-5555-5555-555555555555",
  "jobId": "22222222-2222-2222-2222-222222222222",
  "workerId": "33333333-3333-3333-3333-333333333333",
  "customerId": "11111111-1111-1111-1111-111111111111",
  "diagnosisSummary": "Máy giặt bị hỏng motor",
  "rootCause": "Motor cháy do quá tải",
  "severityLevel": "high",
  "estimatedCostMin": 500000,
  "estimatedCostMax": 800000,
  "notes": "Cần thay motor mới",
  "status": "completed",
  "createdAt": "2026-01-16T02:00:00Z"
}
```

---

## Repair Proposal

### Create Repair Proposal
POST /api/inspections/{inspectionId}/proposals

Request:
```json
{
  "bookingId": "55555555-5555-5555-5555-555555555555",
  "jobId": "22222222-2222-2222-2222-222222222222",
  "workerId": "33333333-3333-3333-3333-333333333333",
  "customerId": "11111111-1111-1111-1111-111111111111",
  "title": "Thay motor máy giặt",
  "description": "Thay motor mới, bảo hành 6 tháng",
  "totalCost": 700000,
  "partsCost": 500000,
  "laborCost": 200000,
  "warrantyDays": 180
}
```

Response 200:
```json
{
  "proposalId": "99999999-9999-9999-9999-999999999999"
}
```

### Get Proposal by Inspection
GET /api/inspections/{inspectionId}/proposals

Response 200:
```json
{
  "proposalId": "99999999-9999-9999-9999-999999999999",
  "inspectionId": "88888888-8888-8888-8888-888888888888",
  "title": "Thay motor máy giặt",
  "description": "Thay motor mới, bảo hành 6 tháng",
  "partsCost": 500000,
  "laborCost": 200000,
  "totalCost": 700000,
  "warrantyDays": 180,
  "status": "pending",
  "createdAt": "2026-01-16T02:00:00Z"
}
```

### Approve Proposal
PUT /api/proposals/{proposalId}/approve

Request:
```json
{
  "approvedBy": "11111111-1111-1111-1111-111111111111"
}
```

Response 200:
- Empty body

### Reject Proposal
PUT /api/proposals/{proposalId}/reject

Request:
```json
{
  "reason": "Giá quá cao"
}
```

Response 200:
- Empty body

---

## Dispatch (Worker Profiles)

### List Workers (Admin)
GET /api/dispatch/workers

Query Parameters:
- `isVerified` (boolean, optional): Filter by verification status.

Notes:
- Returns all workers. Or filtered if `isVerified` provided.

Response 200:
```json
[
  {
    "workerId": "33333333-3333-3333-3333-333333333333",
    "userId": "11111111-1111-1111-1111-111111111111",
    "bio": "5 years plumbing experience",
    "hourlyRate": 150000,
    "serviceFeePercent": 10.00,
    "ratingAvg": 4.50,
    "ratingCount": 20,
    "completedJobs": 18,
    "responseTimeMinutes": 10,
    "availabilityStatus": "available",
    "workingRadiusKm": 10,
    "isVerified": true,
    ...
  }
]
```

### Create Worker Profile
POST /api/dispatch/workers

Request:
```json
{
  "userId": "11111111-1111-1111-1111-111111111111",
  "bio": "5 years plumbing experience",
  "workingRadiusKm": 10,
  "hourlyRate": 150000,
  "idCardNumber": "012345678901",
  "idCardFrontUrl": "https://storage.example.com/id-front.jpg",
  "idCardBackUrl": "https://storage.example.com/id-back.jpg",
  "bankAccountName": "NGUYEN VAN A",
  "bankAccountNumber": "1234567890",
  "bankName": "Vietcombank"
}
```

Notes:
- Optional fields: hourlyRate, idCardNumber, idCardFrontUrl, idCardBackUrl, bankAccountName, bankAccountNumber, bankName

Response 200:
```json
{
  "workerId": "33333333-3333-3333-3333-333333333333"
}
```

Response 400:
```json
{
  "message": "Worker profile already exists."
}
```

### Update Worker Profile
PUT /api/dispatch/workers/{workerId}

Request:
```json
{
  "bio": "Updated bio",
  "availabilityStatus": "available",
  "workingRadiusKm": 15,
  "hourlyRate": 180000,
  "idCardNumber": "012345678901",
  "idCardFrontUrl": "https://storage.example.com/id-front.jpg",
  "idCardBackUrl": "https://storage.example.com/id-back.jpg",
  "bankAccountName": "NGUYEN VAN A",
  "bankAccountNumber": "1234567890",
  "bankName": "Vietcombank"
}
```

Notes:
- availabilityStatus: "available", "busy", "offline"
- Optional fields: hourlyRate, idCardNumber, idCardFrontUrl, idCardBackUrl, bankAccountName, bankAccountNumber, bankName

Response 200:
- Empty body

Response 404:
- Empty body

### Add Worker Skill
POST /api/dispatch/workers/{workerId}/skills

Request:
```json
{
  "categoryId": 2,
  "yearsOfExperience": 5,
  "isPrimarySkill": true
}
```

Response 200:
```json
{
  "skillId": "66666666-6666-6666-6666-666666666666"
}
```

Response 400:
```json
{
  "message": "Worker skill already exists or worker not found."
}
```

### Get Worker Profile
GET /api/dispatch/workers/{workerId}

Response 200:
```json
{
  "workerId": "33333333-3333-3333-3333-333333333333",
  "userId": "11111111-1111-1111-1111-111111111111",
  "bio": "Updated bio",
  "hourlyRate": 180000,
  "serviceFeePercent": 10.00,
  "ratingAvg": 4.75,
  "ratingCount": 42,
  "completedJobs": 38,
  "responseTimeMinutes": 15,
  "availabilityStatus": "available",
  "workingRadiusKm": 15,
  "idCardNumber": "012345678901",
  "idCardFrontUrl": "https://storage.example.com/id-front.jpg",
  "idCardBackUrl": "https://storage.example.com/id-back.jpg",
  "isVerified": true,
  "verifiedAt": "2026-01-10T08:00:00Z",
  "verifiedBy": "admin-user-id",
  "bankAccountName": "NGUYEN VAN A",
  "bankAccountNumber": "1234567890",
  "bankName": "Vietcombank",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-15T12:00:00Z",
  "skills": [
    {
      "skillId": "66666666-6666-6666-6666-666666666666",
      "categoryId": 2,
      "yearsOfExperience": 5,
      "isPrimarySkill": true
    }
  ]
}
```

Response 404:
- Empty body

### Get Worker Profile by User ID
GET /api/dispatch/workers/by-user/{userId}

Notes:
- Returns worker profile for a given user ID
- Useful when you have userId from JWT but need workerId

Response 200:
```json
{
  "workerId": "33333333-3333-3333-3333-333333333333",
  "userId": "11111111-1111-1111-1111-111111111111",
  "bio": "5 years plumbing experience",
  "hourlyRate": 150000,
  "serviceFeePercent": 10.00,
  "ratingAvg": 4.50,
  "ratingCount": 20,
  "completedJobs": 18,
  "responseTimeMinutes": 10,
  "availabilityStatus": "available",
  "workingRadiusKm": 10,
  "idCardNumber": "012345678901",
  "idCardFrontUrl": "https://storage.example.com/id-front.jpg",
  "idCardBackUrl": "https://storage.example.com/id-back.jpg",
  "isVerified": true,
  "verifiedAt": "2026-01-10T08:00:00Z",
  "verifiedBy": "admin-user-id",
  "bankAccountName": "NGUYEN VAN A",
  "bankAccountNumber": "1234567890",
  "bankName": "Vietcombank",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-15T12:00:00Z",
  "skills": [
    {
      "skillId": "66666666-6666-6666-6666-666666666666",
      "categoryId": 2,
      "yearsOfExperience": 5,
      "isPrimarySkill": true
    }
  ]
}
```

Response 404:
- User không có worker profile

### Update Worker Availability
PUT /api/dispatch/workers/{workerId}/availability

Request:
```json
{
  "status": "busy"
}
```

Notes:
- status: "available", "busy", "offline"

Response 200:
- Empty body

Response 400:
```json
{
  "message": "Invalid availability status."
}
```

### Verify Worker (Admin only)
PUT /api/dispatch/workers/{workerId}/verify

Request:
```json
{
  "adminUserId": "admin-user-id"
}
```

Notes:
- Requires admin authentication
- Sets isVerified=true, verifiedAt, verifiedBy

Response 200:
```json
{
  "message": "Worker profile verified."
}
```

Response 404:
- Empty body

---

## Certifications

### Get Worker Certifications
GET /api/dispatch/workers/{workerId}/certifications

Response 200:
```json
[
  {
    "certId": "77777777-7777-7777-7777-777777777777",
    "workerId": "33333333-3333-3333-3333-333333333333",
    "certName": "Chứng chỉ điện lạnh cấp 3",
    "certNumber": "DL-2024-12345",
    "issuedBy": "Sở Công Thương TP.HCM",
    "issuedDate": "2024-01-15",
    "expiryDate": "2029-01-15",
    "documentUrl": "https://storage.example.com/cert-dl.pdf",
    "isVerified": true,
    "verifiedAt": "2024-02-01T10:00:00Z",
    "isExpired": false
  }
]
```

### Add Certification
POST /api/dispatch/workers/{workerId}/certifications

Request:
```json
{
  "certName": "Chứng chỉ điện lạnh cấp 3",
  "certNumber": "DL-2024-12345",
  "issuedBy": "Sở Công Thương TP.HCM",
  "issuedDate": "2024-01-15",
  "expiryDate": "2029-01-15",
  "documentUrl": "https://storage.example.com/cert-dl.pdf"
}
```

Response 200:
```json
{
  "certId": "77777777-7777-7777-7777-777777777777"
}
```

### Update Certification
PUT /api/dispatch/certifications/{certId}

Request:
```json
{
  "certName": "Chứng chỉ điện lạnh cấp 3 (Updated)",
  "certNumber": "DL-2024-12345",
  "issuedBy": "Sở Công Thương TP.HCM",
  "issuedDate": "2024-01-15",
  "expiryDate": "2029-01-15",
  "documentUrl": "https://storage.example.com/cert-dl-v2.pdf"
}
```

Response 200:
- Empty body

Response 404:
- Empty body (certification not found)

### Delete Certification
DELETE /api/dispatch/certifications/{certId}

Response 200:
- Empty body

Response 404:
- Empty body

### Verify Certification (Admin only)
POST /api/dispatch/certifications/{certId}/verify

Headers:
- Authorization: Bearer {admin_token} (required)

Request:
```json
{
  "adminUserId": "admin-user-id"
}
```

Response 200:
```json
{
  "message": "Certification verified."
}
```

Response 404:
- Empty body

---

## Health and Docs

### Health
GET /health

Response 200:
- Empty body

### Swagger (dev)
- http://localhost:5135/swagger
