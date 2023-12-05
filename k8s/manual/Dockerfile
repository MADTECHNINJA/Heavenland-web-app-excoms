FROM nginx:stable-alpine
COPY ./.output/public /usr/share/nginx/html
#COPY ./manual-build-demo /usr/share/nginx/html
COPY ./k8s/manual/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
