---
name: react-native-patterns
description: Patterns for React Native mobile app in this project. Use when creating or modifying mobile screens, components, navigation, or working with files in src/mobile/. Uses the same tRPC client and shared types as the web app.
---

# React Native Patterns

## Screen Pattern

File: `src/mobile/src/screens/EntityScreen.tsx`

```tsx
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { trpc } from "../utils/trpc";
import { EntityCard } from "../components/EntityCard";

export function EntityScreen() {
  const query = trpc.entity.list.useQuery({ page: 1, limit: 20 });

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (query.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {query.error.message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={query.data?.items ?? []}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <EntityCard entity={item} />}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, gap: 12 },
  error: { color: "red", fontSize: 16 },
});
```

## Component Pattern

File: `src/mobile/src/components/EntityCard.tsx`

```tsx
import { View, Text, StyleSheet } from "react-native";

interface EntityCardProps {
  entity: { _id: string; name: string; status: string };
}

export function EntityCard({ entity }: EntityCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{entity.name}</Text>
      <Text style={styles.status}>{entity.status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "600" },
  status: { fontSize: 14, color: "#666" },
});
```

## Navigation

File: `src/mobile/src/navigation/RootNavigator.tsx`

Add new screens to the navigator:
```tsx
export type RootStackParamList = {
  Home: undefined;
  Users: undefined;
  Entities: undefined;  // Add type
};

// In Stack.Navigator:
<Stack.Screen name="Entities" component={EntityScreen} />
```

## Key Differences from Web
| Web (src/client/) | Mobile (src/mobile/src/) |
|---|---|
| `<div>`, `<span>`, `<p>` | `<View>`, `<Text>` |
| `<ul>` with `.map()` | `<FlatList>` |
| CSS / inline styles | `StyleSheet.create()` |
| `<Link to="/path">` | `navigation.navigate("Screen")` |
| React Router | React Navigation |
| `<input>` | `<TextInput>` |
| `<button>` | `<TouchableOpacity>` / `<Pressable>` |

## Same as Web
- tRPC hooks: `trpc.entity.list.useQuery()` — identical API
- Shared types from `@shared/` — same Zod schemas
- React Query caching and refetching — same behavior
- Mutations with `useMutation()` — same pattern

## Rules
- Use `StyleSheet.create()` at bottom of file, not inline styles
- Use `<FlatList>` for lists, never `ScrollView` with `.map()`
- Keep screens under 300 lines — extract components
- One screen/component per file
