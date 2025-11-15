# Gerenciador de Notas Fiscais

Este é um aplicativo full-stack completo para gerenciamento de notas fiscais pessoais. Ele permite que os usuários se cadastrem, façam login, e realizem operações de CRUD (Criar, Ler, Atualizar, Deletar) em suas notas fiscais, com a opção de anexar fotos de comprovantes.

O projeto inclui um painel de administração robusto onde administradores podem gerenciar usuários, redefinir senhas e bloquear/desbloquear contas.

A autenticação é centralizada usando Firebase Authentication, e os dados do aplicativo (perfis de usuário, informações das notas) são armazenados em um banco de dados SQLite gerenciado pelo Prisma. O backend também lida com o armazenamento de arquivos de imagem (fotos de perfil e notas) no servidor.

---

## 📋 Índice

- [✨ Funcionalidades](#-funcionalidades)
  - [Usuário Comum](#usuário-comum)
  - [Administrador](#administrador)
- [💻 Tecnologias Utilizadas](#-tecnologias-utilizadas)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🚀 Como Executar](#-como-executar)
  - [Pré-requisitos](#pré-requisitos)
  - [Configuração do Backend](#configuração-do-backend)
  - [Configuração do Frontend](#configuração-do-frontend)
  - [Criando um Administrador](#criando-um-administrador)
- [🔑 Endpoints da API](#-endpoints-da-api)

---

## ✨ Funcionalidades

O sistema é dividido em dois níveis de acesso: **Usuário Comum** e **Administrador**.

### Usuário Comum

#### Autenticação:

- Cadastro de nova conta (Nome, Email, Senha, Telefone).
- Login com e-mail e senha.
- Fluxo de "Esqueci minha senha" com redefinição por e-mail (via Firebase).

#### Dashboard (Notas Fiscais):

- Visualização em lista de todas as notas fiscais cadastradas pelo usuário.
- Exibição de estatísticas: Total de notas, Valor total gasto e Valor gasto no mês atual.
- Atualização da lista com "Puxar para atualizar" (Pull-to-refresh).

#### Gerenciamento de Notas Fiscais (CRUD):

**Adicionar Nota:**

- Opção de adicionar tirando uma foto com a câmera.
- Opção de adicionar escolhendo uma foto da galeria.
- Opção de preencher manualmente sem foto.
- Formulário com validação para: Chave de Acesso (44 dígitos), Número da NF, Emitente, Data de Emissão e Valor Total.

**Visualizar Nota:** Modal com todos os detalhes da nota fiscal selecionada.

**Editar Nota:** Permite a atualização de todos os campos da nota, incluindo a substituição da foto.

**Deletar Nota:** Remove a nota fiscal do banco de dados e exclui o arquivo de imagem associado do servidor.

#### Gerenciamento de Perfil:

- Visualização dos dados do perfil (Foto, Nome, Email, Telefone).
- Atualização do número de telefone.
- Upload/Alteração da foto de perfil (usando câmera ou galeria).
- Logout do aplicativo.

### Administrador

Administradores possuem todas as funcionalidades de um usuário comum, além de:

#### Painel de Administração:

- Visualização de estatísticas: Total de usuários, Total de administradores e Total de usuários bloqueados.
- Lista de todos os usuários cadastrados no sistema.
- Campo de busca para filtrar usuários por nome ou e-mail.

#### Gerenciamento de Usuários:

- **Bloquear/Desbloquear Usuário:** Um usuário bloqueado não pode mais fazer login. A ação é sincronizada com o Firebase (define `disabled: true`) e com o banco de dados local (`isBlocked: true`).
- **Alterar Senha:** O administrador pode definir uma nova senha para qualquer usuário diretamente pelo painel.

#### Gerenciamento de Perfil:

- Diferente de usuários comuns, um Administrador pode alterar o seu próprio "Nome Completo" (`fullName`) através da tela de "Editar Perfil".

---

## 💻 Tecnologias Utilizadas

Este projeto é um monorepo (ou estrutura similar) dividido em frontend e backend.

### Backend

- **Core:** Node.js, Express, TypeScript
- **Banco de Dados:** Prisma (ORM) com SQLite como driver.
- **Autenticação:** Firebase Admin SDK para criação de usuários e gerenciamento (troca de senha, bloqueio).
- **Validação de Rota:** Middlewares customizados para verificar autenticação (`authMiddleware`) e permissões de administrador (`adminMiddleware`).
- **File Uploads:** `multer` para processar `multipart/form-data`, usado para upload de fotos de perfil e de notas fiscais.
- **Servir Arquivos:** `express.static` é usado para servir as imagens da pasta `uploads` publicamente.

### Frontend

- **Core:** React 19, React Native, Expo (SDK 53).
- **Roteamento:** Expo Router (roteamento baseado em arquivos).
- **Autenticação:** Firebase Client SDK (v12) para login, registro e recuperação de senha.
- **Gerenciamento de Estado (Auth):** React Context (`AuthContext`) para prover o status do usuário e perfil para toda a aplicação.
- **Comunicação API:** `axios` com interceptors configurados para logging de requisições.
- **Módulos Nativos:**
  - `expo-image-picker`: Para acessar a câmera e a galeria de fotos.
  - `expo-splash-screen`: Para manter a tela de splash visível enquanto a autenticação é verificada.
  - `expo-constants`: Para acessar variáveis de ambiente do `app.json`.
- **UI & Ícones:** `@expo/vector-icons`.
- **Persistência (Auth):**
  - **Web:** `browserLocalPersistence`.
  - **Mobile:** `getReactNativePersistence(AsyncStorage)`.

---

## 📁 Estrutura do Projeto

A estrutura de arquivos principal do projeto é organizada da seguinte forma:

```
/
├── backend/
│   ├── uploads/                  # (Criado dinamicamente) Armazena fotos
│   │   ├── profiles/
│   │   └── temp/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── adminController.ts      # Lógica para rotas de admin
│   │   │   ├── authController.ts       # Lógica para registro e perfil
│   │   │   └── notaFiscalController.ts # Lógica para CRUD de notas
│   │   ├── middlewares/
│   │   │   ├── adminMiddleware.ts      # Verifica se o usuário é admin
│   │   │   └── authMiddleware.ts       # Verifica o token Firebase
│   │   ├── routes/
│   │   │   ├── adminRoutes.ts          # Rotas de /api/admin
│   │   │   ├── authRoutes.ts           # Rotas de /api/auth
│   │   │   └── notaFiscalRoutes.ts     # Rotas de /api/notas
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Definição dos models (User, NotaFiscal)
│   │   ├── index.ts                  # Ponto de entrada do servidor Express
│   │   └── prisma.ts                 # Instância global do PrismaClient
│   └── serviceAccountKey.json      # Credenciais do Firebase Admin (Exige criação manual)
│
└── frontend/
    ├── app/
    │   ├── (app)/                    # Rotas protegidas (autenticadas)
    │   │   ├── _layout.tsx           # Layout de tabs
    │   │   ├── index.tsx             # Tela do Dashboard (Lista de Notas)
    │   │   ├── admin.tsx             # Tela de Gerenciamento de Admin
    │   │   └── perfil.tsx            # Tela de Perfil do Usuário
    │   ├── (auth)/                   # Rotas públicas (autenticação)
    │   │   ├── _layout.tsx           # Layout de stack
    │   │   ├── login.tsx             # Tela de Login
    │   │   ├── register.tsx          # Tela de Registro
    │   │   └── forgot-password.tsx   # Tela de Recuperar Senha
    │   └── _layout.tsx               # Layout Raiz (controla o fluxo Auth/App)
    ├── context/
    │   └── AuthContext.tsx           # Provedor de Autenticação Global
    ├── src/services/
    │   └── api.ts                    # Instância configurada do Axios
    ├── firebaseConfig.ts             # Configuração do Firebase (cliente)
    ├── app.json                      # Configuração do projeto Expo
    └── package.json                  # Dependências do Frontend
```

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js (LTS)
- NPM ou Yarn
- Conta no Firebase (para autenticação e credenciais de Admin)
- Expo CLI (instalado globalmente ou via `npx`)
- Um dispositivo (Android/iOS) ou emulador/simulador

### Configuração do Backend

1. **Navegue até a pasta do backend:**

```bash
cd backend
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Crie sua Chave de Admin do Firebase:**

   - Vá ao seu [console do Firebase](https://console.firebase.google.com) > Configurações do Projeto > Contas de Serviço.
   - Gere uma nova chave privada.
   - Renomeie o arquivo `.json` baixado para `serviceAccountKey.json` e coloque-o na raiz da pasta `backend/`.

4. **Configure o Banco de Dados:**

   O projeto usa SQLite. Crie um arquivo `.env` na raiz do `backend/` e adicione a string de conexão:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
```

5. **Execute a migração do Prisma para criar o banco de dados e as tabelas:**

```bash
npx prisma migrate dev --name init
```

6. **Inicie o servidor backend:**

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`.

### Configuração do Frontend

1. **Navegue até a pasta do frontend:**

```bash
cd frontend
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure o Firebase Client:**

   - Abra o arquivo `frontend/firebaseConfig.ts`.
   - Substitua o objeto `firebaseConfig` pelas credenciais do seu projeto Firebase (Web).

4. **Configure o Endereço da API:**

   - Abra o arquivo `frontend/src/services/api.ts`.
   - Altere o `baseURL` para o endereço IP da sua máquina onde o backend está rodando.

   **Exemplos:**

   - Uso geral: `baseURL: "http://192.168.1.10:3000/api"`
   - Emulador Android: `http://10.0.2.2:3000/api`
   - Simulador iOS ou Web: `http://localhost:3000/api`

5. **Inicie o aplicativo Expo:**

```bash
npm start
```

ou

```bash
expo start
```

Escaneie o QR code com o app **Expo Go** no seu dispositivo, ou pressione:

- `a` para Emulador Android
- `i` para Simulador iOS
- `w` para Web

### Criando um Administrador

Por padrão, novos usuários são criados com a role `"user"`. Para criar um admin:

1. Cadastre um novo usuário normalmente pelo aplicativo.
2. Abra o banco de dados `backend/dev.db` (usando um visualizador de SQLite, como o "SQLite" para VS Code).
3. Encontre o usuário na tabela `User`.
4. Mude o valor da coluna `role` de `"user"` para `"admin"`.
5. Faça login novamente no aplicativo com esse usuário para ver o painel de administração.

---

## 🔑 Endpoints da API

O backend expõe os seguintes endpoints, todos prefixados com `/api`.

### Autenticação (`/api/auth`)

| Método | Endpoint         | Descrição                                                                                      | Requer Auth |
| ------ | ---------------- | ---------------------------------------------------------------------------------------------- | ----------- |
| `POST` | `/register`      | Cria um novo usuário no Firebase e no banco de dados local.                                    | ❌          |
| `GET`  | `/me`            | Retorna o perfil completo do usuário logado.                                                   | ✅          |
| `PUT`  | `/profile`       | Atualiza o telefone do usuário. Se o usuário for admin, permite também atualizar o `fullName`. | ✅          |
| `POST` | `/profile/photo` | Faz upload de uma nova foto de perfil (`multipart/form-data`).                                 | ✅          |

### Notas Fiscais (`/api/notas`)

| Método   | Endpoint | Descrição                                                                        | Requer Auth |
| -------- | -------- | -------------------------------------------------------------------------------- | ----------- |
| `GET`    | `/`      | Lista todas as notas fiscais do usuário autenticado.                             | ✅          |
| `POST`   | `/`      | Cria uma nova nota fiscal. Espera `multipart/form-data` se uma foto for enviada. | ✅          |
| `PUT`    | `/:id`   | Atualiza uma nota fiscal existente pelo ID.                                      | ✅          |
| `DELETE` | `/:id`   | Deleta uma nota fiscal pelo ID.                                                  | ✅          |

### Administração (`/api/admin`)

| Método | Endpoint              | Descrição                                  | Requer Auth | Requer Admin |
| ------ | --------------------- | ------------------------------------------ | ----------- | ------------ |
| `GET`  | `/users`              | Lista todos os usuários do sistema.        | ✅          | ✅           |
| `PUT`  | `/users/:id/password` | Define uma nova senha para um usuário.     | ✅          | ✅           |
| `PUT`  | `/users/:id/block`    | Bloqueia um usuário (no Firebase e no DB). | ✅          | ✅           |
| `PUT`  | `/users/:id/unblock`  | Desbloqueia um usuário.                    | ✅          | ✅           |

### Outros

| Método | Endpoint      | Descrição                                           | Requer Auth |
| ------ | ------------- | --------------------------------------------------- | ----------- |
| `GET`  | `/uploads/*`  | Serve arquivos estáticos (fotos de perfil e notas). | ❌          |
| `GET`  | `/api/health` | Rota pública para verificar se a API está online.   | ❌          |

---

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

## 📧 Contato

Para dúvidas ou sugestões, entre em contato através do email ou abra uma issue no repositório.

---
