.PHONY: dev stop restart ngrok logs migrate migrate-down migrate-status seed seed-fresh

dev:
	npm run dev

stop:
	@lsof -ti:4000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@echo "Stopped"

restart: stop dev

ngrok:
	ngrok http 3000

migrate:
	npm run migrate:up

migrate-down:
	npm run migrate:down

migrate-status:
	npm run migrate:status

seed:
	npm run db:seed

seed-fresh:
	npm run db:seed:fresh
