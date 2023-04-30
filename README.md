# Install

1. Write "Raspberry Pi OS Lite **Legacy**" image into your SD card by [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
    + !!!raspi-ctrl must need leagcy version!!!
    + After install steps needs internet connection. So you should configure wifi settings on Raspberry Pi Imager before writing image.
    + And I reccomend to configure ssh settings too.
1. Exec `curl -sSL https://github.com/iwate/raspi-ctrl/raw/dev/setup1.sh | sudo bash` on raspbery pi
    + After exec, it will reboot automaticaly.
1. Exec `curl -sSL https://github.com/iwate/raspi-ctrl/raw/dev/setup2.sh | sudo bash` on raspbery pi
    + After exec, it will reboot automaticaly.