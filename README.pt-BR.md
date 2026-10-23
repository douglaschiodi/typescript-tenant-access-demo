# Tenant Access Demo — guia em português

API TypeScript com duas empresas fictícias, permissões de escrita/leitura e testes HTTP de isolamento. As identidades públicas servem apenas para demonstração local; não são autenticação de produção.

## Executar

Node.js 24+ and npm. Node runs TypeScript directly; TypeScript and Node types are development dependencies.

```sh
npm ci
npm run typecheck
npm test
npm start
```

## O que observar

Envie o cabeçalho X-Demo-Identity com alice, bob ou reader. Alice e bob pertencem a empresas diferentes; reader só consulta a empresa north. O cabeçalho é público e falsificável: mantenha esta demonstração no localhost.

## Origem e limites

Projeto novo, criado com assistência de IA para este portfólio. Todos os dados são fictícios. Não contém código de clientes, configurações de produção, credenciais ou histórico dos sistemas existentes.

Os detalhes técnicos, contratos e limitações estão no [README principal](README.md) e em [ARCHITECTURE.md](ARCHITECTURE.md). É uma demonstração educacional; não deve ser apresentada como produto implantado em clientes. Licença MIT para o código original; dependências mantêm suas próprias licenças.
