# DevScribe Run Commands

Use these commands from the repository root on Windows PowerShell.

## Start Local Services

Start PostgreSQL and Redis:

```powershell
docker compose up -d
```

## Start the Backend

Run the Spring Boot API:

```powershell
.\mvnw.cmd spring-boot:run
```

If port `8080` is already in use, find and stop the process first:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen
Stop-Process -Id <PID> -Force
```

Check the API is up:

```powershell
Invoke-WebRequest http://localhost:8080/api/auth/me -UseBasicParsing
```

Expected unauthenticated result: `401` or `403`.

## Start the Frontend

Open a second terminal and run:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## Stop the Application

Stop the backend:

- In the terminal running `spring-boot:run`, press `Ctrl + C`
- Or stop the Java process manually:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen
Stop-Process -Id <PID> -Force
```

Stop the frontend:

- In the terminal running `npm run dev`, press `Ctrl + C`

Stop the database containers:

```powershell
docker compose down
```

Stop everything and remove volumes if you want a clean local reset:

```powershell
docker compose down -v
```

## Quick Restart Sequence

```powershell
docker compose up -d
.\mvnw.cmd spring-boot:run
```

Then in another terminal:

```powershell
Set-Location .\frontend
npm run dev
```

## Postman Base URL

Use this base URL in Postman:

```text
http://localhost:8080/api
```
