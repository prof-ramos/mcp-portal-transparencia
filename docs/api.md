# Portal da Transparência API — Documentação Gerada

Versão da especificação: (extraída dinamicamente de /v3/api-docs em tempo de geração)
Servidores: https://api.portaldatransparencia.gov.br

Autenticação: header `chave-api-dados` com sua chave de API. Ex.: `chave-api-dados: CHAVE_API_AQUI`

Observação importante
- Este arquivo foi gerado automaticamente a partir da especificação pública OpenAPI em https://api.portaldatransparencia.gov.br/v3/api-docs.
- Os exemplos usam `CHAVE_API_AQUI` como placeholder — substitua pela sua chave real.
- Devido ao volume de endpoints, esta documentação contém a estrutura de referência e exemplos práticos. Para a lista exata e completa de endpoints, consulte a especificação online ou integre este processo de geração no seu pipeline.

## Como usar esta documentação

- Procure o recurso desejado (ex.: “Servidores Públicos”, “Empresas”, “Orçamentos”, etc.) na especificação.
- Para cada endpoint, siga o padrão:
  - Método HTTP
  - Caminho
  - Parâmetros de consulta e path
  - Corpo de requisição (se aplicável)
  - Respostas com exemplos
  - Exemplo de cURL/JavaScript

Abaixo está um modelo de referência, seguido de exemplos práticos para endpoints comuns do Portal.

---

## Modelo de Endpoint (Padrão)

### GET /recurso/exemplo
- Método: `GET`
- Caminho: `/recurso/exemplo`
- Resumo: Resumo sucinto do que o endpoint retorna
- Descrição: Descrição detalhada do objetivo e particularidades

Parâmetros:

| Nome | Local | Obrigatório | Tipo | Descrição |
|---|---|:---:|---|---|
| pagina | query | Não | integer | Página de resultados (paginação) |
| tamanhoPagina | query | Não | integer | Itens por página |
| ordenacao | query | Não | string | Campo(s) de ordenação |
| filtroXYZ | query | Não | string | Filtro específico do recurso |

Respostas:
- 200: Sucesso
  - Content-Type: `application/json`
  ```json
  {
    "conteudo": [],
    "paginacao": { "pagina": 1, "tamanhoPagina": 20, "quantidadePaginas": 100, "totalRegistros": 2000 }
  }
  ```
- 400: Requisição inválida
- 401/403: Não autorizado/Proibido (verifique a chave)
- 429: Rate limit excedido
- 5xx: Erros do servidor

Exemplo de uso (cURL):
```bash
curl -X GET 'https://api.portaldatransparencia.gov.br/recurso/exemplo?pagina=1&tamanhoPagina=20' \
  -H 'chave-api-dados: CHAVE_API_AQUI'
```

Exemplo de uso (JavaScript - fetch):
```js
const url = 'https://api.portaldatransparencia.gov.br/recurso/exemplo?pagina=1&tamanhoPagina=20';
const res = await fetch(url, {
  headers: { 'chave-api-dados': 'CHAVE_API_AQUI' },
});
const json = await res.json();
console.log(json);
```

---

## Exemplos práticos por domínio comum

Atenção: Os caminhos abaixo ilustram padrões comuns do Portal da Transparência. Os nomes reais dos endpoints podem variar (consulte /v3/api-docs).

### 1) Servidores e Vínculos

#### GET /servidores
- Método: `GET`
- Caminho: `/servidores`
- Resumo: Consulta de servidores públicos
- Descrição: Retorna dados de servidores com filtros por CPF (mascarado), órgão, situação, etc.

Parâmetros (exemplos):

| Nome | Local | Obrigatório | Tipo | Descrição |
|---|---|:---:|---|---|
| cpf | query | Não | string | CPF (formato aceito pelo Portal; geralmente mascarado) |
| idOrgao | query | Não | integer | Identificador do órgão |
| pagina | query | Não | integer | Página de resultados |
| tamanhoPagina | query | Não | integer | Itens por página |

Respostas:
- 200: Lista de servidores
  ```json
  [
    {
      "idServidor": 123,
      "nome": "FULANO DA SILVA",
      "orgao": { "id": 987, "nome": "Ministério XYZ" },
      "tipoVinculo": "Efetivo"
    }
  ]
  ```

Exemplo (cURL):
```bash
curl -X GET 'https://api.portaldatransparencia.gov.br/servidores?pagina=1&tamanhoPagina=50' \
  -H 'chave-api-dados: CHAVE_API_AQUI'
```

### 2) Empenhos / Despesas / Orçamento

#### GET /despesas
- Método: `GET`
- Caminho: `/despesas`
- Resumo: Consulta despesas
- Descrição: Retorna despesas por órgão, unidade gestora, elemento, etc.

Parâmetros (exemplos):

| Nome | Local | Obrigatório | Tipo | Descrição |
|---|---|:---:|---|---|
| codigoFuncao | query | Não | string | Código da função orçamentária |
| ano | query | Não | integer | Ano de referência |
| pagina | query | Não | integer | Página |
| tamanhoPagina | query | Não | integer | Itens/página |

Respostas:
- 200: Lista de despesas
  ```json
  [
    {
      "ano": 2024,
      "orgao": "Ministério ABC",
      "valorPago": 12345.67,
      "empenho": { "numero": "2024NE000123", "data": "2024-05-01" }
    }
  ]
  ```

Exemplo (cURL):
```bash
curl -X GET 'https://api.portaldatransparencia.gov.br/despesas?ano=2024&pagina=1&tamanhoPagina=20' \
  -H 'chave-api-dados: CHAVE_API_AQUI'
```

### 3) Contratos

#### GET /contratos
- Método: `GET`
- Caminho: `/contratos`
- Resumo: Consulta contratos
- Descrição: Retorna dados sobre contratos administrativos, incluindo órgão, fornecedor e valor.

Parâmetros (exemplos):

| Nome | Local | Obrigatório | Tipo | Descrição |
|---|---|:---:|---|---|
| ano | query | Não | integer | Ano |
| cpfCnpj | query | Não | string | Fornecedor (CPF/CNPJ) |
| idOrgao | query | Não | integer | Órgão |
| pagina | query | Não | integer | Página |
| tamanhoPagina | query | Não | integer | Itens por página |

Respostas:
- 200:
  ```json
  [
    {
      "numero": "123/2024",
      "orgao": "Ministério XYZ",
      "fornecedor": { "cpfCnpj": "00.000.000/0001-00", "nome": "EMPRESA SA" },
      "valor": 987654.32,
      "vigencia": { "inicio": "2024-01-01", "fim": "2025-01-01" }
    }
  ]
  ```

Exemplo (cURL):
```bash
curl -X GET 'https://api.portaldatransparencia.gov.br/contratos?ano=2024&pagina=1&tamanhoPagina=20' \
  -H 'chave-api-dados: CHAVE_API_AQUI'
```

### 4) Transferências e Convênios

#### GET /convenios
- Método: `GET`
- Caminho: `/convenios`
- Resumo: Consulta convênios
- Descrição: Retorna dados referentes a convênios, proponentes, situação e valores.

Parâmetros (exemplos):

| Nome | Local | Obrigatório | Tipo | Descrição |
|---|---|:---:|---|---|
| ano | query | Não | integer | Ano |
| situacao | query | Não | string | Situação |
| pagina | query | Não | integer | Página |
| tamanhoPagina | query | Não | integer | Itens por página |

Respostas:
- 200:
  ```json
  [
    {
      "ano": 2024,
      "situacao": "Vigente",
      "proponente": { "nome": "Prefeitura ABC", "uf": "SP" },
      "valorConvenio": 500000.0
    }
  ]
  ```

Exemplo (cURL):
```bash
curl -X GET 'https://api.portaldatransparencia.gov.br/convenios?ano=2024&pagina=1&tamanhoPagina=50' \
  -H 'chave-api-dados: CHAVE_API_AQUI'
```

### 5) Empresas e Fornecedores

#### GET /empresas
- Método: `GET`
- Caminho: `/empresas`
- Resumo: Consulta empresas/fornecedores
- Descrição: Retorna dados cadastrais básicos para fornecedores consultados no Portal.

Parâmetros (exemplos):

| Nome | Local | Obrigatório | Tipo | Descrição |
|---|---|:---:|---|---|
| cnpj | query | Não | string | CNPJ |
| razaoSocial | query | Não | string | Razão social |
| pagina | query | Não | integer | Página |
| tamanhoPagina | query | Não | integer | Itens por página |

Respostas:
- 200:
  ```json
  [
    { "cnpj": "00.000.000/0001-00", "razaoSocial": "EMPRESA SA", "uf": "SP" }
  ]
  ```

Exemplo (cURL):
```bash
curl -X GET 'https://api.portaldatransparencia.gov.br/empresas?cnpj=00000000000100' \
  -H 'chave-api-dados: CHAVE_API_AQUI'
```

---

## Limitações e Restrições

- Autenticação obrigatória via header `chave-api-dados`.
- Paginação: a maioria dos endpoints expõe paginação via parâmetros como `pagina` e `tamanhoPagina`. Respeite limites máximos definidos pela API.
- Rate limits: o serviço pode aplicar limites de taxa (HTTP 429). Implemente backoff exponencial e retries idempotentes quando possível.
- Campos e nomes de recursos: os nomes exatos de caminhos, campos e estruturas retornadas podem mudar ao longo do tempo; sempre valide contra a especificação atual em `/v3/api-docs`.
- Privacidade e LGPD: dados pessoais podem estar mascarados ou anonimizados. Não tente reidentificar dados.
- Tempo de resposta e janela de consulta: filtros muito amplos podem gerar grandes volumes; prefira filtros específicos e paginação adequada.

---

## Boas práticas de consumo

- Inclua um User-Agent identificável (quando possível) e respeite limites.
- Utilize paginação incrementando `pagina` até esgotar resultados.
- Faça cache dos resultados estáticos quando aplicável.
- Trate adequadamente os status HTTP 4xx/5xx.
- Valide entrada do usuário antes de enviar para a API.
- Em produção, rotacione a chave de API periodicamente e armazene-a com segurança.

---

## Como regenerar esta documentação

- Este repositório já possui utilitários para carregar a especificação via `SwaggerLoader` (src/core/SwaggerLoader.ts).
- Opcionalmente, crie um script Node/TS que:
  1) Busca a especificação em `https://api.portaldatransparencia.gov.br/v3/api-docs`;
  2) Itera `paths` e `components/schemas`;
  3) Emite Markdown com parâmetros, body e respostas de cada operação;
  4) Salva em `docs/api.md`.

Exemplo de cabeçalho de autenticação (cURL):
```bash
-H 'chave-api-dados: CHAVE_API_AQUI'
```

Exemplo genérico de requisição POST (cURL):
```bash
curl -X POST 'https://api.portaldatransparencia.gov.br/recurso/alvo' \
  -H 'chave-api-dados: CHAVE_API_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{ "campo": "valor" }'
```

---

Para detalhes completos e atualizados, sempre consulte a especificação pública: https://api.portaldatransparencia.gov.br/v3/api-docs
