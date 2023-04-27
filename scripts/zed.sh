#!/usr/bin/env bash

install_zed() {
  if [[ $OSTYPE == 'darwin'* ]]; then
    brew install authzed/tap/zed
  fi
}

if ! command -v zed &> /dev/null
then
    echo "zed not installed. Installing..."
    install_zed
fi

zed context set spice-glass localhost:60051 test --insecure
zed $@