FROM nginx:latest

COPY ./default.conf etc/nginx/conf.d/default.conf
COPY ./certs/ /etc/nginx/certs
COPY ./acm.sh acme:/etc/acme.sh