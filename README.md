# Delivery App — Projeto Diamante 02

App em React Native (Expo) para testar o back-end do Projeto Diamante 02 de Java Advanced.
Ele consome exatamente o contrato do enunciado: se o app funciona, a API está no formato certo.

## O que dá para testar

| Tela | O que acontece | Endpoint |
|------|----------------|----------|
| Cardápio | Lista os pratos com preço e estoque | `GET /dishes` (:8080) |
| Pedido | Escolhe a quantidade e faz o pedido | `POST /orders` (:8080) |
| Avaliação | Depois do pedido confirmado, avalia o prato de 1 a 5 | `POST /reviews` (:8080) |
| Ranking | Mostra os pratos pela média, atualizando a cada 5 s | `GET /reviews/ranking` (:8083) |
| Assistente | Chat com o assistente do restaurante | `POST /assistant` (:8080) |

Os erros aparecem na tela com o status HTTP e a mensagem do campo `error`
(por exemplo, `409 · Prato esgotado` ou `502 · Pagamento indisponível`).

## Como rodar

Pré-requisitos: Node.js 20 ou superior e o app **Expo Go** no celular.

```bash
npm install
npx expo start
```

Escaneie o QR code com o Expo Go (Android) ou com a câmera (iOS).
Também funciona no emulador Android (`a`), no simulador iOS (`i`) ou no navegador (`w`).

## Configurando o servidor

Toque no botão do servidor, no canto superior direito, e informe o endereço do computador onde
os serviços estão rodando. O app usa a porta 8080 para o `order-service` e a 8083 para o
`review-service`.

| Onde o app está rodando | Endereço |
|-------------------------|----------|
| Celular físico (Expo Go) | IP do computador na rede, ex.: `192.168.0.10` |
| Emulador Android | `10.0.2.2` (padrão) |
| Simulador iOS ou navegador | `localhost` (padrão) |

O botão **Testar conexão** verifica os dois serviços.

Dicas:

- O celular e o computador precisam estar na mesma rede Wi-Fi.
- No navegador (`w`), o back-end precisa liberar CORS nas portas 8080 e 8083.
  No celular e nos emuladores isso não é necessário.

## Estrutura

```
App.js                     abas e configuração do servidor
src/api.js                 chamadas HTTP e tratamento de erros
src/screens/MenuScreen.js  cardápio
src/screens/OrderSheet.js  pedido e avaliação
src/screens/RankingScreen.js
src/screens/AssistantScreen.js
src/screens/SettingsModal.js
```
