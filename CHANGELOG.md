# Histórico de Alterações

## v1.0.7 - 2025-07-31

### Correções Críticas

- **Correção de Ambiente de Shell:** Resolvido um problema crítico que causava a interrupção de todos os comandos do terminal com `Exit Code 130 (SIGINT)`. A causa raiz foi identificada como uma configuração instável do `husky`, que foi reinstalado e reconfigurado.
- **Limpeza de Dependências:** Realizada uma limpeza completa do cache do `npm` e dos `node_modules` para garantir um ambiente de desenvolvimento consistente e livre de artefatos de compilação antigos.

### Melhorias de Qualidade de Código

- **Configuração do ESLint:** Ajustada a configuração do ESLint (`eslint.config.mjs`) para incluir o ambiente `node`, resolvendo dezenas de erros de `no-undef` relacionados a globais como `process` e `console`.
- **Correção de Código:**
  - Removida uma variável não utilizada (`output`) no script `test-mcp-tools.js`.
  - Corrigidos múltiplos erros de formatação (Prettier) em diversos arquivos, incluindo `.md`, `.json`, e `.js`.
- **Melhora dos Scripts NPM:**
  - O script `format` no `package.json` foi expandido para abranger todos os arquivos relevantes no projeto, não apenas o diretório `src`.
  - Adicionado um script `format:check` para validar a formatação sem aplicar alterações.

### Outras Mudanças

- **Correção de Conflito:** Resolvido um conflito de merge no arquivo `.taskmaster/tasks/tasks.json` que impedia a execução de scripts de formatação.
