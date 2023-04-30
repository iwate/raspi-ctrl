# How to Install

1. Write "Raspberry Pi OS Lite **Legacy**" image into your SD card by [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
    + !!!raspi-ctrl must need leagcy version (Debian Buster)!!!
    + After install steps needs internet connection. So you should configure wifi settings on Raspberry Pi Imager before writing image.
    + And I reccomend to configure hostname and ssh settings too.
1. Exec `curl -sSL https://github.com/iwate/raspi-ctrl/raw/dev/setup1.sh | sudo bash` on raspberry pi
    + After exec, it will reboot automaticaly.
1. Exec `curl -sSL https://github.com/iwate/raspi-ctrl/raw/dev/setup2.sh > /tmp/setup2.sh && sudo bash /tmp/setup2.sh` on raspberry pi
    + After exec, it will reboot automaticaly.

# How to Use

Turn off mobile network and private DNS and connect the SSID you setupped. 
Then access http://192.168.4.1 by web browser.