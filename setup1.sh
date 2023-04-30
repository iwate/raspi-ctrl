#!/bin/bash

set -e

wget https://github.com/iwate/raspi-ctrl/releases/latest/download/raspictrl
wget https://github.com/iwate/raspi-ctrl/raw/dev/web/public/settings.json
wget https://github.com/iwate/raspi-ctrl/raw/dev/raspictrl.service

chmod +x ./raspictrl

sudo cp ./raspictrl.service /etc/systemd/system/raspictrl.service

sudo systemctl enable raspictrl.service

sudo swapoff --all
sudo systemctl stop dphys-swapfile
sudo systemctl disable dphys-swapfile

sudo echo 'tmpfs	/tmp	tmpfs	defaults,size=64m,noatime,mode=1777	0	0' >> /etc/fstab
sudo echo 'tmpfs	/var/tmp	tmpfs	defaults,size=16m,noatime,mode=1777	0	0' >> /etc/fstab
sudo echo 'tmpfs	/var/log	tmpfs	defaults,size=32m,noatime,mode=0755	0	0' >> /etc/fstab

sudo rm -rf /tmp
sudo rm -rf /var/tmp
sudo rm -rf /var/log

sudo reboot