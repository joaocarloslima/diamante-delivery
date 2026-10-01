import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createApi } from './src/api';
import { colors } from './src/theme';
import AssistantScreen from './src/screens/AssistantScreen';
import MenuScreen from './src/screens/MenuScreen';
import RankingScreen from './src/screens/RankingScreen';
import SettingsModal from './src/screens/SettingsModal';

// No emulador Android, o computador é 10.0.2.2. No celular, troque pelo IP da rede.
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

const TABS = [
  { key: 'menu', label: 'Cardápio', icon: '🍔', title: 'Cardápio' },
  { key: 'ranking', label: 'Ranking', icon: '🏆', title: 'Ranking' },
  { key: 'assistant', label: 'Assistente', icon: '💬', title: 'Assistente' },
];

export default function App() {
  const [host, setHost] = useState(DEFAULT_HOST);
  const [tab, setTab] = useState('menu');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const api = useMemo(() => createApi(host), [host]);
  const current = TABS.find((t) => t.key === tab);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>{current.title}</Text>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Configurar servidor"
            style={({ pressed }) => [styles.serverChip, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.serverText}>⚙︎ {host}</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          {tab === 'menu' && <MenuScreen api={api} />}
          {tab === 'ranking' && <RankingScreen api={api} />}
          {tab === 'assistant' && <AssistantScreen api={api} />}
        </View>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.tabBarArea}>
        <View style={styles.tabBar}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={styles.tab}
              >
                <Text style={[styles.tabIcon, !active && { opacity: 0.5 }]}>{t.icon}</Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <SettingsModal
        visible={settingsOpen}
        host={host}
        onClose={() => setSettingsOpen(false)}
        onSave={(newHost) => {
          setHost(newHost);
          setSettingsOpen(false);
        }}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  serverChip: {
    maxWidth: '55%',
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serverText: { color: colors.muted, fontSize: 13 },
  content: { flex: 1 },
  tabBarArea: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  tabBar: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, minHeight: 56 },
  tabIcon: { fontSize: 22 },
  tabLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  tabLabelActive: { color: colors.accent, fontWeight: '700' },
});
