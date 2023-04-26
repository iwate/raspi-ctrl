#!/bin/bash

set -e

cd `dirname $0`
cd web
npm run build
cd ../

GOOS=linux GOARCH=arm GOARM=7 go build -o raspictrl
