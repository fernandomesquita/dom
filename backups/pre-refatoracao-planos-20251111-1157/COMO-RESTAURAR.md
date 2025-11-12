# 🔄 COMO RESTAURAR ESTE BACKUP

## Se precisar voltar ao estado anterior:

### 1. RESTAURAR CÓDIGO:
```bash
cd ~/dom-eara-v4
git checkout backup-pre-refatoracao-planos-20251111-1158
git push origin main --force
```

### 2. RESTAURAR BANCO DE DADOS:

```bash
# CUIDADO: Isso SOBRESCREVE o banco atual!
mysql -h switchback.proxy.rlwy.net -P 35177 -u root -poAIWCVOZiFatjitkjlvVJVeZHdQQHAex railway < backup-railway-completo-20251111-115755.sql
```

### 3. VERIFICAR RESTAURAÇÃO:

```bash
# Ver se dados voltaram:
mysql -h switchback.proxy.rlwy.net -P 35177 -u root -poAIWCVOZiFatjitkjlvVJVeZHdQQHAex railway -e "SELECT COUNT(*) FROM metas_planos_estudo; SELECT COUNT(*) FROM plans;"
```

## Arquivos neste backup:

- backup-railway-completo-20251111-115755.sql = Banco completo (146K, 3089 linhas)
- backup-planos-tables-20251111-115821.sql = Só tabelas de planos (13K, 242 linhas)
- code-backup/ = Cópias de 18 arquivos de código
- INVENTARIO-BACKUP.txt = Lista do que foi salvo
