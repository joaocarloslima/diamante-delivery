import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { formatPrice } from '../api';
import { Button, ErrorBox, Stars } from '../components/ui';
import { colors } from '../theme';

// Fluxo: escolher quantidade → pedido confirmado → avaliar o prato.
export default function OrderSheet({ api, dish, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    // reinicia o fluxo sempre que um prato novo é aberto
    setQuantity(1);
    setSending(false);
    setError(null);
    setOrder(null);
    setRating(0);
    setComment('');
    setReviewSending(false);
    setReviewError(null);
    setReviewed(false);
  }, [dish]);

  if (!dish) return null;

  const maxQuantity = Math.max(1, dish.stock);
  const close = () => onClose(!!order);

  async function placeOrder() {
    setSending(true);
    setError(null);
    try {
      setOrder(await api.createOrder(dish.id, quantity));
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  async function sendReview() {
    setReviewSending(true);
    setReviewError(null);
    try {
      await api.sendReview(dish.id, rating, comment.trim());
      setReviewed(true);
    } catch (e) {
      setReviewError(e.message);
    } finally {
      setReviewSending(false);
    }
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdropTouch} onPress={sending ? undefined : close} />
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.title}>{dish.name}</Text>
              <Pressable
                onPress={close}
                disabled={sending}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
              >
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            {!order && (
              <>
                {!!dish.description && <Text style={styles.muted}>{dish.description}</Text>}
                <View style={styles.row}>
                  <Text style={styles.label}>Quantidade</Text>
                  <View style={styles.stepper}>
                    <StepButton
                      label="−"
                      onPress={() => setQuantity((q) => q - 1)}
                      disabled={quantity <= 1 || sending}
                    />
                    <Text style={styles.quantity}>{quantity}</Text>
                    <StepButton
                      label="+"
                      onPress={() => setQuantity((q) => q + 1)}
                      disabled={quantity >= maxQuantity || sending}
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Total</Text>
                  <Text style={styles.total}>{formatPrice(dish.price * quantity)}</Text>
                </View>
                {error && <ErrorBox message={error} />}
                <Button
                  title={error ? 'Tentar de novo' : 'Fazer pedido'}
                  onPress={placeOrder}
                  loading={sending}
                />
                {sending && (
                  <Text style={styles.mutedCenter}>
                    Processando pagamento… pode levar alguns segundos.
                  </Text>
                )}
              </>
            )}

            {order && (
              <>
                <View style={styles.success}>
                  <Text style={styles.successTitle}>✓ Pedido #{order.id} confirmado</Text>
                  <Text style={styles.muted}>
                    {order.quantity} × {dish.name} · {formatPrice(order.totalPrice)}
                  </Text>
                  <Text style={styles.muted}>Status: {order.status}</Text>
                </View>

                {!reviewed ? (
                  <View style={styles.review}>
                    <Text style={styles.label}>Avalie o prato</Text>
                    <Stars value={rating} size={36} onChange={setRating} />
                    <TextInput
                      style={styles.input}
                      placeholder="Comentário (opcional)"
                      placeholderTextColor={colors.muted}
                      value={comment}
                      onChangeText={setComment}
                      maxLength={200}
                      multiline
                    />
                    {reviewError && <ErrorBox message={reviewError} />}
                    <Button
                      title={rating ? 'Enviar avaliação' : 'Escolha de 1 a 5 estrelas'}
                      onPress={sendReview}
                      disabled={!rating}
                      loading={reviewSending}
                    />
                    <Button title="Agora não" variant="secondary" onPress={close} />
                  </View>
                ) : (
                  <View style={styles.review}>
                    <Text style={styles.successTitle}>Obrigado pela avaliação!</Text>
                    <Text style={styles.muted}>
                      Ela aparece no Ranking em alguns segundos.
                    </Text>
                    <Button title="Voltar ao cardápio" onPress={close} />
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function StepButton({ label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'Aumentar quantidade' : 'Diminuir quantidade'}
      style={({ pressed }) => [styles.step, disabled && { opacity: 0.35 }, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.stepText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  backdropTouch: { flex: 1 },
  sheet: {
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: { padding: 20, paddingBottom: 36, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, color: colors.text, fontSize: 22, fontWeight: '800' },
  close: { color: colors.muted, fontSize: 22, padding: 4 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  mutedCenter: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.text, fontSize: 16, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  step: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: colors.text, fontSize: 22, fontWeight: '700' },
  quantity: { color: colors.text, fontSize: 20, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  total: { color: colors.text, fontSize: 20, fontWeight: '800' },
  success: {
    gap: 4,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#13261A',
    borderWidth: 1,
    borderColor: '#1F4D2E',
  },
  successTitle: { color: colors.success, fontSize: 17, fontWeight: '700' },
  review: { gap: 12 },
  input: {
    minHeight: 80,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 15,
    textAlignVertical: 'top',
  },
});
