# 📦 Storage Setup - Cloudflare R2

Este projeto usa **Cloudflare R2** para armazenamento de arquivos (PDFs, imagens, etc.).

---

## 🔧 Configuração

### **1. Criar Bucket no Cloudflare R2**

1. Acesse https://dash.cloudflare.com
2. Vá em **R2** → **Create Bucket**
3. Nome sugerido: `dom-eara-materiais`
4. Location: **Automatic** (recomendado)

### **2. Criar API Token**

1. R2 → **Manage R2 API Tokens**
2. **Create API Token**
3. Configurações:
   - **Token Name:** `dom-production`
   - **Permissions:** Object Read & Write
   - **Apply to:** Specific buckets only → Selecione seu bucket
   - **TTL:** Leave blank (permanent)
4. **Copie as chaves** (aparecem apenas uma vez!):
   - Access Key ID
   - Secret Access Key

### **3. Configurar Variáveis de Ambiente**

Adicione no Railway (ou `.env` local):

```env
# Cloudflare R2 Storage
R2_ACCESS_KEY_ID=sua-access-key-aqui
R2_SECRET_ACCESS_KEY=sua-secret-key-aqui
R2_ACCOUNT_ID=seu-account-id
R2_BUCKET_NAME=dom-eara-materiais

# Opcional: URL pública do bucket (se configurou custom domain)
R2_PUBLIC_URL=https://files.seudominio.com
```

---

## 📋 Como Encontrar Cada Variável

| Variável | Onde Encontrar |
|----------|----------------|
| `R2_ACCESS_KEY_ID` | R2 → Manage R2 API Tokens → Create Token |
| `R2_SECRET_ACCESS_KEY` | R2 → Manage R2 API Tokens → Create Token |
| `R2_ACCOUNT_ID` | URL do dashboard: `dash.cloudflare.com/ACCOUNT_ID` |
| `R2_BUCKET_NAME` | R2 → Buckets (nome do bucket criado) |
| `R2_PUBLIC_URL` | R2 → Seu Bucket → Settings → Public URL (opcional) |

---

## 🚀 Uso no Código

O módulo de storage detecta automaticamente qual backend usar:

### **Upload de Arquivo**

```typescript
import { storagePut } from './server/storage';

// Upload de PDF
const pdfBuffer = await fs.readFile('material.pdf');
const { url } = await storagePut(
  'materiais/concurso-123/aula-01.pdf',
  pdfBuffer,
  'application/pdf'
);

// Upload de imagem
const imageBuffer = await fetch('https://example.com/image.jpg').then(r => r.arrayBuffer());
const { url: imageUrl } = await storagePut(
  'avatars/user-456.jpg',
  Buffer.from(imageBuffer),
  'image/jpeg'
);
```

### **Download de Arquivo**

```typescript
import { storageGet } from './server/storage';

// Gerar URL de download (válida por 1 hora)
const { url } = await storageGet('materiais/concurso-123/aula-01.pdf');

// URL personalizada (válida por 24 horas)
const { url: longUrl } = await storageGet('documents/report.pdf', 86400);
```

### **Verificar Backend Ativo**

```typescript
import { getStorageBackend } from './server/storage';

const backend = getStorageBackend();
console.log('Using storage:', backend); // 'r2' ou 'manus'
```

---

## 💡 Boas Práticas

### **1. Organização de Arquivos**

Use estrutura hierárquica clara:

```
materiais/
  ├── concurso-123/
  │   ├── aula-01.pdf
  │   ├── aula-02.pdf
  │   └── slides-01.pptx
  ├── concurso-456/
  │   └── apostila.pdf
avatars/
  ├── user-789.jpg
  └── user-012.png
uploads/
  └── temp/
      └── upload-abc123.tmp
```

### **2. Nomes de Arquivo**

- Use slugs (sem espaços, acentos, caracteres especiais)
- Adicione sufixo aleatório para evitar colisões
- Inclua extensão do arquivo

```typescript
// ❌ Ruim
await storagePut('Aula 01 - Português.pdf', buffer, 'application/pdf');

// ✅ Bom
const randomId = crypto.randomUUID().slice(0, 8);
await storagePut(`materiais/aula-01-portugues-${randomId}.pdf`, buffer, 'application/pdf');
```

### **3. Content-Type Correto**

Sempre especifique o MIME type correto:

```typescript
// PDFs
await storagePut(key, buffer, 'application/pdf');

// Imagens
await storagePut(key, buffer, 'image/jpeg');
await storagePut(key, buffer, 'image/png');

// Vídeos
await storagePut(key, buffer, 'video/mp4');

// Áudio
await storagePut(key, buffer, 'audio/mpeg');
```

### **4. Segurança**

- **Nunca** exponha as chaves de API no frontend
- Use URLs presigned para downloads temporários
- Valide tipos de arquivo antes do upload
- Implemente limite de tamanho de arquivo

```typescript
// Validação de tamanho (10MB max)
const MAX_SIZE = 10 * 1024 * 1024;
if (fileBuffer.length > MAX_SIZE) {
  throw new Error('Arquivo muito grande (máximo 10MB)');
}

// Validação de tipo
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
if (!allowedTypes.includes(contentType)) {
  throw new Error('Tipo de arquivo não permitido');
}
```

---

## 💰 Custos do Cloudflare R2

**Vantagens sobre AWS S3:**
- ✅ **Sem custo de egress** (downloads gratuitos!)
- ✅ Armazenamento: $0.015/GB/mês
- ✅ Operações Class A: $4.50/milhão
- ✅ Operações Class B: $0.36/milhão
- ✅ 10GB grátis por mês

**Estimativa para 1000 alunos:**
- 100GB de materiais: ~$1.50/mês
- 1 milhão de downloads: **$0** (sem custo de egress!)
- **Total: ~$2-3/mês**

Compare com S3: ~$10-15/mês (com custos de download)

---

## 🔄 Fallback para Desenvolvimento

Se as variáveis R2 não estiverem configuradas, o sistema usa automaticamente o **Manus Storage Proxy** (apenas para desenvolvimento local).

```bash
# Desenvolvimento local (sem R2)
npm run dev
# → Usa Manus Storage Proxy

# Produção (com R2)
R2_ACCESS_KEY_ID=xxx R2_SECRET_ACCESS_KEY=yyy npm start
# → Usa Cloudflare R2
```

---

## ❓ Troubleshooting

### **Erro: "Storage not configured"**

**Causa:** Nem R2 nem Manus Proxy estão configurados

**Solução:** Configure as variáveis R2 ou BUILT_IN_FORGE_API_*

### **Erro: "Access Denied"**

**Causa:** Credenciais R2 inválidas ou sem permissão

**Solução:** 
1. Verifique se as chaves estão corretas
2. Confirme que o token tem permissão "Object Read & Write"
3. Verifique se o bucket name está correto

### **Erro: "NoSuchBucket"**

**Causa:** Bucket não existe

**Solução:** Crie o bucket no Cloudflare R2 Dashboard

### **Upload lento**

**Causa:** Arquivos muito grandes ou conexão lenta

**Solução:**
1. Implemente upload em chunks para arquivos >10MB
2. Use compressão quando possível
3. Considere upload direto do frontend (presigned URLs)

---

## 📚 Referências

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [S3 API Compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
