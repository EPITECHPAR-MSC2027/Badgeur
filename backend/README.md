# Badgeur - Backend

## Prerequisites

- .NET 8 SDK
- Visual Studio Community 2022 (or VS Code with .NET extensions)
- Supabase account and project (sign up at [supabase.com](https://supabase.com))

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/EPITECHPAR-MSC2027/Badgeur.git
   ```

2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```

3. Configure Supabase in `appsettings.json`:
   ```json
   "Supabase": {
     "Url": "https://ykjqrlnddoaerlyildab.supabase.co",
     "Key": "supabase-key"
   }
   ```

## Running the Project

- Build the project:
  ```bash
  dotnet build
  ```

- Run the project:
  ```bash
  dotnet run
  ```

- Access the API at `https://localhost:5159` (or the configured port)

## Running the project with Docker

- Build the Docker image
```bash
docker compose -f docker-compose.dev.yml up --build
```
- Spin up the image
```bash
docker run -p 5158:8080 --name backend -e ASPNETCORE_ENVIRONMENT=Development badgeur-backend
```


