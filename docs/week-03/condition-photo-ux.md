# Condition Photo UX Mockup Specification

> **Week 3 deliverable** · §11.3 of PROJECT_PLAN
> **Purpose:** Detail the before/after condition photo capture flow with watermarking and timestamping
> **Reference:** `design/design.md` for colors, `docs/week-03/database-schema-v1.md` for data model

---

## 1. Overview

Condition photos are **critical trust evidence** in CampusShare. They provide timestamped, tamper-evident visual proof of item state at handoff and return. The system requires:
- **Before photos** at pickup (minimum 1, recommended 3)
- **After photos** at return (minimum 1, recommended 3)
- **Server-side timestamp** embedded in metadata
- **Watermark overlay** with user ID + timestamp
- **Immutable storage** in Firebase Storage

---

## 2. Capture Flow

### 2.1 Before Photos (Pickup)

```
┌─────────────────────────────────┐
│ [Back Arrow]    Capture Photos  │
├─────────────────────────────────┤
│ [Instructions]                  │
│ Take photos of the item's       │
│ current condition before you    │
│ take it.                        │
├─────────────────────────────────┤
│ [Photo Grid]                    │
│ ┌─────────┐ ┌─────────┐       │
│ │ 📷 Add  │ │ 📷 Add  │       │
│ └─────────┘ └─────────┘       │
│ ┌─────────┐                    │
│ │ 📷 Add  │                    │
│ └─────────┘                    │
├─────────────────────────────────┤
│ [Tips]                          │
│ • Capture front, back, and     │
│   any damage zones              │
│ • Include the full item         │
│ • Good lighting helps           │
├─────────────────────────────────┤
│ [Continue]                      │
└─────────────────────────────────┘
```

**User Actions:**
1. Tap "Add" to open camera
2. Capture photo with guided overlay
3. Photo appears in grid with watermark preview
4. Add more photos or continue

**System Actions:**
1. Capture image from camera
2. Apply watermark overlay (client-side preview)
3. Upload to Firebase Storage
4. Generate server timestamp
5. Create `condition_photos` document

### 2.2 After Photos (Return)

```
┌─────────────────────────────────┐
│ [Back Arrow]    Capture Photos  │
├─────────────────────────────────┤
│ [Instructions]                  │
│ Take photos of the item's       │
│ current condition before you    │
│ return it.                      │
├─────────────────────────────────┤
│ [Photo Comparison]              │
│ Before          After           │
│ [Image 1]       [📷 Add]       │
│ [Image 2]       [📷 Add]       │
│ [Image 3]       [📷 Add]       │
├─────────────────────────────────┤
│ [Tips]                          │
│ • Match the same angles as     │
│   the "before" photos           │
│ • Capture any changes or damage │
├─────────────────────────────────┤
│ [Submit Return]                 │
└─────────────────────────────────┘
```

**User Actions:**
1. View "before" photos for reference
2. Tap "Add" to capture matching "after" photos
3. System shows side-by-side comparison
4. Submit return with evidence

**System Actions:**
1. Display "before" photos from Firebase Storage
2. Capture new photos with watermark
3. Store as `condition_photos` with `stage: 'after'`
4. Notify lender to confirm return

---

## 3. Camera Interface

### 3.1 Guided Capture Overlay

```
┌─────────────────────────────────┐
│ [Flash] [Close] [Switch Camera] │
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │   Guided Frame Area     │   │
│   │   (Semi-transparent     │   │
│   │    white border)        │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
│   "Position item within frame"  │
│                                 │
├─────────────────────────────────┤
│ [Gallery]  [📷 Capture]  [Timer]│
└─────────────────────────────────┘
```

**Guided Frame:**
- Semi-transparent white border (2px)
- Rounded corners (12px)
- Text prompt: "Position item within frame"
- Auto-detect: When item fills 80% of frame, border turns green (#27AE60)

**Camera Controls:**
- Flash: Toggle (auto/on/off)
- Close: Return to previous screen
- Switch: Front/rear camera
- Gallery: Pick from existing photos
- Capture: Take photo
- Timer: 3-second delay option

### 3.2 Watermark Preview

After capture, show preview with watermark overlay:

```
┌─────────────────────────────────┐
│ [Retake]    [Use Photo]         │
├─────────────────────────────────┤
│                                 │
│   [Photo with watermark]        │
│                                 │
│   ┌─────────────────────────┐   │
│   │ John D.                 │   │
│   │ 2026-01-15 14:32:05     │   │
│   │ CampusShare Verified     │   │
│   └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│ [Watermark Settings]            │
│ ☑ Show name                     │
│ ☑ Show timestamp                │
│ ☑ Show verification badge       │
└─────────────────────────────────┘
```

**Watermark Design:**
- Position: Bottom-left corner
- Background: Semi-transparent black (60% opacity)
- Text: White, 12px
- Lines: Name, timestamp (ISO 8601), verification badge
- Border-radius: 4px
- Padding: 8px

---

## 4. Photo Requirements

### 4.1 Technical Specifications

| Property | Value |
|----------|-------|
| **Format** | JPEG |
| **Max size** | 5MB per photo |
| **Resolution** | Minimum 1280×720, recommended 1920×1080 |
| **Compression** | 85% quality (balance quality/size) |
| **Metadata** | EXIF stripped, custom fields added |

### 4.2 Metadata Fields

```json
{
  "capturedBy": "userId",
  "capturedAt": "2026-01-15T14:32:05Z",
  "bookingId": "bookingId",
  "stage": "before" | "after",
  "watermark": {
    "name": "John D.",
    "timestamp": "2026-01-15 14:32:05",
    "verified": true
  }
}
```

### 4.3 Storage Structure

```
gs://campusshare-photos/
  bookings/
    {bookingId}/
      before/
        {photoId}.jpg
        {photoId}-thumb.jpg (200px width)
      after/
        {photoId}.jpg
        {photoId}-thumb.jpg
  items/
    {itemId}/
      primary/
        {photoId}.jpg
      gallery/
        {photoId}.jpg
```

---

## 5. Watermark Implementation

### 5.1 Client-Side Preview

```typescript
// React Native implementation sketch
const WatermarkedPhoto = ({ uri, name, timestamp, verified }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} />
      <View style={styles.watermark}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
        {verified && (
          <View style={styles.verifiedBadge}>
            <Icon name="shield" size={12} color="#27AE60" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
    </View>
  );
};
```

### 5.2 Server-Side Finalization

After upload, server applies final watermark with:
- Server-generated timestamp (not client time)
- User ID hash for tamper evidence
- Cryptographic signature (optional, for high-security)

### 5.3 Tamper Detection

- Store original image hash (SHA-256)
- Compare hash on download
- Alert if mismatch detected
- Immutable: No delete/replace operations allowed

---

## 6. Photo Comparison View

### 6.1 Side-by-Side Layout

```
┌─────────────────────────────────┐
│ [Back]    Photo Comparison      │
├─────────────────────────────────┤
│ [Item Summary]                  │
│ Chemistry Lab Coat (Size M)     │
├─────────────────────────────────┤
│ [Comparison Grid]               │
│                                 │
│ Before          After           │
│ ┌─────────┐   ┌─────────┐     │
│ │ 📷      │   │ 📷      │     │
│ └─────────┘   └─────────┘     │
│                                 │
│ [Difference Highlights]         │
│ ⚠️ New stain detected           │
│ ⚠️ Missing button               │
│                                 │
├─────────────────────────────────┤
│ [Lender Actions]                │
│ [Confirm Return] [Raise Dispute]│
└─────────────────────────────────┘
```

### 6.2 AI-Powered Comparison (Future Enhancement)

- Detect visual differences between before/after
- Highlight potential damage areas
- Provide confidence score for damage detection
- Flag significant changes for review

---

## 7. Accessibility

### 7.1 Camera Interface

- **VoiceOver/TalkBack:** Announce "Camera ready" when opened
- **Guided frame:** High contrast border for visibility
- **Capture button:** Large (64px), high contrast
- **Timer:** Audio countdown beep

### 7.2 Photo Review

- **Zoom:** Pinch-to-zoom with double-tap reset
- **Watermark:** Sufficient contrast for readability
- **Comparison:** Clear labels for before/after
- **Actions:** Large touch targets for confirm/dispute

### 7.3 Reduced Motion

- Disable watermark animation
- Static comparison view instead of swipe
- No camera overlay animations

---

## 8. Error Handling

### 8.1 Camera Errors

| Error | User Message | Action |
|-------|--------------|--------|
| Permission denied | "Camera access needed" | Open settings |
| No camera | "No camera available" | Use gallery |
| Low storage | "Storage full" | Prompt to free space |

### 8.2 Upload Errors

| Error | User Message | Action |
|-------|--------------|--------|
| Network error | "Upload failed. Retry?" | Auto-retry 3x |
| File too large | "Photo too large (max 5MB)" | Compress and retry |
| Invalid format | "Unsupported format" | Convert to JPEG |
| Server error | "Upload failed. Try again." | Queue for retry |

### 8.3 Offline Support

- Queue photos locally when offline
- Upload when network restored
- Show pending status in UI
- No data loss guaranteed

---

## 9. Performance Optimization

### 9.1 Image Processing

- **Client-side compression:** Reduce to 85% quality
- **Thumbnail generation:** 200px width for list views
- **Lazy loading:** Load thumbnails first, full-size on tap
- **Caching:** Cache locally with expo-file-system

### 9.2 Upload Optimization

- **Chunked upload:** Split large files (not needed for <5MB)
- **Background upload:** Continue upload when app backgrounds
- **Progress indicator:** Show upload progress
- **Retry logic:** Exponential backoff on failure

### 9.3 Storage Management

- **Lifecycle rules:** Auto-delete orphaned photos after 30 days
- **Compression:** WebP format for thumbnails (future)
- **CDN:** Use Firebase CDN for fast delivery

---

*This specification aligns with PROJECT_PLAN §11.3 and the design system in `design/design.md`.*