#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y

sudo apt install git curl tmux python-is-python3 -y

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm i -g pnpm

git clone https://github.com/limitlesspc/music-discord-bot.git

gsutil -m cp -r \
  "gs://in5net-vm-transfer/discord-bots" \
  .

cd music-discord-bot
pnpm i
pnpm run build