# 📱 Gerenciador de Notas Fiscais

Projeto da disciplina de Programação de Dispositivos Móveis com React Native + Expo (Android)

**Orientador:** Prof. Luiz Gustavo Turatti

A solução compartilhada neste repositório consiste no desenvolvimento de uma plataforma mobile para gerenciamento e organização de notas fiscais eletrônicas. O aplicativo permite aos usuários cadastrar, visualizar, editar e excluir notas fiscais através de múltiplos métodos de entrada: leitura de QR Code (chave de acesso de 44 dígitos), captura por câmera, seleção de galeria e entrada manual de dados. O sistema implementa autenticação segura via Firebase, armazenamento local com SQLite/Prisma, e interface moderna seguindo os padrões do Material Design 3.

---

## 👥 Equipe do Projeto

- **RA XXXXXX** - Erick Valente Sprogis

---

## 📑 Sumário

1. [Requisitos](#-requisitos)
2. [Configuração de Acesso aos Dados](#-configuração-de-acesso-aos-dados)
3. [Estrutura do Projeto](#-estrutura-do-projeto)
4. [Instalação dos Requisitos](#-instalação-dos-requisitos)
5. [Configuração do Firebase](#-configuração-do-firebase)
6. [Executando o Projeto](#-executando-o-projeto)
7. [Funcionalidades Principais](#-funcionalidades-principais)
8. [Telas do Projeto](#-telas-do-projeto)
9. [Tecnologias Utilizadas](#-tecnologias-utilizadas)

---

## 🔧 Requisitos

### Ambiente de Desenvolvimento:

- **Node.js LTS** versão 20.x ou superior
- **npm** versão 10.x ou superior
- **Expo CLI** versão 51.x
- **React Native** versão 0.74.x
- **TypeScript** versão 5.3.x

### Aplicativo Mobile:

- **Expo Go** ([Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [Apple App Store](https://apps.apple.com/app/expo-go/id982107779))

### Banco de Dados:

- **SQLite** (banco de dados local)
- **Prisma ORM** versão 5.x

### Serviços Externos:

- **Firebase Authentication** (autenticação de usuários)
- **Firebase Admin SDK** (gerenciamento backend)

---

## 🗄️ Estrutura do Banco de Dados

### 📊 Tabela `User`:

```prisma
model User {
  id         String   @id @default(uuid())
  uid        String   @unique
  email      String   @unique
  fullName   String
  phone      String?
  photoURL   String?
  role       String   @default("user")
  isBlocked  Boolean  @default(false)
  createdAt  DateTime @default(now())

  notasFiscais NotaFiscal[]
}
```

**Campos:**

- `id`: UUID (chave primária)
- `uid`: String (UID do Firebase - único)
- `email`: String (e-mail do usuário - único)
- `fullName`: String (nome completo)
- `phone`: String (telefone - opcional)
- `photoURL`: String (URL da foto de perfil - opcional)
- `role`: String (função: "user" ou "admin")
- `isBlocked`: Boolean (status de bloqueio)
- `createdAt`: DateTime (data de criação)

---

### 📋 Tabela `NotaFiscal`:

```prisma
model NotaFiscal {
  id             String   @id @default(uuid())
  chave_acesso   String   @unique
  numero_nf      String
  emitente_nome  String
  emitente_cnpj  String?
  data_emissao   DateTime
  valor_total    Float
  foto_url       String?
  criado_em      DateTime @default(now())
  criado_por     User     @relation(fields: [criado_por_uid], references: [uid])
  criado_por_uid String
}
```

**Campos:**

- `id`: UUID (chave primária)
- `chave_acesso`: String (chave de acesso de 44 dígitos - única)
- `numero_nf`: String (número da nota fiscal)
- `emitente_nome`: String (nome do emitente)
- `emitente_cnpj`: String (CNPJ do emitente - opcional)
- `data_emissao`: DateTime (data de emissão)
- `valor_total`: Float (valor total da nota)
- `foto_url`: String (caminho da foto - opcional)
- `criado_em`: DateTime (data de criação)
- `criado_por_uid`: String (UID do criador - foreign key)

---

## 🔐 Configuração de Acesso aos Dados

### Backend (`backend/.env`):

```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
```

### Firebase Configuration:

O projeto utiliza Firebase para autenticação. Você precisará:

1. **Service Account Key** (`backend/serviceAccountKey.json`):

```json
{
	"type": "service_account",
	"project_id": "seu-projeto-firebase",
	"private_key_id": "...",
	"private_key": "...",
	"client_email": "...",
	"client_id": "...",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://oauth2.googleapis.com/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": "..."
}
```

2. **Firebase Config** (`frontend/firebaseConfig.ts`):

```typescript
export const firebaseConfig = {
	apiKey: "AIza...",
	authDomain: "seu-projeto.firebaseapp.com",
	projectId: "seu-projeto-firebase",
	storageBucket: "seu-projeto.appspot.com",
	messagingSenderId: "123456789",
	appId: "1:123456789:web:abc123...",
};
```

---

## 📁 Estrutura do Projeto

```
ProjetoAndroid/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── notaFiscalController.ts
│   │   ├── middlewares/
│   │   │   └── authMiddleware.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   └── notaFiscalRoutes.ts
│   │   ├── prisma.ts
│   │   └── index.ts
│   ├── uploads/
│   │   └── profiles/
│   ├── .env
│   ├── serviceAccountKey.json
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── index.tsx
│   │   │   ├── perfil.tsx
│   │   │   ├── admin.tsx
│   │   │   └── _layout.tsx
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── _layout.tsx
│   │   └── _layout.tsx
│   ├── assets/
│   │   └── images/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   │       └── api.ts
│   ├── firebaseConfig.ts
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── documentacao/
│   └── documentacao.md
│
├── video/
│   └── demonstracao.mp4
│
└── README.md
```

---

## 📦 Instalação dos Requisitos

### Windows 11:

**1. Instale o Chocolatey** (gerenciador de pacotes):

Abra o PowerShell como **Administrador** e execute:

```powershell
Set-ExecutionPolicy AllSigned

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

choco --version
```

**2. Instale os requisitos:**

```powershell
choco install nodejs-lts -y
choco install openjdk17 -y
```

**3. Verifique as instalações:**

```powershell
node --version
npm --version
java -version
```

---

### Linux/macOS:

**1. Instale o Node.js:**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (Homebrew)
brew install node@20
```

**2. Verifique a instalação:**

```bash
node --version
npm --version
```

---

## 🔥 Configuração do Firebase

### 1. Crie um Projeto no Firebase:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga as instruções para criar o projeto

### 2. Ative a Autenticação:

1. No menu lateral, vá em **Authentication**
2. Clique em "Começar"
3. Ative o método **E-mail/Senha**

### 3. Obtenha as Credenciais:

**Para o Frontend:**

1. Vá em **Configurações do Projeto** (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique em "Web" (`</>`)
4. Copie as configurações e cole em `frontend/firebaseConfig.ts`

**Para o Backend:**

1. Vá em **Configurações do Projeto** → **Contas de serviço**
2. Clique em "Gerar nova chave privada"
3. Salve o arquivo como `backend/serviceAccountKey.json`

### 4. Crie um Usuário Admin:

Após executar o projeto pela primeira vez, cadastre um usuário e execute no backend:

```bash
cd backend
npx ts-node -e "
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.user.update({
    where: {email: 'seu-email@exemplo.com'},
    data: {role: 'admin'}
  });
  console.log('✅ Usuário promovido a admin!');
  process.exit(0);
}
run();
"
```

---

## 🚀 Executando o Projeto

### 1. Clone o Repositório:

```bash
git clone https://github.com/seu-usuario/gerenciador-notas-fiscais.git
cd gerenciador-notas-fiscais
```

---

### 2. Configure o Backend:

```bash
cd backend

# Instale as dependências
npm install

# Configure o arquivo .env
cp .env.example .env

# Adicione o serviceAccountKey.json do Firebase
# (baixado conforme instruções acima)

# Execute as migrations do Prisma
npx prisma migrate dev

# Inicie o servidor
npm run dev
```

O backend estará disponível em: `http://localhost:3000`

---

### 3. Configure o Frontend:

```bash
cd frontend

# Instale as dependências
npm install

# Configure o Firebase
# Edite o arquivo firebaseConfig.ts com suas credenciais

# Inicie o Expo
npx expo start
```

---

### 4. Execute no Dispositivo:

**Opção A - Expo Go (Desenvolvimento):**

1. Instale o **Expo Go** no seu celular
2. Escaneie o QR Code exibido no terminal
3. O app será carregado no dispositivo

**Opção B - Navegador Web:**

1. Pressione `w` no terminal do Expo
2. O app abrirá no navegador em `http://localhost:8081`

**Opção C - Emulador Android:**

1. Instale o Android Studio
2. Configure um emulador
3. Pressione `a` no terminal do Expo

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação:

- ✅ Cadastro de novos usuários
- ✅ Login com e-mail e senha
- ✅ Recuperação de senha
- ✅ Perfis diferenciados (Usuário e Administrador)

### 📋 Gerenciamento de Notas Fiscais:

- ✅ **Leitura de QR Code** (chave de acesso de 44 dígitos)
- ✅ **Captura por Câmera** (foto da nota fiscal)
- ✅ **Seleção da Galeria** (importar imagem existente)
- ✅ **Entrada Manual** (digitação de dados)
- ✅ Visualização detalhada com preview de imagem
- ✅ Edição de notas cadastradas
- ✅ Exclusão de notas

### 👤 Perfil do Usuário:

- ✅ Visualização de informações
- ✅ Edição de foto de perfil
- ✅ Edição de telefone (todos os usuários)
- ✅ Edição de nome completo (apenas administradores)

### 👑 Painel Administrativo:

- ✅ Listagem de todos os usuários
- ✅ Bloqueio/desbloqueio de usuários
- ✅ Alteração de perfis (usuário ↔ admin)
- ✅ Visualização de estatísticas

### 🎨 Interface:

- ✅ Material Design 3
- ✅ Navegação por abas inferiores
- ✅ Floating Action Button para criar notas
- ✅ Tema em #1E4369 (azul escuro)
- ✅ Componentes com elevação e ripple effects

---

## 📱 Telas do Projeto

### Tela 1: **Login**

![Login](./video/tela-login.png)

- Campo de e-mail
- Campo de senha
- Botão "Entrar"
- Link para cadastro
- Link para recuperação de senha

---

### Tela 2: **Cadastro**

![Cadastro](./video/tela-cadastro.png)

- Nome completo
- E-mail
- Telefone
- Senha
- Confirmação de senha
- Botão "Cadastrar"

---

### Tela 3: **Dashboard (Notas Fiscais)**

![Dashboard](./video/tela-dashboard.png)

- Lista de todas as notas fiscais
- Cards com informações resumidas:
  - Emitente
  - Número da NF
  - Valor total
  - Data de emissão
- Floating Action Button (+) para adicionar nova nota
- Pesquisa e filtros

---

### Tela 4: **Criar Nota Fiscal**

![Criar Nota](./video/tela-criar-nota.png)

- Opções de entrada:
  - 📷 **Escanear QR Code**
  - 📸 **Tirar Foto**
  - 🖼️ **Escolher da Galeria**
  - ✏️ **Entrada Manual**
- Preview da foto selecionada
- Formulário de dados:
  - Chave de acesso (44 dígitos)
  - Número da NF
  - Nome do emitente
  - Data de emissão
  - Valor total
- Botões: Cancelar / Salvar

---

### Tela 5: **Detalhes da Nota Fiscal**

![Detalhes](./video/tela-detalhes-nota.png)

- Imagem da nota (se disponível)
- Informações completas:
  - Chave de acesso
  - Número da NF
  - Emitente
  - Data de emissão
  - Valor total
  - Data de cadastro
  - Cadastrado por
- Botões: Editar / Excluir

---

### Tela 6: **Perfil do Usuário**

![Perfil](./video/tela-perfil.png)

- Foto de perfil (editável)
- Nome completo (editável apenas para admin)
- E-mail (não editável)
- Telefone (editável)
- Tipo de conta (usuário/administrador)
- Badge de administrador (se aplicável)
- Botão "Editar Perfil"
- Botão "Sair"

---

### Tela 7: **Editar Perfil**

![Editar Perfil](./video/tela-editar-perfil.png)

- Preview da foto
- Botões: Câmera / Galeria
- Campo e-mail (somente leitura)
- Campo nome (editável para admin)
- Campo telefone (editável para todos)
- Botões: Cancelar / Salvar

---

### Tela 8: **Painel Admin**

![Admin](./video/tela-admin.png)

- Lista de todos os usuários
- Cards com:
  - Foto de perfil
  - Nome
  - E-mail
  - Tipo de conta
  - Status (ativo/bloqueado)
- Ações:
  - Bloquear/Desbloquear usuário
  - Tornar admin/usuário comum
- Estatísticas do sistema

---

## 🛠️ Tecnologias Utilizadas

### Backend:

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web
- **Prisma ORM** - Object-Relational Mapping
- **SQLite** - Banco de dados
- **Firebase Admin SDK** - Autenticação e gerenciamento
- **Multer** - Upload de arquivos

### Frontend:

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **Expo Router** - Navegação file-based
- **TypeScript** - Tipagem estática
- **Firebase Auth** - Autenticação de usuários
- **AsyncStorage** - Persistência local
- **expo-barcode-scanner** - Leitura de QR Code
- **expo-image-picker** - Seleção/captura de imagens

### Design:

- **Material Design 3** - Sistema de design
- **@expo/vector-icons** - Ícones
- **React Native Paper** (conceitos) - Componentes Material

---

## 📝 Scripts Disponíveis

### Backend:

```bash
npm run dev       # Inicia o servidor em modo desenvolvimento
npm run build     # Compila TypeScript para JavaScript
npm start         # Inicia o servidor compilado
npx prisma studio # Abre interface visual do banco de dados
npx prisma migrate dev # Cria nova migration
```

### Frontend:

```bash
npx expo start           # Inicia o Expo
npx expo start --clear   # Inicia limpando cache
npx expo start --web     # Abre no navegador
npx expo start --android # Abre no Android
eas build --platform android # Build de produção
```

---

## 🐛 Troubleshooting

### Problema: "Firebase not initialized"

**Solução:** Verifique se o `firebaseConfig.ts` está configurado corretamente.

### Problema: "Cannot connect to backend"

**Solução:**

1. Verifique se o backend está rodando em `localhost:3000`
2. Confirme que o `api.ts` aponta para o IP correto
3. Se estiver em dispositivo físico, use o IP da máquina (não localhost)

### Problema: Câmera/Galeria não funciona

**Solução:**

1. Conceda permissões no dispositivo
2. No Android, verifique as permissões em `app.json`

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

---

## 📞 Suporte

Para dúvidas ou problemas, entre em contato através do e-mail ou abra uma issue no repositório.
