# React Native Motion Kit

A simple animation utils for React Native using `react-native-reanimated`.

## Installation

```bash
npm install react-native-reanimated
```

## Quick Start

```tsx
import { MotionView } from '@/motion';

// Basic usage
<MotionView visible={isVisible} preset="fadeIn">
  <YourContent />
</MotionView>
```

## Presets

### `fadeIn` - Fades in/out
```tsx
<MotionView visible={show} preset="fadeIn">
  <Card />
</MotionView>
```

### `slideUp` - Slides up with fade
```tsx
<MotionView visible={show} preset="slideUp">
  <Card />
</MotionView>
```

### `scaleIn` - Scales with fade
```tsx
<MotionView visible={show} preset="scaleIn">
  <Card />
</MotionView>
```

## Custom Animations

```tsx
// Custom movement
<MotionView
  visible={show}
  from={{ opacity: 0, translateX: -100 }}
  to={{ opacity: 1, translateX: 0 }}
  duration={400}
>
  <Card />
</MotionView>

// With rotation
<MotionView
  visible={show}
  from={{ rotate: 0 }}
  to={{ rotate: 360 }}
  duration={1000}
>
  <Icon />
</MotionView>
```

## Options

| Prop | Type | Description |
|------|------|-------------|
| `visible` | boolean | Show/hide with animation |
| `preset` | string | Use preset animation |
| `from` | object | Starting state |
| `to` | object | Ending state |
| `duration` | number \| object | Animation duration (ms) |
| `delay` | number | Start delay (ms) |
| `easing` | string | Animation curve |

## Easing Types

- `standard` - Default
- `emphasized` - Strong ease
- `linear` - Constant speed
- `springy` - Bounce effect
- `snappy` - Quick snap

```tsx
<MotionView visible={show} preset="slideUp" easing="springy">
  <Card />
</MotionView>
```

## Advanced Examples

### Staggered List
```tsx
{items.map((item, i) => (
  <MotionView
    key={item.id}
    visible={true}
    preset="slideUp"
    delay={i * 50}
  >
    <ListItem {...item} />
  </MotionView>
))}
```

### Different Enter/Exit
```tsx
<MotionView
  visible={show}
  duration={{ enter: 400, exit: 200 }}
  easing={{ enter: "decelerate", exit: "accelerate" }}
>
  <Modal />
</MotionView>
```

### Combine Preset + Custom
```tsx
<MotionView
  visible={show}
  preset="fadeIn"
  from={{ scale: 0.5 }}
  to={{ scale: 1 }}
>
  <Card />
</MotionView>
```

## Using the Hook

```tsx
import { useMotion } from '@/motion';

function MyComponent({ visible }) {
  const { style } = useMotion(visible, {
    preset: 'slideUp',
    duration: 500
  });

  return <Animated.View style={style}>...</Animated.View>;
}
```

## File Structure

```
motion/
├── index.ts           # Main exports
├── MotionView.tsx     # Component
├── useMotion.ts       # Hook
├── presets/          # Animation presets
├── easing/           # Easing curves
├── types/            # TypeScript types
└── utils/            # Helper functions
```

## Animation Properties

- `opacity` - Fade (0-1)
- `translateX` - Move horizontally
- `translateY` - Move vertically
- `scale` - Size (0-1+)
- `rotate` - Rotation (degrees)
- `width` - Animate width

## Complete Example

```tsx
import { useState } from 'react';
import { MotionView } from '@/motion';

export function AnimatedCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)}>
      <MotionView
        visible={expanded}
        from={{
          opacity: 0,
          translateY: -20,
          scale: 0.95
        }}
        to={{
          opacity: 1,
          translateY: 0,
          scale: 1
        }}
        duration={300}
        easing="emphasized"
      >
        <Text>Expanded Content</Text>
      </MotionView>
    </TouchableOpacity>
  );
}
```

That's it! Simple, performant animations for React Native. 🎉