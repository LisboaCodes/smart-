# Deploy Guide - Smart+ Acessórios

## Standalone Build (Docker/Production)

Este projeto usa `output: 'standalone'` para builds otimizados.

### Importante: Servir Arquivos de Upload

As imagens de produtos são servidas através de uma API route: `/api/uploads/[...path]`

Isso garante que as imagens funcionem corretamente em modo standalone, sem depender da pasta `public` ser copiada manualmente.

### Build e Deploy

```bash
# 1. Build da aplicação
npm run build

# 2. A pasta .next/standalone contém tudo necessário
# 3. As imagens são servidas via API, não precisa copiar public/uploads

# 4. Iniciar servidor
node .next/standalone/server.js
```

### Migração de URLs Antigas

Se você já tem imagens no banco com URLs antigas (`/uploads/...`), execute:

```bash
# Conectar ao PostgreSQL e executar:
psql $DATABASE_URL -f scripts/migrate-image-urls.sql
```

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=...
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### Docker

Se usar Docker, certifique-se de:
1. Copiar a pasta `public/uploads` para o volume persistente
2. Montar o volume em `/app/public/uploads`

```dockerfile
VOLUME ["/app/public/uploads"]
```

### Nginx (se aplicável)

Não é necessário configurar proxy para `/uploads/` - tudo é servido pela API Next.js.

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Troubleshooting

### Imagens dão 404

1. Verifique se a pasta `public/uploads/produtos` existe
2. Verifique permissões de leitura/escrita
3. Teste a API: `curl https://seu-dominio.com/api/uploads/produtos/test.webp`

### Upload falha

1. Verifique se Sharp está instalado: `npm list sharp`
2. Verifique permissões da pasta uploads
3. Verifique logs do servidor

## Performance

- API route tem cache headers: `max-age=31536000, immutable`
- Imagens são otimizadas para WebP durante upload
- Tamanho máximo: 5MB
- Dimensões máximas: 1200x1200px
