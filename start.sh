#!/bin/sh
until pnpm start
do
    echo "Restarting bot..."
    sleep 1
done