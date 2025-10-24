# Projet Badging & Planning

## 🧱 Backend (.NET)
- Installer DotNet : https://dotnet.microsoft.com/fr-fr/download/dotnet/thank-you/sdk-8.0.414-windows-x64-installer
- Ajotuer le appsettings.json avec l'URL de la db
- Lancer l’API :
  ```bash
  cd backend
  dotnet run
  ```
## ⚛️ Frontend (React)
- Lancer l’interface
  ```bash
  cd frontend && npm install chart.js
  npm start
  ```

## Docker Compose
- Spin up containers (dev)
```bash
docker-compose -f docker-compose.dev.yml up --build
```

- Spin up containers (prod)
```bash
docker-compose -f docker-compose.prod.yml up --build
```

- Spin down containers
```bash
docker-compose down
```