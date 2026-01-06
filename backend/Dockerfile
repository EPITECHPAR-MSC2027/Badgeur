# Use .NET 8 SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0

# Set working directory
WORKDIR /app

# Copy everything from current directory
COPY . .

# Restore NuGet packages
RUN dotnet nuget add source https://api.nuget.org/v3/index.json -n nuget.org || true && \
    dotnet restore badgeur-backend.csproj --disable-parallel

# Expose port
EXPOSE 8080

# Set environment to listen on all interfaces
ENV ASPNETCORE_URLS=http://+:8080

# Run the application
CMD ["dotnet", "run", "--project", "badgeur-backend.csproj", "--no-launch-profile"]