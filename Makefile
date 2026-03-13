.PHONY: dev stop restart ngrok logs

dev:
	npm run dev

stop:
	@lsof -ti:4000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@echo "Stopped"

restart: stop dev

ngrok:
	ngrok http 3000
