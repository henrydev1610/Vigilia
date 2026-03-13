# Vigilia Mobile (Expo SDK 54)

App React Native (Expo) consumindo API Docker em `:3333`.

## Configuracao da API (obrigatorio)

1. Crie o arquivo `.env` na raiz do app (ou copie de `.env.example`).
2. Defina exatamente:

```env
EXPO_PUBLIC_API_URL=http://192.168.18.24:3333
```

3. Use o IP local do seu PC na rede Wi-Fi/LAN.
4. No celular fisico, `localhost` e `127.0.0.1` nao funcionam para a API do PC.

## Como rodar

```bash
npm install
npx expo start -c --lan
```

- Backend Docker deve estar ativo em `:3333`.
- Celular e PC precisam estar na mesma rede.
- Teste no navegador do celular: `http://192.168.18.24:3333/health`.

## Fluxo de inicializacao

Antes do login, o app sempre faz:

1. Resolve base URL (`override DEV` -> `EXPO_PUBLIC_API_URL` -> `hostUriFallback` do Expo).
2. `GET /health`.
3. Se sucesso: entra no fluxo Auth/App.
4. Se falha: mostra tela de diagnostico da API.

## Tela de diagnostico da API

A tela "Sem conexao com a API" mostra:

- base URL detectada
- valor lido de `EXPO_PUBLIC_API_URL`
- fonte ativa (`env`, `override` ou `hostUriFallback`)
- erro real de request (`status`, `code`, `message`)

Acoes disponiveis:

- `Testar novamente`
- `Copiar exemplo de URL`
- `Abrir URL da API` (abre `${baseURL}/health`)
- `Override manual (somente DEV)` salvo em AsyncStorage

## Endpoints principais usados

- `GET /health`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /auth/me`

## Google Sign-In

Login com Google usa autenticacao no dispositivo e validacao do `idToken` no backend.

Variaveis de ambiente:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=seu-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=seu-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.seu-reversed-client-id
```

Notas de integracao:

- Android e iOS exigem client IDs proprios no Google Cloud Console
- em iOS, o plugin do Expo precisa do reversed client ID em `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`
- `@react-native-google-signin/google-signin` exige build nativo; Expo Go nao e suficiente para esse fluxo
- apos mudar configuracao nativa, gere novo build com `npx expo run:android` ou `npx expo run:ios`

## Teste rapido das telas novas (Home Deputados + Detalhes)

1. Entre no app com um usuario valido.
2. Abra a aba `Deputados` e valide:
   - card de resumo geral com total mensal
   - seletores de ano/mes
   - grafico de tendencia mensal (12 meses)
   - busca por nome (debounce)
   - filtro por partido (dinamico) e UF (todas as UFs)
   - favoritar/desfavoritar em cada item
3. Toque em um deputado e valide na tela de detalhes:
   - foto no topo + nome/partido/UF
   - cards de resumo
   - grafico mensal por ano
   - lista de despesas com tipo/fornecedor/data/valor
4. Toque em uma despesa para abrir o modal de detalhe do gasto:
   - botao esquerdo `Compartilhar`
   - botao direito `Ver PDF/Nota`
5. Acione `Sincronizar` nas duas telas e valide loading + mensagem de feedback.
6. Rode verificacao de tipos:

```bash
npm run typecheck
```
