# 🎓 Sistema de Gestão Acadêmica

Um sistema completo (Full-Stack) para gestão de alunos, professores, cursos, disciplinas e matrículas. O projeto foi desenvolvido com uma arquitetura separada em Backend (API REST) e Frontend (Aplicação Web).

## 🚀 Tecnologias Utilizadas

### Backend
* **Node.js**
* **Express** (Provavelmente, baseado no ecossistema)
* **PostgreSQL** (Banco de dados relacional)
* **JWT** (Autenticação e Autorização)
* **TypeORM / Sequelize** (ORM para persistência de dados)

### Frontend
* **React** (Biblioteca para interface de usuário)
* Integração com API via requisições HTTP

## ✨ Funcionalidades Principais

* **Autenticação e Autorização**: Sistema de login com diferentes níveis de acesso (Administrador, Secretária, Professor, Aluno).
* **Gestão de Alunos**: Cadastro, listagem e edição de dados de alunos.
* **Gestão de Professores**: Controle de corpo docente.
* **Cursos e Disciplinas**: Estruturação acadêmica, criação de cursos e vínculo de disciplinas.
* **Matrículas**: Sistema para matricular alunos em disciplinas/cursos.

## 📁 Estrutura do Projeto

O projeto adota uma estrutura de *monorepo* simplificada:

```
gestao-academica/
├── backend/            # API REST, modelos de dados, rotas e lógica de negócios
├── frontend/           # Aplicação web em React
├── package.json        # Gerenciamento de dependências raiz e scripts
└── GUIA_EXECUCAO.md    # Documentação detalhada de execução
```

## ⚙️ Como Executar o Projeto

Para obter instruções detalhadas, passo a passo, sobre como configurar o ambiente, o banco de dados e rodar tanto o Backend quanto o Frontend, por favor consulte o nosso guia completo:

👉 **[Ler o Guia de Execução Completo (GUIA_EXECUCAO.md)](./GUIA_EXECUCAO.md)**

### Resumo Rápido

1. Clone o repositório e instale todas as dependências:
   ```bash
   npm run install:all
   ```

2. Configure o arquivo `.env` dentro da pasta `backend/` com as suas credenciais do PostgreSQL.

3. Crie o banco e popule com os dados iniciais:
   ```bash
   cd backend
   npm run db:create
   npm run seed
   ```

4. Inicie o servidor (Backend) em um terminal:
   ```bash
   npm run dev
   ```

5. Inicie a aplicação web (Frontend) em outro terminal:
   ```bash
   cd frontend
   npm start
   ```

## 🤝 Contribuição

Sinta-se à vontade para realizar um *fork* do projeto e abrir *Pull Requests* com melhorias e correções.

## 📝 Licença

Este projeto está sob a licença ISC.
