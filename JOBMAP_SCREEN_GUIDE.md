# Hướng dẫn sử dụng JobMapScreen

## 🎨 Giao diện JobMapScreen

```
┌─────────────────────────────────────┐
│  ← [Công Việc Gần Bạn]    [≡] [↻]  │  ← Header với nút Back, List, Refresh
├─────────────────────────────────────┤
│                                     │
│         🗺️  GOOGLE MAP              │
│                                     │
│    📍 (Technician - Màu xanh)       │
│                                     │
│    🔧 Job 1 (Viền xanh lá)         │
│    🔧 Job 2 (Viền cam)              │
│    🔧 Job 3 (Viền đỏ)               │
│                                     │
│    ~~~~~  Route Polyline  ~~~~~    │  ← Đường đi màu xanh
│                                     │
│                    [ 5 jobs ]       │  ← Badge đếm số jobs
│                                     │
├─────────────────────────────────────┤
│  ╔═══════════════════════════════╗ │
│  ║  Sửa Điều Hòa Khẩn Cấp    [✕]║ │  ← Bottom Sheet (khi chọn job)
│  ║  Máy lạnh không lạnh...       ║ │
│  ║  📍 123 Nguyễn Văn Linh       ║ │
│  ║  📅 25/12/2024 - 09:00        ║ │
│  ║  💰 500,000 ₫                 ║ │
│  ║  ─────────────────────────    ║ │
│  ║  📍 2.5 km    ⏱️ 8 phút       ║ │  ← Distance & Duration từ Google API
│  ║  ┌───────────────────────┐   ║ │
│  ║  │  Xem Chi Tiết →       │   ║ │  ← Action button
│  ║  └───────────────────────┘   ║ │
│  ╚═══════════════════════════════╝ │
└─────────────────────────────────────┘
```

## 🎯 Các thành phần chính

### 1. Map Components

#### Technician Marker (Vị trí thợ)
```
📍 Màu xanh (#2196F3)
   Icon: person (Ionicons)
   Size: 40x40px
   Border: white, 3px
   Shadow: elevation 5
```

#### Job Markers (Vị trí công việc)
```
🔧 Background: white
   Icon: construct (Ionicons)
   Border color theo urgency:
   - Low (bình thường): #4CAF50 (xanh lá)
   - Medium (trung bình): #FF9800 (cam)
   - High (khẩn): #FF5722 (đỏ cam)
   - Emergency (khẩn cấp): #F44336 (đỏ đậm)
   
   Khi selected: 
   - Background: #2196F3 (xanh)
   - Icon color: white
```

#### Route Polyline (Đường đi)
```
~~~~~ 
Color: #2196F3 (xanh)
Width: 4px
Coordinates: Decoded từ Google polyline
```

### 2. Header Actions

```
┌──────────────────────────────────┐
│  [←]  Công Việc Gần Bạn  [≡][↻] │
│   │          │             │  │   │
│  Back     Title         List Refresh
└──────────────────────────────────┘
```

### 3. Job Count Badge

```
┌─────────────┐
│ 📦 5 jobs   │  ← Floating badge
└─────────────┘
Position: Top right
Background: #2196F3
Color: white
```

### 4. Bottom Sheet (Job Details)

Hiển thị khi user tap vào job marker:

```
┌───────────────────────────────────┐
│ Sửa Điều Hòa Khẩn Cấp        [✕] │  ← Title + Close
├───────────────────────────────────┤
│ Máy lạnh không lạnh, cần thợ...  │  ← Description
│                                   │
│ 📍 123 Nguyễn Văn Linh, Q1       │  ← Address
│ 📅 25/12/2024 - 09:00             │  ← Date & Time
│ 💰 500,000 ₫                      │  ← Budget
├───────────────────────────────────┤
│    📍 2.5 km      ⏱️ 8 phút      │  ← Google API data
├───────────────────────────────────┤
│  ┌───────────────────────────┐   │
│  │   Xem Chi Tiết →          │   │  ← Action button
│  └───────────────────────────┘   │
└───────────────────────────────────┘

Max height: 40% màn hình
Scrollable nếu content dài
```

## 🔄 User Flow

### Scenario 1: Xem tất cả jobs gần
```
1. User mở NearbyJobsScreen (list view)
2. Tap nút "Map" icon ở header
3. → JobMapScreen hiển thị
4. Map tự động fit để hiển thị:
   - Vị trí thợ (technician marker)
   - Tất cả job markers
5. User có thể:
   - Pan/zoom map
   - Tap vào từng job marker
   - Tap nút "List" để quay lại list view
```

### Scenario 2: Chọn job và xem route
```
1. User đang ở JobMapScreen
2. Tap vào 1 job marker (ví dụ: Job #123)
3. → System gọi Google Directions API
4. → Decode polyline thành coordinates
5. → Vẽ route polyline từ thợ đến job
6. → Bottom sheet xuất hiện với:
   - Job details
   - Distance: "2.5 km" (từ Google)
   - Duration: "8 phút" (từ Google)
7. User có thể:
   - Tap "Xem Chi Tiết" → JobDetailScreen
   - Tap "✕" để đóng bottom sheet
   - Tap marker khác để xem job khác
```

### Scenario 3: Navigate đến job detail
```
1. User đang xem job trong bottom sheet
2. Tap "Xem Chi Tiết"
3. → Navigate to JobDetailScreen với jobId
4. → User có thể accept job, xem full info
```

## 🔧 Technical Details

### Map Initial Region
```javascript
{
  latitude: technicianLocation?.latitude || 10.7769,  // HCM City default
  longitude: technicianLocation?.longitude || 106.7009,
  latitudeDelta: 0.0922,  // Zoom level
  longitudeDelta: 0.0421,
}
```

### Auto Fit to Markers
```javascript
// Tự động zoom/pan để hiển thị tất cả markers
mapRef.current?.fitToCoordinates(coordinates, {
  edgePadding: { 
    top: 100,    // Space cho header
    right: 50, 
    bottom: 300, // Space cho bottom sheet
    left: 50 
  },
  animated: true, // Smooth animation
});
```

### Getting Route
```javascript
// 1. Call Google Directions API
const directions = await googleMapsService.getDirections(
  technicianLocation.latitude,
  technicianLocation.longitude,
  job.latitude,
  job.longitude
);

// 2. Decode polyline
const routePoints = googleMapsService.decodePolyline(directions.polyline);
// Returns: [{latitude, longitude}, {latitude, longitude}, ...]

// 3. Render on map
<Polyline
  coordinates={routePoints}
  strokeColor="#2196F3"
  strokeWidth={4}
/>
```

## 📊 Data Flow

```
JobMapScreen mount
    ↓
initMap()
    ↓
getCurrentLocation() → technicianLocation
    ↓
fetchNearbyJobs()
    ↓
jobService.getAvailableJobs({ categoryId })
    ↓
Calculate distance for each job (client-side)
    ↓
Sort jobs by distance
    ↓
Render markers on map
    ↓
fitToCoordinates()

User taps marker
    ↓
handleJobPress(job)
    ↓
setSelectedJob(job)
    ↓
googleMapsService.getDirections() → API call
    ↓
{distance, duration, polyline, steps}
    ↓
decodePolyline(polyline)
    ↓
setRouteCoordinates(points)
    ↓
setRouteInfo({distance, duration})
    ↓
Render Polyline + Bottom Sheet
```

## 🎨 Styling Reference

### Colors
```javascript
Primary Blue:     #2196F3  // Buttons, selected markers, routes
Success Green:    #4CAF50  // Budget, low urgency
Warning Orange:   #FF9800  // Medium urgency
Danger Red:       #FF5722  // High urgency
Emergency Red:    #F44336  // Emergency urgency
Background White: #fff
Text Dark:        #333
Text Gray:        #666
Border Gray:      #f0f0f0
```

### Typography
```javascript
Header Title:     18px, bold
Job Title:        18px, bold
Description:      14px, regular, #666
Info Text:        13px, regular, #666
Budget:           18px, bold, #4CAF50
Route Info:       14px, semi-bold, #333
Button Text:      16px, semi-bold, white
```

### Spacing
```javascript
Container Padding:  20px
Card Margin:        16px
Card Padding:       20px
Item Gap:           8-12px
Border Radius:      12-16px (cards), 20px (buttons/badges)
```

## 🧪 Test Cases

### ✅ Test Case 1: Map renders correctly
- [ ] Technician marker hiển thị đúng vị trí
- [ ] All job markers hiển thị
- [ ] Markers có đúng màu theo urgency
- [ ] Job count badge hiển thị số jobs chính xác

### ✅ Test Case 2: Select job and view route
- [ ] Tap job marker → bottom sheet xuất hiện
- [ ] Route polyline được vẽ từ thợ đến job
- [ ] Distance hiển thị (ví dụ: "2.5 km")
- [ ] Duration hiển thị (ví dụ: "8 phút")
- [ ] Selected marker đổi màu sang xanh

### ✅ Test Case 3: Navigation
- [ ] Nút "Back" → quay lại previous screen
- [ ] Nút "List" → navigate đến NearbyJobsScreen
- [ ] Nút "Refresh" → reload jobs
- [ ] Nút "Xem Chi Tiết" → navigate đến JobDetailScreen
- [ ] Close button (✕) → đóng bottom sheet

### ✅ Test Case 4: Multiple jobs
- [ ] Tap job marker 1 → route 1 hiển thị
- [ ] Tap job marker 2 → route 1 biến mất, route 2 hiển thị
- [ ] Previous selected marker về màu cũ
- [ ] New selected marker đổi sang màu xanh

### ✅ Test Case 5: Edge cases
- [ ] Không có jobs → hiển thị empty state
- [ ] Loading state → spinner + "Đang tải bản đồ..."
- [ ] API error → Alert "Không thể tải dữ liệu"
- [ ] No GPS → Dùng mock location (HCM City)

## 🚀 Performance Tips

1. **Optimize marker rendering**
   - Limit số markers hiển thị (max 50-100)
   - Dùng clustering nếu > 100 markers

2. **Cache directions**
   - Save directions trong state
   - Không gọi API lại khi re-select same job

3. **Debounce map movements**
   - Không fetch jobs mỗi lần pan/zoom
   - Chỉ fetch khi user stop interaction

4. **Lazy load bottom sheet**
   - Chỉ render khi selectedJob !== null
   - Unmount khi close

## 📱 Platform-specific Notes

### Android
- Cần enable Google Maps SDK for Android
- Package name trong Google Console: `host.exp.exponent` (Expo Go)
- Map style có thể khác iOS một chút

### iOS
- Cần enable Google Maps SDK for iOS
- Bundle ID trong Google Console: `host.exp.exponent` (Expo Go)
- Marker shadows render đẹp hơn Android

---

**Lưu ý:** Document này mô tả implementation hiện tại của JobMapScreen. Có thể customize thêm theo nhu cầu project.
