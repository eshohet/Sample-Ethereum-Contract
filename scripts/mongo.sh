#!/usr/bin/env bash
if [ -z $(which mongod) ]; then
   echo "Mongod does not exist, please install it globally"
else
   mkdir -p data
   mongod --dbpath=./data --port 27017
fi