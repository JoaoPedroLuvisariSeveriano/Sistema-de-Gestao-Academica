# 📚 Guia Completo de Execução - Sistema de Gestão Acadêmica

Este guia fornece instruções passo a passo para executar o projeto completo (backend + frontend) e validar que tudo está funcionando corretamente.

---

## 📋 Pré-Requisitos

Antes de começar, certifique-se de ter instalado:

| Software | Versão Mínima | Verificação |
|----------|---------------|-------------|
| Node.js | 18.x ou superior | `node --version` |
| npm | 9.x ou superior | `npm --version` |
| PostgreSQL | 14.x ou superior | `psql --version` |

### Configuração do PostgreSQL

1. **Instalar PostgreSQL** (se ainda não tiver):
   - Windows: https://www.postgresql.org/download/windows/
   - Durante a instalação, defina:
     - Usuário: `postgres`
     - Senha: `postgres` (ou outra que preferir)

2. **Criar banco de dados** (opcional - o script cria automaticamente):
   ```sql
   CREATE DATABASE gestao_academica;
   ```

---

## 🛠️ Instalação das Dependências

### Passo 1: Clonar/Obter o projeto

Certifique-se de ter o projeto em sua máquina.

### Passo 2: Instalar dependências do projeto raiz

```bash
cd "c:/Users/jpkar/Documents/Fatec Matérias/2 Periodo/ES II/Aula 4/gestao-academica"
npm install
```

### Passo 3: Instalar dependências do backend

```bash
cd backend
npm install
```

### Passo 4: Instalar dependências do frontend

```bash
cd ../frontend
npm install
```

> **Nota**: Você também pode usar o comando único na raiz:
> ```bash
> npm run install:all
> ```

---

## ⚙️ Configuração do Ambiente

### Passo 1: Criar arquivo `.env` no backend

Crie um arquivo chamado `.env` na pasta `backend/` com o seguinte conteúdo:

```env
# Configuração do Servidor
PORT=3000
NODE_ENV=development

# Configuração do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=gestao_academica

# Chave JWT (pode alterar para uma chave mais segura)
JWT_SECRET=gestao-academica-secret-key-2024
```

### Passo 2: Variáveis de ambiente do frontend (opcional)

O frontend já está configurado para usar `http://localhost:3000/api` por padrão. Se precisar alterar:

Crie um arquivo `.env` na pasta `frontend/`:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

---

## 🗄️ Configuração do Banco de Dados

### Passo 1: Criar o banco de dados e sincronizar tabelas

Na pasta `backend`, execute:

```bash
cd backend
npm run db:create
```

Este comando:
- Conecta ao PostgreSQL
- Cria o banco de dados `gestao_academica` (se não existir)
- Cria todas as tabelas automaticamente

**Saída esperada:**
```
✅ Conectado ao PostgreSQL!
ℹ️  Banco de dados 'gestao_academica' já existe
🔄 Conectando ao banco de dados...
✅ Banco de dados conectado!
🔄 Sincronizando entidades...
✅ Tabelas criadas com sucesso!
📋 Tabelas no banco: user, student, teacher, course, discipline, enrollment, etc.
✅ Processo concluído!
```

### Passo 2: Popular o banco com dados iniciais (Seed)

Execute o seed para criar usuários e dados de exemplo:

```bash
cd backend
npm run seed
```

**Saída esperada:**
```
🔄 Conectando ao banco de dados...
✅ Banco de dados conectado!
✅ Usuário admin criado: admin@gestao.com / admin123
✅ Usuário secretária criado: secretaria@gestao.com / 123
✅ Usuário professor criado: professor@gestao.com / 123
✅ Curso criado: Ciência da Computação
✅ Disciplina criada: Introdução à Programação
✅ Professor criado: Maria Santos
✅ Aluno criado: João da Silva

📋 Verificando dados inseridos...
   Total de usuários: 3
   Total de alunos: 1
   Total de cursos: 1
✅ Seed concluído com sucesso!
```

---

## 🚀 Inicialização dos Serviços

### Passo 1: Iniciar o Backend

Em um terminal, na pasta `backend`:

```bash
cd backend
npm run dev
```

**Saída esperada:**
```
🔄 Conectando ao banco de dados...
✅ Banco de dados conectado com sucesso!
🚀 Servidor rodando na porta 3000
📚 API disponível em: http://localhost:3000/api
```

> **Nota**: Mantenha este terminal aberto. O servidor precisa estar rodando.

### Passo 2: Iniciar o Frontend

Em outro terminal, na pasta `frontend`:

```bash
cd frontend
npm start
```

O navegador deve abrir automaticamente em: **http://localhost:3001**

> **Nota**: O frontend usa a porta 3001 para evitar conflito com o backend na porta 3000.

---

## 🧪 Testes da API (Backend)

### Configuração do Postman/Insomnia

Importe a collection ou configure manualmente:

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`

---

### Teste 1: Login - Administrador

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@gestao.com",
  "password": "admin123"
}
```

**Response Esperado:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "admin@gestao.com",
    "role": "admin"
  }
}
```

> **Salve o token retornado!** Ele será usado nas próximas requisições.

---

### Teste 2: Login - Secretária

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "secretaria@gestao.com",
  "password": "123"
}
```

---

### Teste 3: Login - Professor

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "professor@gestao.com",
  "password": "123"
}
```

---

### Teste 4: Listar Alunos

**Endpoint:** `GET /api/students`

**Headers:**
```
Authorization: Bearer {SEU_TOKEN}
```

**Response Esperado:**
```json
{
  "data": [
    {
      "id": "...",
      "cpf": "12345678901",
      "name": "João da Silva",
      "email": "joao.silva@email.com",
      "registrationNumber": "20240001",
      "status": "active"
    }
  ]
}
```

---

### Teste 5: Listar Professores

**Endpoint:** `GET /api/teachers`

**Headers:**
```
Authorization: Bearer {SEU_TOKEN}
```

---

### Teste 6: Listar Cursos

**Endpoint:** `GET /api/courses`

**Headers:**
```
Authorization: Bearer {SEU_TOKEN}
```

---

### Teste 7: Listar Disciplinas

**Endpoint:** `GET /api/disciplines`

**Headers:**
```
Authorization: Bearer {SEU_TOKEN}
```

---

### Teste 8: Listar Matrículas

**Endpoint:** `GET /api/enrollments`

**Headers:**
```
Authorization: Bearer {SEU_TOKEN}
```

---

### Teste 9: Criar Novo Aluno

**Endpoint:** `POST /api/students/register`

**Headers:**
```
Authorization: Bearer {SEU_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "cpf": "98765432100",
  "name": "Maria Oliveira",
  "email": "maria.oliveira@email.com",
  "phone": "(11) 99999-8888",
  "address": "Av. Paulista, 1000",
  "password": "aluno123"
}
```

---

## 🌐 Testes do Frontend

### Acesso à Aplicação

1. Abra o navegador em: **http://localhost:3001**

### Login

1. Na página de login, use uma das credenciais:

| Usuário | Email | Senha |
|---------|-------|-------|
| Administrador | admin@gestao.com | admin123 |
| Secretária | secretaria@gestao.com | 123 |
| Professor | professor@gestao.com | 123 |

2. Clique em "Entrar"
3. Você será redirecionado para o Dashboard

### Navegação e Validação

Após fazer login, verifique:

- ✅ **Dashboard** - Página inicial carrega corretamente
- ✅ **Alunos** - Lista de alunos aparece (deve mostrar "João da Silva")
- ✅ **Professores** - Lista de professores aparece (deve mostrar "Maria Santos")
- ✅ **Cursos** - Lista de cursos aparece (deve mostrar "Ciência da Computação")
- ✅ **Disciplinas** - Lista de disciplinas aparece (deve mostrar "Introdução à Programação")
- ✅ **Matrículas** - Área de matrículas funcional

### Teste de Criação de Registro

1. Vá para a página de **Alunos**
2. Clique em "Novo Aluno" ou botão similar
3. Preencha os dados:
   - Nome: "Pedro Santos"
   - CPF: "11122233344"
   - Email: "pedro@email.com"
   - Telefone: "(11) 33333-4444"
4. Clique em "Salvar"
5. O novo aluno deve aparecer na lista

---

## 📝 Resumo de Comandos

```bash
# Instalação
npm run install:all

# Backend
cd backend
npm run db:create    # Criar banco e tabelas
npm run seed         # Popular dados
npm run dev          # Iniciar servidor (porta 3000)

# Frontend
cd frontend
npm start            # Iniciar app (porta 3001)
```

---

## 🔧 Solução de Problemas

### "Porta já está em uso"

- Backend: Altere a porta no arquivo `.env` ou finalize o processo
- Frontend: O React automaticamente usará a porta 3001 ou próxima disponível

### "Conexão negada ao banco de dados"

1. Verifique se o PostgreSQL está rodando
2. Verifique as credenciais no `.env`
3. Confirme que o banco `gestao_academica` foi criado

### "Erro de CORS"

O backend já está configurado com CORS habilitado. Se persistir, verifique se o frontend está enviando requisições para a porta correta.

### "Token expirado"

Faça login novamente para obter um novo token.

---

## ✅ Checklist Final

Antes de finalizar, confirme:

- [ ] PostgreSQL instalado e rodando
- [ ] Dependências instaladas
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados criado (`npm run db:create`)
- [ ] Dados populados (`npm run seed`)
- [ ] Backend rodando na porta 3000
- [ ] Frontend rodando na porta 3001
- [ ] Login funcionando (3 usuários testados)
- [ ] Listagens funcionando (alunos, cursos, disciplinas, professores)
- [ ] Criação de registro funcionando
- [ ] Integração frontend/backend validada

---

**Projeto: Sistema de Gestão Acadêmica**  
**Versão: 1.0.0**

