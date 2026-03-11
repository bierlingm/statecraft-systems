#!/bin/bash
set -e

cd /Users/moritzbierling/werk/repos/statecraft.systems

# Install dependencies
npm install

# Clean up stale editor backup file if it exists
rm -f src/pages/index.astro.save
