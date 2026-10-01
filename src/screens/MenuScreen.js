import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { formatPrice } from '../api';
import { ErrorBox } from '../components/ui';
import { colors } from '../theme';
import OrderSheet from './OrderSheet';

export default function MenuScreen({ api }) {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setDishes(await api.getDishes());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  if (loading) {
    return <ActivityIndicator style={styles.center} color={colors.accent} size="large" />;
  }

  return (
    <>
      <FlatList
        data={dishes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.accent}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListHeaderComponent={
          error ? (
            <ErrorBox message={error} onRetry={load} />
          ) : (
            <Text style={styles.hint}>Toque em um prato para fazer o pedido.</Text>
          )
        }
        ListEmptyComponent={!error && <Text style={styles.hint}>Nenhum prato cadastrado.</Text>}
        renderItem={({ item }) => <DishCard dish={item} onPress={() => setSelected(item)} />}
      />
      <OrderSheet
        api={api}
        dish={selected}
        onClose={(ordered) => {
          setSelected(null);
          if (ordered) load(); // atualiza o estoque
        }}
      />
    </>
  );
}

function DishCard({ dish, onPress }) {
  const soldOut = dish.stock <= 0;
  return (
    <Pressable
      onPress={onPress}
      disabled={soldOut}
      accessibilityRole="button"
      accessibilityState={{ disabled: soldOut }}
      style={({ pressed }) => [styles.card, soldOut && styles.soldOut, pressed && styles.pressed]}
    >
      <View style={styles.cardBody}>
        <Text style={styles.name}>{dish.name}</Text>
        {!!dish.description && <Text style={styles.description}>{dish.description}</Text>}
        <Text style={styles.price}>{formatPrice(dish.price)}</Text>
      </View>
      <View style={[styles.badge, soldOut ? styles.badgeOut : styles.badgeIn]}>
        <Text style={[styles.badgeText, { color: soldOut ? colors.danger : colors.success }]}>
          {soldOut ? 'Esgotado' : `${dish.stock} ${dish.stock === 1 ? 'restante' : 'restantes'}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  list: { padding: 16, gap: 12 },
  hint: { color: colors.muted, fontSize: 14, marginBottom: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  soldOut: { opacity: 0.5 },
  pressed: { backgroundColor: colors.surfaceAlt },
  cardBody: { flex: 1, gap: 4 },
  name: { color: colors.text, fontSize: 17, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  price: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeIn: { backgroundColor: '#13261A' },
  badgeOut: { backgroundColor: '#2A1416' },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
