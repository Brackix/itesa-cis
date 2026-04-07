up-db:
	docker compose --env-file backend/.env -f compose.db.yml up -d
up: 
	docker compose up -d