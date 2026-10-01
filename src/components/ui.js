import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function Button({ title, onPress, disabled, loading, variant = 'primary', style }) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.accentText : colors.text} />
      ) : (
        <Text style={[styles.buttonText, !isPrimary && { color: colors.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Stars({ value, size = 18, onChange }) {
  return (
    <View style={styles.stars} accessibilityLabel={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <Text style={{ fontSize: size, color: filled ? colors.star : colors.border }}>★</Text>
        );
        if (!onChange) return <View key={n}>{star}</View>;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${n} estrela${n > 1 ? 's' : ''}`}
            style={styles.starButton}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && <Button title="Tentar de novo" variant="secondary" onPress={onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  buttonText: { color: colors.accentText, fontSize: 16, fontWeight: '700' },
  stars: { flexDirection: 'row', alignItems: 'center' },
  starButton: { paddingHorizontal: 4 },
  errorBox: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2A1416',
    borderWidth: 1,
    borderColor: '#5B2128',
  },
  errorText: { color: colors.danger, fontSize: 15, lineHeight: 21 },
});
