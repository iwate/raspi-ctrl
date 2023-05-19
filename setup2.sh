#!/bin/bash

set -e

# sudo apt -y update

sudo apt -y install hostapd

sudo systemctl unmask hostapd
sudo systemctl enable hostapd

sudo apt -y install dnsmasq

sudo DEBIAN_FRONTEND=noninteractive apt install -y netfilter-persistent iptables-persistent

echo 'interface wlan0' | sudo tee -a /etc/dhcpcd.conf
echo '    static ip_address=192.168.4.1/24' | sudo tee -a /etc/dhcpcd.conf
echo '    nohook wpa_supplicant' | sudo tee -a /etc/dhcpcd.conf

echo '# Enable IPv4 routing' | sudo tee /etc/sysctl.d/routed-ap.conf
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.d/routed-ap.conf

sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

sudo netfilter-persistent save

sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig

echo 'interface=wlan0' | sudo tee /etc/dnsmasq.conf
echo 'dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h' | sudo tee -a /etc/dnsmasq.conf
echo 'domain=wlan' | sudo tee -a /etc/dnsmasq.conf
echo 'address=/gw.wlan/192.168.4.1' | sudo tee -a /etc/dnsmasq.conf

sudo rfkill unblock wlan

read -p "SSID: " ssid
read -p "PASS(len=8-63): " pass
read -p "COUNTRY(ex.JP,GB): " cc
read -p "Ch(=1-14): " ch

echo "country_code=$cc" | sudo tee /etc/hostapd/hostapd.conf
echo 'interface=wlan0' | sudo tee -a /etc/hostapd/hostapd.conf
echo "ssid=$ssid" | sudo tee -a /etc/hostapd/hostapd.conf
echo 'hw_mode=g' | sudo tee -a /etc/hostapd/hostapd.conf
echo "channel=$ch" | sudo tee -a /etc/hostapd/hostapd.conf
echo 'macaddr_acl=0' | sudo tee -a /etc/hostapd/hostapd.conf
echo 'auth_algs=1' | sudo tee -a /etc/hostapd/hostapd.conf
echo 'ignore_broadcast_ssid=0' | sudo tee -a /etc/hostapd/hostapd.conf
echo 'wpa=2' | sudo tee -a /etc/hostapd/hostapd.conf
echo "wpa_passphrase=$pass" | sudo tee -a /etc/hostapd/hostapd.conf
echo 'wpa_key_mgmt=WPA-PSK' | sudo tee -a /etc/hostapd/hostapd.conf
echo 'wpa_pairwise=TKIP' | sudo tee -a /etc/hostapd/hostapd.conf
echo 'rsn_pairwise=CCMP' | sudo tee -a /etc/hostapd/hostapd.conf

sudo systemctl reboot
