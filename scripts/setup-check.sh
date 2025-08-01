#!/usr/bin/env bash
set -euo pipefail

# setup-check.sh
# Verifica pré-requisitos para executar o MCP Server:
# - Node.js >= 18
# - npm disponível
# - Dependências instaladas
# - Variável de ambiente PORTAL_API_KEY presente
# Saída humana por padrão e opcionalmente JSON para CI (--json)

COLOR_RED="\033[0;31m"
COLOR_GREEN="\033[0;32m"
COLOR_YELLOW="\033[0;33m"
COLOR_RESET="\033[0m"

want_json="false"
for arg in "$@"; do
  if [[ "$arg" == "--json" ]]; then
    want_json="true"
  fi
done

ok()  { [[ "$want_json" == "true" ]] || echo -e "${COLOR_GREEN}✔${COLOR_RESET} $1"; }
warn(){ [[ "$want_json" == "true" ]] || echo -e "${COLOR_YELLOW}⚠${COLOR_RESET} $1"; }
err() { [[ "$want_json" == "true" ]] || echo -e "${COLOR_RED}✖${COLOR_RESET} $1"; }

json_escape() {
  python3 - <<'PY' 2>/dev/null || node -e "console.log(JSON.stringify(process.argv[1] || ''))" -- "$1"
import json,sys
print(json.dumps(sys.argv[1] if len(sys.argv)>1 else ""))
PY
}

has_cmd() { command -v "$1" >/dev/null 2>&1; }

json_out='{"checks": []}'
append_check_json() {
  local name="$1" status="$2" message="$3"
  local esc_name esc_msg
  esc_name=$(json_escape "$name")
  esc_msg=$(json_escape "$message")
  json_out=$(python3 - "$json_out" "$esc_name" "$status" "$esc_msg" 2>/dev/null || node -e '
    const data = JSON.parse(process.argv[1]);
    const name = process.argv[2];
    const status = process.argv[3];
    const message = process.argv[4];
    data.checks.push({ name, status, message });
    console.log(JSON.stringify(data));
  ' -- "$json_out" "$esc_name" "$status" "$esc_msg") || true
}

overall_status="passed"

# 1) Node.js
if has_cmd node; then
  NODE_VER_RAW=$(node -v 2>/dev/null || echo "v0.0.0")
  NODE_MAJOR=$(echo "$NODE_VER_RAW" | sed -E 's/^v([0-9]+).*/\1/')
  if [[ "$NODE_MAJOR" =~ ^[0-9]+$ ]] && [ "$NODE_MAJOR" -ge 18 ]; then
    ok "Node.js encontrado: $NODE_VER_RAW (>= 18)"
    append_check_json "node" "passed" "Found $NODE_VER_RAW"
  else
    err "Node.js encontrado: $NODE_VER_RAW (requer >= 18)"
    append_check_json "node" "failed" "Found $NODE_VER_RAW, requires >= v18"
    overall_status="failed"
  fi
else
  err "Node.js não encontrado no PATH"
  append_check_json "node" "failed" "Node not found in PATH"
  overall_status="failed"
fi

# 2) npm
if has_cmd npm; then
  NPM_VER=$(npm -v 2>/dev/null || echo "unknown")
  ok "npm encontrado: $NPM_VER"
  append_check_json "npm" "passed" "Found npm $NPM_VER"
else
  err "npm não encontrado no PATH"
  append_check_json "npm" "failed" "npm not found in PATH"
  overall_status="failed"
fi

# 3) Dependências instaladas (node_modules)
if [ -d "node_modules" ]; then
  ok "Dependências instaladas (node_modules presente)"
  append_check_json "dependencies" "passed" "node_modules directory exists"
else
  warn "node_modules ausente. Executando 'npm ci'..."
  append_check_json "dependencies" "warning" "node_modules missing; will run npm ci"
  if has_cmd npm; then
    if npm ci >/dev/null 2>&1; then
      ok "npm ci executado com sucesso"
      append_check_json "npm-ci" "passed" "npm ci succeeded"
    else
      err "Falha ao executar 'npm ci'"
      append_check_json "npm-ci" "failed" "npm ci failed"
      overall_status="failed"
    fi
  else
    err "npm indisponível para instalar dependências"
    append_check_json "npm-ci" "failed" "npm unavailable to install deps"
    overall_status="failed"
  fi
fi

# 4) Variável de ambiente PORTAL_API_KEY
if [[ -n "${PORTAL_API_KEY:-}" ]]; then
  ok "PORTAL_API_KEY configurada"
  append_check_json "env.PORTAL_API_KEY" "passed" "Environment variable is set"
else
  err "PORTAL_API_KEY não configurada"
  append_check_json "env.PORTAL_API_KEY" "failed" "Environment variable not set"
  overall_status="failed"
fi

# 5) Execução básica do bin via npx (verificação rápida opcional)
if has_cmd npx; then
  if npx --yes mcp-portal-transparencia-brasil --help >/dev/null 2>&1; then
    ok "npx mcp-portal-transparencia-brasil responde a --help"
    append_check_json "npx-binary" "passed" "npx binary responds to --help"
  else
    warn "npx mcp-portal-transparencia-brasil não respondeu a --help (pode ser normal em stdio); verifique execução manual"
    append_check_json "npx-binary" "warning" "npx binary did not respond to --help"
  fi
else
  warn "npx não encontrado; Raycast pode falhar ao iniciar o bin via npx"
  append_check_json "npx" "warning" "npx not found"
fi

# Resultado final
if [[ "$want_json" == "true" ]]; then
  # Anexar overallStatus
  json_out=$(node -e '
    const data = JSON.parse(process.argv[1]);
    data.overallStatus = process.argv[2];
    console.log(JSON.stringify(data));
  ' -- "$json_out" "$overall_status")
  echo "$json_out"
else
  if [[ "$overall_status" == "passed" ]]; then
    echo -e "${COLOR_GREEN}Todos os pré-requisitos foram validados com sucesso.${COLOR_RESET}"
  else
    echo -e "${COLOR_RED}Falhas encontradas nos pré-requisitos. Consulte as mensagens acima.${COLOR_RESET}"
    exit 1
  fi
fi
