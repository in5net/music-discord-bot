#!/bin/sh
until bun run start
do
    echo "Restarting bot..."
    sleep 1
done