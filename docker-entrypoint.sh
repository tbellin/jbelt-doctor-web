#!/bin/sh
set -e
echo ">>> Ambiente: $NODE_ENV"
echo ">>> Directory corrente: $(pwd)"
echo ">>> Contenuto directory:"
ls -la
exec "$@"
