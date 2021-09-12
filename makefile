PATH := ./node_modules/.bin:${PATH}
.PHONY: build clean

all: build

build: clean
	@echo "Build..."
	npm run build

clean:
	@echo "Clean..."
	-rd /s /q build
	-rm -rf build