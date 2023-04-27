@echo off

cd %~dp0
cd web
call npm run build
cd ..\

set GOOS=linux
set GOARCH=arm
set GOARM=7

go build -o raspictrl
