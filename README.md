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

- Generate test coverage report
```bash
dotnet test badgeur-backend-tests/badgeur-backend-tests.csproj --collect:"XPlat Code Coverage" --settings badgeur-backend-tests/coverlet.runsettings --results-directory ./TestResults && reportgenerator -reports:TestResults/**/coverage.cobertura.xml -targetdir:coverage_report -reporttypes:Html
```

- Perform a SonarQube analysis
```bash
dotnet sonarscanner begin /k:"Badgeur" /d:sonar.host.url="http://localhost:9000" /d:sonar.token="your-token-here" /d:sonar.cs.opencover.reportsPaths="**/coverage.opencover.xml" /d:sonar.cpd.exclusions="frontend/**,badgeur-backend-tests/**,reverse-proxy/**,coverage_report/**,TestResults/**"

dotnet build backend/badgeur-backend.csproj

dotnet test badgeur-backend-tests/badgeur-backend-tests.csproj --collect:"XPlat Code Coverage" --results-directory ./TestResults --settings badgeur-backend-tests/coverlet.runsettings

dotnet sonarscanner end /d:sonar.token="your-token-here"
```