Add a new React Native screen called "$ARGUMENTS" to the mobile app.

1. Create `src/mobile/src/screens/${Name}Screen.tsx`:
   - Import from `react-native` (View, Text, StyleSheet, etc.)
   - Use typed navigation props from `RootStackParamList`
   - Use `StyleSheet.create()` for styles at bottom of file
   - Use tRPC hooks for data fetching (same as web)

2. Register in `src/mobile/src/navigation/RootNavigator.tsx`:
   - Add to `RootStackParamList` type
   - Add `<Stack.Screen>` entry

3. If the screen needs data, use the same tRPC hooks as web:
   ```tsx
   import { trpc } from "../utils/trpc";
   const query = trpc.entity.list.useQuery({ page: 1, limit: 20 });
   ```

## Patterns:
- Loading: Use `<ActivityIndicator>` from react-native
- Lists: Use `<FlatList>` (not ScrollView with map)
- Errors: Show error message in red Text
- Extract list items into `src/mobile/src/components/${Name}Card.tsx`

Keep files under 300 lines. Follow existing screen patterns in `src/mobile/src/screens/`.
