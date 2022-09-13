all:	start

start:
	docker-compose up --build

update:
	git pull origin master

stop:
	docker-compose down

clean:
	docker-compose down --rmi all

fclean: clean
	docker system prune --all --force --volumes

re : fclean all

.PHONY: start update stop clean fclean re
