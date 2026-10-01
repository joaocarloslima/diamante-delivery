import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { ErrorBox, Stars } from '../components/ui';
import { colors } from '../theme';

const REFRESH_MS = 5000; // o review-service grava no banco a cada 5 s

export default function RankingScreen({ api }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    try {
      setRanking(await api.getRanking());
      setError(null);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    setLoading(true);
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} color={colors.accent} size="large" />;
  }

  return (
    <FlatList
      data={ranking}
      keyExtractor={(item) => String(item.dishId)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        error ? (
          <ErrorBox message={error} onRetry={load} />
        ) : (
          <Text style={styles.hint}>
            Atualiza sozinho a cada 5 segundos
            {updatedAt ? ` · ${updatedAt.toLocaleTimeString('pt-BR')}` : ''}
          </Text>
        )
      }
      ListEmptyComponent={
        !error && (
          <Text style={styles.empty}>
            Nenhuma avaliação ainda. Faça um pedido e avalie o prato.
          </Text>
        )
      }
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={[styles.position, index === 0 && { color: colors.accent }]}>{index + 1}</Text>
          <View style={styles.body}>
            <Text style={styles.name}>{item.dishName}</Text>
            <View style={styles.meta}>
              <Stars value={item.average} size={16} />
              <Text style={styles.metaText}>
                {Number(item.average).toFixed(1)} · {item.count} avaliaç{item.count === 1 ? 'ão' : 'ões'}
              </Text>
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  hint: { color: colors.muted, fontSize: 14, marginBottom: 4 },
  empty: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: 40, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  position: { color: colors.muted, fontSize: 24, fontWeight: '800', width: 28, textAlign: 'center' },
  body: { flex: 1, gap: 4 },
  name: { color: colors.text, fontSize: 17, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { color: colors.muted, fontSize: 14 },
});
