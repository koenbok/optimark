.PHONY: build publish guard-clean guard-upstream guard-synced

# Version bump level for publish: patch | minor | major
BUMP ?= patch
# Optional npm one-time password for 2FA-enabled accounts
OTP ?=

NPM_PUBLISH_FLAGS := --access public
ifneq ($(strip $(OTP)),)
NPM_PUBLISH_FLAGS += --otp=$(OTP)
endif

build:
	npm run build

guard-clean:
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo "Refusing to publish: working tree is not clean."; \
		echo "Commit or stash your changes first."; \
		exit 1; \
	fi

guard-upstream:
	@if ! git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then \
		echo "Refusing to publish: current branch has no upstream."; \
		echo "Push with: git push -u origin $$(git rev-parse --abbrev-ref HEAD)"; \
		exit 1; \
	fi

guard-synced:
	@if [ "$$(git rev-list --count '@{u}..HEAD')" -ne 0 ]; then \
		echo "Refusing to publish: branch has unpushed commits."; \
		echo "Push first with: git push"; \
		exit 1; \
	fi

publish: guard-clean guard-upstream guard-synced build
	npm version $(BUMP) --no-git-tag-version
	npm publish $(NPM_PUBLISH_FLAGS)
