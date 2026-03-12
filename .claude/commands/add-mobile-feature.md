Add a mobile feature for "$ARGUMENTS". The backend (schema, model, service, router) should already exist. If not, run `/add-feature $ARGUMENTS` first.

## Steps:

### 1. Screen
Create `src/mobile/src/screens/${Name}sScreen.tsx`:
- Use `trpc.${name}.list.useQuery()` for data
- Use `<FlatList>` for lists
- Handle loading, error, empty states

### 2. Card/List Item Component
Create `src/mobile/src/components/${Name}Card.tsx`:
- Display entity data in a card layout
- Use `StyleSheet.create()` for styles

### 3. Create Form (if needed)
Create `src/mobile/src/screens/Create${Name}Screen.tsx`:
- Use `trpc.${name}.create.useMutation()`
- Use TextInput components for form fields
- Navigate back on success

### 4. Register Navigation
In `src/mobile/src/navigation/RootNavigator.tsx`:
- Add screen types to `RootStackParamList`
- Add `<Stack.Screen>` entries

### 5. Add Navigation
Add a button or tab to navigate to the new screen.

## Rules:
- Use the SAME tRPC hooks as web — types are shared automatically
- Use React Native components (View, Text, FlatList), NOT HTML elements
- Use `StyleSheet.create()`, NOT inline style objects
- Keep each file under 300 lines
