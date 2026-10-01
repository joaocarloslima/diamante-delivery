import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme';

const SUGGESTIONS = [
  'Tem prato vegetariano?',
  'Qual é o prato mais barato?',
  'O que você recomenda hoje?',
];

export default function AssistantScreen({ api, keyboardOffset }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [waiting, setWaiting] = useState(false);
  const listRef = useRef(null);

  async function send(question) {
    const trimmed = question.trim();
    if (!trimmed || waiting) return;
    setText('');
    setMessages((m) => [...m, { id: Date.now(), from: 'user', text: trimmed }]);
    setWaiting(true);
    try {
      const { answer } = await api.ask(trimmed);
      setMessages((m) => [...m, { id: Date.now(), from: 'assistant', text: answer }]);
    } catch (e) {
      setMessages((m) => [...m, { id: Date.now(), from: 'error', text: e.message }]);
    } finally {
      setWaiting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardOffset}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Pergunte sobre o cardápio</Text>
            <Text style={styles.emptyText}>
              O assistente conhece os pratos, preços e estoque do restaurante.
            </Text>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => send(s)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.chipText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListFooterComponent={
          waiting && (
            <View style={[styles.bubble, styles.assistant, styles.typing]}>
              <ActivityIndicator size="small" color={colors.muted} />
              <Text style={styles.typingText}>Pensando…</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.from === 'user' && styles.user,
              item.from === 'assistant' && styles.assistant,
              item.from === 'error' && styles.error,
            ]}
          >
            <Text style={[styles.bubbleText, item.from === 'error' && { color: colors.danger }]}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Digite sua pergunta"
          placeholderTextColor={colors.muted}
          onSubmitEditing={() => send(text)}
          returnKeyType="send"
          editable={!waiting}
        />
        <Pressable
          onPress={() => send(text)}
          disabled={!text.trim() || waiting}
          accessibilityRole="button"
          accessibilityLabel="Enviar"
          style={({ pressed }) => [
            styles.send,
            (!text.trim() || waiting) && { opacity: 0.4 },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.sendText}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: 'center', lineHeight: 21 },
  suggestions: { gap: 8, marginTop: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.text, fontSize: 15 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 16 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  assistant: { alignSelf: 'flex-start', backgroundColor: colors.surfaceAlt, borderBottomLeftRadius: 4 },
  error: { alignSelf: 'flex-start', backgroundColor: '#2A1416', borderWidth: 1, borderColor: '#5B2128' },
  bubbleText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { color: colors.muted, fontSize: 15 },
  inputBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 23,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: colors.accentText, fontSize: 22, fontWeight: '800' },
});
