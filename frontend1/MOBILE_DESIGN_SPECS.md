# Mobile Design Specifications - Pixel Perfect

## 📱 Critical Mobile Features

### 1. Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```
- `initial-scale=1.0` - Start at 100% zoom
- `maximum-scale=1.0` - Prevent zoom (app-like)
- `user-scalable=no` - Disable pinch zoom
- `viewport-fit=cover` - **CRITICAL** for iPhone notch/Dynamic Island

### 2. Safe Area Insets (iOS Notch Support)
```css
.pt-safe { padding-top: env(safe-area-inset-top, 0px); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
```
- Applied to **header** (top notch)
- Applied to **bottom nav** (home indicator bar)

### 3. Touch Target Sizes
- **Minimum**: 48px × 48px (Apple/Google guidelines)
- **Used for**: All buttons, links, icons, nav items
- Variable: `touch_target_min: 48px`

### 4. Native-Like Interactions
```css
-webkit-tap-highlight-color: transparent;  /* Remove tap flash */
overscroll-behavior-y: none;               /* Prevent bounce scroll */
::-webkit-scrollbar { display: none; }     /* Hide scrollbars */
```

### 5. Backdrop Blur (iOS/Android)
```css
backdrop-blur-xl  /* 20px blur on header/nav */
bg-surface/80     /* 80% opacity with blur */
```
- Creates glassmorphism effect
- Header and nav have translucent background

## 🎨 Exact Pixel Specifications

### Spacing (Based on 4px Base Unit)
```
xs:  4px   (0.25rem)
sm:  12px  (0.75rem)
md:  24px  (1.5rem)
lg:  32px  (2rem)
xl:  48px  (3rem)
```

### Component Heights
```
Input fields:  56px (h-[56px])
Buttons:       56px (h-[56px])
Header:        80px (h-20 = 5rem = 80px)
Bottom Nav:    80px (h-20)
Touch targets: 48px minimum
```

### Border Radius
```
DEFAULT:  4px  (rounded)
lg:       8px  (rounded-lg)
xl:       12px (rounded-xl)
full:     9999px (rounded-full)
```

### Typography Scale
```
headline-xl:        32px / 40px / -0.02em / 700
headline-xl-mobile: 28px / 36px / 700
headline-lg:        24px / 32px / -0.01em / 700
headline-md:        20px / 28px / 600
body-lg:            18px / 28px / 400
body-md:            16px / 24px / 400
label-md:           16px / 20px / 0.05em / 600
```

### Container Width
```
Mobile:  100% with 24px (md) padding
Desktop: max-width 640px (max-w-container)
```

### Shadows
```
header:     0 1px 8px rgba(0,0,0,0.04)
bottom-nav: 0 -1px 8px rgba(0,0,0,0.04)
card:       shadow-sm
button:     shadow-md
```

## 🔧 Implementation Checklist

### Login Page Exact Match
- [ ] **Logo**: 96px × 96px (w-24 h-24), rounded-md, centered
- [ ] **Title**: headline-xl-mobile (28px), primary-container color
- [ ] **Subtitle**: body-lg (18px), on-surface-variant
- [ ] **Spacing**: mb-lg between logo section and form
- [ ] **Card**: bg-surface-container-lowest, rounded-xl, shadow-lg
- [ ] **Card Padding**: p-md (24px) mobile, md:p-lg (32px) desktop
- [ ] **Form Gap**: gap-md (24px) between fields
- [ ] **Label**: font-label-md, text-on-surface
- [ ] **Input Height**: 56px exact
- [ ] **Input Padding**: px-sm (12px)
- [ ] **Input Radius**: rounded-lg (8px)
- [ ] **Password Toggle**: absolute right-0, h-[56px], px-sm
- [ ] **Forgot Link**: h-touch_target_min (48px), -ml-xs for alignment
- [ ] **Button Height**: 56px
- [ ] **Button Radius**: rounded-lg (8px)
- [ ] **Divider**: h-[1px], my-sm (12px)
- [ ] **Min Height**: min-h-[calc(100vh-176px)] for content area

### Bottom Navigation Exact Match
- [ ] **Fixed**: bottom-0, inset-x-0, z-50
- [ ] **Background**: bg-surface/80, backdrop-blur-xl
- [ ] **Safe Area**: pb-safe for iPhone home indicator
- [ ] **Shadow**: shadow-[0_-1px_8px_rgba(0,0,0,0.04)]
- [ ] **Height**: h-20 (80px)
- [ ] **Container**: max-w-container-max-width, mx-auto
- [ ] **Layout**: flex justify-around
- [ ] **Items**: min-w-[touch_target_min] (48px)
- [ ] **Icon Size**: text-[28px]
- [ ] **Label Size**: text-[11px]
- [ ] **Active Color**: text-primary, font-bold
- [ ] **Inactive Color**: text-on-surface-variant
- [ ] **Transition**: transition-colors

### Header Exact Match
- [ ] **Fixed**: top-0, inset-x-0, z-50
- [ ] **Background**: bg-surface/80, backdrop-blur-xl
- [ ] **Safe Area**: pt-safe for iPhone notch
- [ ] **Shadow**: shadow-[0_1px_8px_rgba(0,0,0,0.04)]
- [ ] **Height**: h-20 (80px)
- [ ] **Container**: max-w-container-max-width, mx-auto
- [ ] **Padding**: px-md (24px)
- [ ] **Logo Height**: h-8 (32px)
- [ ] **Title**: font-headline-md, text-headline-md, text-primary
- [ ] **Profile Button**: w-touch_target_min, h-touch_target_min
- [ ] **Profile Icon**: text-[24px]

## 📐 Content Area Calculations

### Full Layout Breakdown
```
Total viewport: 100vh

With header & nav:
- Header:      80px (h-20)
- Content:     calc(100vh - 160px)
- Bottom Nav:  80px (h-20)

With safe areas (iPhone 14 Pro):
- Top safe:    ~59px (Dynamic Island)
- Bottom safe: ~34px (Home indicator)
- Header:      80px + 59px = 139px
- Bottom Nav:  80px + 34px = 114px
- Content:     calc(100vh - 253px)

Login page (no nav):
- Header:      80px + top-safe
- Content:     calc(100vh - 176px)
- min-h-[calc(100vh-176px)]
```

## 🎯 Pixel-Perfect Verification

### Tools to Use
1. **Chrome DevTools**
   - Device emulation
   - iPhone 14 Pro / Pixel 7
   - Measure spacing with rulers

2. **Firefox DevTools**
   - Responsive design mode
   - iOS safe area simulation

3. **Real Device Testing**
   - iPhone (test notch)
   - Android (test navigation bar)
   - Different screen sizes

### Measurements to Verify
- [ ] Header height = exactly 80px
- [ ] Bottom nav height = exactly 80px
- [ ] Input height = exactly 56px
- [ ] Button height = exactly 56px
- [ ] Touch targets >= 48px
- [ ] Logo = 96px × 96px
- [ ] Icon sizes match spec
- [ ] Spacing matches 4px grid
- [ ] Border radius matches spec
- [ ] Colors match hex codes

## 🚀 Mobile Performance

### Optimizations Applied
- [ ] **No bounce scroll**: `overscroll-behavior-y: none`
- [ ] **No tap highlight**: `-webkit-tap-highlight-color: transparent`
- [ ] **No scrollbars**: `::-webkit-scrollbar { display: none }`
- [ ] **Smooth transitions**: `transition-colors` on interactive elements
- [ ] **Active state feedback**: `:active` pseudo-class
- [ ] **Focus visible**: `focus-visible:ring-2` for accessibility
- [ ] **Will-change**: For animated elements
- [ ] **Transform**: Use for animations (GPU accelerated)

### Touch Gestures
- [ ] **Tap**: All buttons/links respond immediately
- [ ] **Swipe**: Navigation between pages (future enhancement)
- [ ] **Pull to refresh**: Disabled (overscroll-behavior-y: none)
- [ ] **Pinch zoom**: Disabled (maximum-scale=1.0)

## 📱 Platform-Specific Behavior

### iOS Specific
```css
/* Safe areas for notch */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);

/* Prevent iOS zoom on input focus */
font-size: 16px minimum;

/* Disable iOS rubber band effect */
overscroll-behavior-y: none;
```

### Android Specific
```css
/* Bottom navigation bar padding */
pb-safe applies to Android nav bar too

/* Material Design ripple (future) */
Can add ripple effect with tailwind plugins
```

## ✅ Acceptance Criteria

A page is pixel-perfect when:
1. ✅ All spacing matches 4px grid
2. ✅ All colors match exact hex codes
3. ✅ All fonts match spec (family, size, weight, line-height)
4. ✅ All border radius matches spec
5. ✅ All shadows match spec
6. ✅ Touch targets >= 48px
7. ✅ Safe areas work on iPhone
8. ✅ Looks identical to Stitch HTML on mobile
9. ✅ Smooth 60fps animations
10. ✅ No layout shift on load

## 🛠️ Development Workflow

1. **Open Stitch HTML** in browser
2. **Inspect elements** with DevTools
3. **Measure exact pixels**
4. **Build React component** matching measurements
5. **Test on mobile device**
6. **Compare side-by-side**
7. **Adjust until perfect match**
8. **Repeat for each component/page**

---

**This spec ensures PERFECT mobile implementation!** 📱✨
