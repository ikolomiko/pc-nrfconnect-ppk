# Define variables
TARGET=$(HOME)/.nrfconnect-apps/node_modules
TAR_FILE=$(wildcard pc-nrfconnect-ppk-*.tgz)

# Default target (when no argument is provided)
.PHONY: default
default: build-pack

# Command for build and pack
.PHONY: build-pack
build-pack:
	npm run build:prod
	npm pack

# Command for installation (when `make install` is invoked)
.PHONY: install
install: 
	tar xzf $(TAR_FILE) -C $(TARGET)
	rm -rf $(TARGET)/pc-nrfconnect-ppk
	mv $(TARGET)/package $(TARGET)/pc-nrfconnect-ppk

