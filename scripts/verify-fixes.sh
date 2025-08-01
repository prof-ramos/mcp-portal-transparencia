#!/bin/bash

# Script de Verificação de Correções - MCP Portal da Transparência
# Execute este script quando o terminal estiver funcionando

echo "🔍 Verificando correções aplicadas..."
echo "=================================="

# 1. Verificar TypeScript
echo "1. Verificando TypeScript..."
if npx tsc --noEmit; then
    echo "✅ TypeScript: OK - Compila sem erros"
else
    echo "❌ TypeScript: ERRO - Há erros de compilação"
    exit 1
fi

# 2. Verificar ESLint
echo ""
echo "2. Verificando ESLint..."
if npm run lint; then
    echo "✅ ESLint: OK - Sem violações"
else
    echo "⚠️  ESLint: AVISOS - Há violações de estilo"
fi

# 3. Verificar Testes
echo ""
echo "3. Verificando Testes..."
if npm test; then
    echo "✅ Testes: OK - Todos passando"
else
    echo "❌ Testes: ERRO - Alguns testes falharam"
fi

# 4. Verificar MarkdownLint
echo ""
echo "4. Verificando MarkdownLint..."
if command -v markdownlint-cli2 &> /dev/null; then
    if npx markdownlint-cli2 "**/*.md" --fix; then
        echo "✅ MarkdownLint: OK - Sem problemas"
    else
        echo "⚠️  MarkdownLint: AVISOS - Há problemas de formatação"
    fi
else
    echo "ℹ️  MarkdownLint: Não instalado - Execute: npm install -g markdownlint-cli2"
fi

# 5. Verificar Source Maps
echo ""
echo "5. Verificando Source Maps..."
if grep -q '"sourceMap": true' tsconfig.json; then
    echo "✅ Source Maps: OK - Habilitados"
else
    echo "❌ Source Maps: ERRO - Não habilitados"
fi

# 6. Verificar Configuração de Inclusão
echo ""
echo "6. Verificando Configuração de Inclusão..."
if grep -q '"src/\*\*/\*.ts"' tsconfig.json; then
    echo "✅ Inclusão: OK - Todos arquivos .ts incluídos"
else
    echo "❌ Inclusão: ERRO - Configuração incorreta"
fi

echo ""
echo "=================================="
echo "🎉 Verificação concluída!"
echo ""
echo "📋 Próximos passos recomendados:"
echo "1. Se houver erros ESLint: npm run lint:fix"
echo "2. Se houver problemas Markdown: npx markdownlint-cli2 \"**/*.md\" --fix"
echo "3. Se houver falhas de teste: Verificar implementação"
echo "4. Criar tarefa no Taskmaster para implementar OAuth 2.0" 