#!/bin/bash

gnome-terminal -- bash -c "cd server && flask --app server:app run --host:0.0.0.0 --port=5000; exec bash"
gnome-terminal -- bash -c "cd client && node server.js; exec bash"

alias run-backend='./run-backend.sh'