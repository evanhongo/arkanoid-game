PATH := ./node_modules/.bin:${PATH}
.PHONY: build clean

all: build

build: clean
	@echo "Build..."
	yarn build

clean:
	@echo "Clean..."
	-rd /s /q dist
	-rm -rf dist