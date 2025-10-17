# Reverse Proxy - Badgeur

## Prerequisites

- .NET 8 SDK
- Visual Studio 2022 (or VS Code with .NET extensions)
- Docker (for containerized runs)

## Setup

1. **Restore NuGet packages:**
```bash
	dotnet restore reverse-proxy.csproj
```

2. **Build the project:**
```bash
	dotnet build reverse-proxy.csproj
```

3. **Run the project:**
```bash
	dotnet run --project reverse-proxy.csproj
```

## Running with Docker

1. **Build the Docker image:**
```bash
	docker build -t reverse-proxy .
```
2. **Run the Docker container:**
```bash
	docker run -d -p 5159:8080 --name reverse-proxy -e ASPNETCORE_ENVIRONMENT=Development reverse-proxy
```

The reverse proxy will be accessible at `http://localhost:5159`.