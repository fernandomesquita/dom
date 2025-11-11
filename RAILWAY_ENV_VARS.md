# 🚂 Variáveis de Ambiente para Railway

Guia completo de configuração de variáveis de ambiente para deploy no Railway.

---

## ⚡ CONFIGURAÇÃO RÁPIDA (COPIE E COLE)

### **1. Variáveis OBRIGATÓRIAS**

```env
# Banco de Dados (Railway fornece automaticamente ao criar MySQL)
DATABASE_URL=mysql://user:password@host:port/database

# Segurança (USE AS CHAVES ABAIXO - JÁ GERADAS!)
JWT_SECRET=a7edfc25fe1afb9ccdcc58a9b27566e9793a9fa38a2c5da3a42abe19d650b254ebb860318f76813a957af7fdaee74a660e7e27d37bc875404e2259aaf6504e4f

PASSWORD_PEPPER=0ec0606e584611115dfd122b521474816fc394d58fb2daa25b0a2311425084c3

# Ambiente
NODE_ENV=production
```

### **2. Cloudflare R2 Storage (OBRIGATÓRIO)**

```env
R2_ACCESS_KEY_ID=sua-access-key-aqui
R2_SECRET_ACCESS_KEY=sua-secret-key-aqui
R2_ACCOUNT_ID=seu-account-id
R2_BUCKET_NAME=dom-eara-materiais
```

### **3. Variáveis RECOMENDADAS**

```env
BASE_URL=https://seu-app.up.railway.app
VITE_APP_TITLE=Sistema DOM - Plataforma de Mentoria para Concursos
```

---

## 📋 TOTAL: 9 VARIÁVEIS ESSENCIAIS

1. DATABASE_URL
2. JWT_SECRET
3. PASSWORD_PEPPER
4. NODE_ENV
5. R2_ACCESS_KEY_ID
6. R2_SECRET_ACCESS_KEY
7. R2_ACCOUNT_ID
8. R2_BUCKET_NAME
9. BASE_URL

---

## 🔐 CHAVES GERADAS (COPIE AGORA!)

**JWT_SECRET:**
```
a7edfc25fe1afb9ccdcc58a9b27566e9793a9fa38a2c5da3a42abe19d650b254ebb860318f76813a957af7fdaee74a660e7e27d37bc875404e2259aaf6504e4f
```

**PASSWORD_PEPPER:**
```
0ec0606e584611115dfd122b521474816fc394d58fb2daa25b0a2311425084c3
```

⚠️ **Guarde em local seguro!**

---

## 📚 Veja STORAGE_SETUP.md para detalhes do R2
