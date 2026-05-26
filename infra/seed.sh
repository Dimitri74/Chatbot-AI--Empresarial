#!/bin/bash
# Script para indexar documentos em lote no Assistente Empresarial
# Uso: ./infra/seed.sh ./documents/

DOCS_DIR="${1:-./documents}"
API_URL="${API_URL:-http://localhost:8080}"

if [ ! -d "$DOCS_DIR" ]; then
  echo "Diretorio nao encontrado: $DOCS_DIR"
  exit 1
fi

echo "Indexando documentos de: $DOCS_DIR"
echo "API: $API_URL"
echo "---"

SUCCESS=0
FAILED=0

for file in "$DOCS_DIR"/*.{pdf,txt,md}; do
  [ -f "$file" ] || continue
  filename=$(basename "$file")

  echo -n "Enviando: $filename ... "

  response=$(curl -s -o /tmp/seed_response.json -w "%{http_code}" \
    -X POST "$API_URL/api/documents/upload" \
    -F "file=@$file")

  if [ "$response" = "200" ]; then
    chunks=$(cat /tmp/seed_response.json | grep -o '"chunks":[0-9]*' | grep -o '[0-9]*')
    echo "OK ($chunks chunks)"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "ERRO (HTTP $response)"
    FAILED=$((FAILED + 1))
  fi
done

echo "---"
echo "Concluido: $SUCCESS indexados, $FAILED com erro"