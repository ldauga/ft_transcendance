FROM postgres:14.3-alpine3.16

RUN mkdir -p /docker-entrypoint-initdb.d

WORKDIR	/docker-entrypoint-initdb.d

COPY ./init_db.sql .
