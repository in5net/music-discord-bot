#!/bin/sh
until bun start
do
    echo "Restarting bot..."
    sleep 1
done