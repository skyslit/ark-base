#!/bin/bash

# Symlink Ark Backend
rm -Rf node_modules/@skyslit/ark-backend
ln -s "/Users/dameemshahabaz/Documents/ark-source-code/ark/packages/ark-backend" "node_modules/@skyslit/ark-backend"

# Symlink Ark Frontend
rm -Rf node_modules/@skyslit/ark-frontend
ln -s "/Users/dameemshahabaz/Documents/ark-source-code/ark/packages/ark-frontend" "node_modules/@skyslit/ark-frontend"

# Create Symlink for React in Ark-Frontend package
rm -Rf "/Users/dameemshahabaz/Documents/ark-source-code/ark/packages/ark-frontend/node_modules/react"
ln -s "/Users/dameemshahabaz/Documents/ark-source-code/dynamics-base/node_modules/react" "/Users/dameemshahabaz/Documents/ark-source-code/ark/packages/ark-frontend/node_modules/react"