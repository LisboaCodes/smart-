# Configuração da Câmera para Scanner de Código de Barras

## Requisitos para usar a câmera no navegador

A API de câmera do navegador (getUserMedia) requer um **contexto seguro** (HTTPS ou localhost).

### ✅ Funcionará em:
- `http://localhost:3001` (desenvolvimento local)
- `https://seudominio.com` (produção com SSL)

### ❌ NÃO funcionará em:
- `http://192.168.1.100:3001` (IP local sem SSL)
- `http://seudominio.com` (HTTP sem SSL)

## Soluções

### 1. Desenvolvimento Local (Localhost)

Acesse o sistema via `http://localhost:3001` - a câmera funcionará normalmente.

### 2. Testar em Rede Local (Celular/Tablet)

Para testar em dispositivos móveis na mesma rede, você precisa usar HTTPS:

#### Opção A: Usar ngrok (Mais Fácil)

1. Instale o ngrok: https://ngrok.com/download
2. Execute:
   ```bash
   ngrok http 3001
   ```
3. Use o URL HTTPS fornecido (ex: `https://abc123.ngrok.io`)

#### Opção B: Usar localtunnel

1. Instale:
   ```bash
   npm install -g localtunnel
   ```
2. Execute:
   ```bash
   lt --port 3001
   ```
3. Use o URL fornecido

#### Opção C: Certificado SSL Local (Avançado)

1. Instale o mkcert:
   ```bash
   npm install -g mkcert
   ```

2. Crie certificado local:
   ```bash
   mkcert create-ca
   mkcert create-cert
   ```

3. Configure o Next.js para usar HTTPS (requer configuração custom do servidor)

### 3. Produção

Em produção, use um certificado SSL válido:
- Vercel: SSL automático
- Netlify: SSL automático
- Servidor próprio: Use Let's Encrypt (gratuito)

## Como permitir câmera no Chrome Mobile

1. Acesse o site via HTTPS
2. Quando aparecer a solicitação de permissão, toque em **Permitir**
3. Se bloqueou acidentalmente:
   - Toque no ícone 🔒 ou ⓘ na barra de endereço
   - Toque em "Permissões"
   - Encontre "Câmera" e selecione "Permitir"
   - Recarregue a página

## Verificar se está em contexto seguro

No console do navegador, digite:
```javascript
console.log(window.isSecureContext)
```

Se retornar `true`, a câmera deve funcionar.

## Erros comuns

### "NotAllowedError: Permission denied"
- Solução: Permita o acesso à câmera nas configurações do site

### "NotReadableError: Could not start video source"
- Solução: Outra aplicação está usando a câmera. Feche-a.

### "NotFoundError: Requested device not found"
- Solução: Dispositivo não possui câmera ou não foi detectada

### "NotSecureError" ou câmera não solicita permissão
- Solução: Use HTTPS ou localhost (veja opções acima)
