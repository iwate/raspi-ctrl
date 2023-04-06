@echo off

cd %~dp0
cd web
call npm run build
cd ..\

set GOOS=linux
set GOARCH=arm64

go build -o raspictrl
