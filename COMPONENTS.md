# 🎨 HostelEase - Visual Component Guide

## 🎯 **Component Patterns Used**

### 1. **Gradient Text Headers**

```tsx
<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
  Your Title Here
</h1>
```

- Used for all major headings
- Creates eye-catching gradient effect
- Blue to indigo color scheme

---

### 2. **Interactive Cards**

```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
>
  Card Content
</motion.div>
```

- Scales slightly on hover
- Smooth shadow transitions
- Rounded corners (xl = 0.75rem)

---

### 3. **Gradient Buttons**

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg"
>
  Button Text
</motion.button>
```

- Press animation (scales down)
- Hover animation (scales up)
- Gradient background with shadow

---

### 4. **Status Badges**

```tsx
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
  Active
</span>
```

Colors by status:

- 🟢 Green: Success, Active, Available
- 🔴 Red: Error, Inactive, Full
- 🟠 Orange: Warning, Pending, Maintenance
- 🔵 Blue: Info, In Progress

---

### 5. **Search Inputs**

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
  <input
    type="text"
    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Search..."
  />
</div>
```

- Icon positioned absolutely inside input
- Focus ring on interaction
- Consistent padding and sizing

---

### 6. **Stats Cards**

```tsx
<div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-600 text-sm">Label</p>
      <p className="text-3xl font-bold text-gray-800">123</p>
    </div>
    <Icon className="h-12 w-12 text-blue-500 opacity-20" />
  </div>
</div>
```

- Left border for accent color
- Large number display
- Faded icon as decoration

---

### 7. **Navigation Sidebar**

```tsx
<motion.aside
  animate={{ width: sidebarOpen ? 280 : 80 }}
  className="fixed left-0 top-0 h-full bg-white shadow-xl"
>
  {/* Navigation items */}
</motion.aside>
```

- Animated width transition
- Fixed positioning
- Full height
- White background with shadow

---

### 8. **Data Tables**

```tsx
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-50 border-b">
      <tr>
        <th className="px-6 py-4 text-left text-sm font-semibold">Header</th>
      </tr>
    </thead>
    <tbody className="divide-y">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

- Rounded container
- Gray header background
- Hover effect on rows
- Dividers between rows

---

### 9. **Filter Buttons**

```tsx
<button
  className={`
    px-6 py-3 rounded-lg font-medium transition-all
    ${
      active
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }
  `}
>
  Filter
</button>
```

- Conditional styling based on state
- Gradient when active
- Gray when inactive

---

### 10. **Icon Buttons**

```tsx
<button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
  <Edit className="h-4 w-4" />
</button>
```

- Small padding for icon-only buttons
- Light background matching icon color
- Hover state darker

---

## 🎨 **Color System**

### Primary Colors

- `from-blue-600` (#2563eb) to `to-indigo-600` (#4f46e5)
- Used for: Main actions, headers, primary buttons

### Success Colors

- `from-green-500` (#22c55e) to `to-teal-600` (#0d9488)
- Used for: Success states, available status, positive metrics

### Warning Colors

- `from-orange-500` (#f97316) to `to-red-500` (#ef4444)
- Used for: Warnings, pending status, important alerts

### Info Colors

- `from-blue-500` (#3b82f6) to `to-cyan-500` (#06b6d4)
- Used for: Information, neutral states

### Gray Scale

- `gray-50` - Backgrounds (#f9fafb)
- `gray-100` - Hover states (#f3f4f6)
- `gray-200` - Borders (#e5e7eb)
- `gray-600` - Secondary text (#4b5563)
- `gray-800` - Primary text (#1f2937)

---

## 📏 **Spacing System**

### Padding

- `p-2` = 0.5rem (8px) - Icon buttons
- `p-4` = 1rem (16px) - Small components
- `p-6` = 1.5rem (24px) - Cards, sections
- `p-8` = 2rem (32px) - Large containers

### Margins

- `mb-2` = 0.5rem - Tight spacing
- `mb-4` = 1rem - Regular spacing
- `mb-6` = 1.5rem - Section spacing
- `mb-8` = 2rem - Large section breaks

### Gaps

- `gap-2` = 0.5rem - Button groups
- `gap-4` = 1rem - Form elements
- `gap-6` = 1.5rem - Card grids

---

## 📐 **Border Radius**

- `rounded` = 0.25rem - Small elements
- `rounded-lg` = 0.5rem - Inputs, buttons
- `rounded-xl` = 0.75rem - Cards, larger buttons
- `rounded-2xl` = 1rem - Containers, sections
- `rounded-3xl` = 1.5rem - Special components
- `rounded-full` = 9999px - Circles, pills, badges

---

## 🎭 **Shadow System**

- `shadow` - Small shadow
- `shadow-lg` - Medium shadow (cards)
- `shadow-xl` - Large shadow (hover states)
- `shadow-2xl` - Extra large shadow (modals, floating elements)

---

## ✨ **Animation Patterns**

### Entry Animations

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

- Fade in from below
- Staggered delay for lists

### Hover Animations

```tsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

- Slight scale increase on hover
- Scale decrease on click

### Sidebar Animation

```tsx
animate={{ width: sidebarOpen ? 280 : 80 }}
```

- Smooth width transition
- Maintains height

---

## 📱 **Responsive Grid System**

### 1 Column (Mobile)

```tsx
className = "grid grid-cols-1";
```

### 2 Columns (Tablet)

```tsx
className = "grid md:grid-cols-2";
```

### 3 Columns (Desktop)

```tsx
className = "grid lg:grid-cols-3";
```

### 4 Columns (Large Desktop)

```tsx
className = "grid lg:grid-cols-4";
```

### Responsive Gaps

```tsx
className = "grid gap-4 md:gap-6";
```

---

## 🎪 **Layout Patterns**

### Flex Center

```tsx
className = "flex items-center justify-center";
```

### Flex Between

```tsx
className = "flex items-center justify-between";
```

### Flex Column

```tsx
className = "flex flex-col";
```

### Grid Center

```tsx
className = "grid place-items-center";
```

---

## 🖼️ **Common Component Combinations**

### Feature Card

```tsx
<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all">
  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
    <Icon className="h-8 w-8 text-white" />
  </div>
  <h3 className="text-2xl font-bold mb-3">Title</h3>
  <p className="text-gray-600">Description</p>
</div>
```

### User Avatar

```tsx
<div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
  AB
</div>
```

### Section Header

```tsx
<div className="mb-8">
  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
    Page Title
  </h1>
  <p className="text-gray-600">Page description</p>
</div>
```

---

## 🎯 **Best Practices**

1. **Consistency** - Use same patterns across pages
2. **Spacing** - Maintain consistent gaps and padding
3. **Colors** - Stick to the defined color system
4. **Animations** - Keep them subtle and purposeful
5. **Responsive** - Test on all screen sizes
6. **Accessibility** - Use semantic HTML and ARIA labels
7. **Performance** - Optimize images and animations

---

**This guide helps maintain design consistency across the entire application!**
