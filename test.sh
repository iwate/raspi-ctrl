#!/bin/bash

set -e

read -p "SSID: " ssid
read -p "PASS(len=8-63): " pass
read -p "COUNTRY(ex.JP,GB): " cc
read -p "Ch(=1-14): " ch

echo "$ssid"
echo "$pass"
echo "$cc"
echo "$ch"