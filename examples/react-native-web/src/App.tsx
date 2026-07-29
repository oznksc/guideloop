import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GuideLoop, type Step } from 'guideloop';

/**
 * GuideLoop highlights real DOM nodes. With react-native-web, set `nativeID`
 * (maps to HTML `id`) so CSS selectors like `#cta` resolve.
 */
export default function App() {
  const [open, setOpen] = useState(false);

  const steps = useMemo<Step[]>(
    () => [
      {
        target: '#hero-title',
        title: 'React Native Web',
        content:
          'GuideLoop runs in the browser over RN-Web views. Targets use nativeID → id.',
        placement: 'bottom',
      },
      {
        target: '#cta',
        title: 'Primary CTA',
        content: 'Pressable with nativeID="cta" is a valid spotlight target.',
        placement: 'top',
        spotlightShape: 'rect',
      },
      {
        target: '#status-pill',
        title: 'Status pill',
        content: 'Circle cutout around a compact RN-Web view.',
        placement: 'left',
        spotlightShape: 'circle',
      },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.chip}>react-native-web</Text>
          <Text nativeID="hero-title" style={styles.title}>
            Product tour on RN-Web
          </Text>
          <Text style={styles.muted}>
            This example is for web targets that share RN primitives. GuideLoop
            is not a native mobile SDK — it needs a DOM.
          </Text>

          <View style={styles.row}>
            <Pressable
              nativeID="cta"
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              onPress={() => setOpen(true)}
            >
              <Text style={styles.btnText}>Start tour</Text>
            </Pressable>
            <View nativeID="status-pill" style={styles.pill}>
              <Text style={styles.pillText}>Live</Text>
            </View>
          </View>
        </View>
      </View>

      <GuideLoop
        steps={steps}
        isOpen={open}
        onClose={() => setOpen(false)}
        onComplete={() => setOpen(false)}
        theme="antd"
        debug
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  page: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  chip: {
    alignSelf: 'flex-start',
    color: '#93c5fd',
    backgroundColor: '#1e3a5f',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  muted: {
    color: '#94a3b8',
    lineHeight: 22,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
  pill: {
    backgroundColor: '#14532d',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    color: '#86efac',
    fontWeight: '700',
    fontSize: 12,
  },
});
