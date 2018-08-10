FROM openjdk:alpine

CMD ["archangel-web/bin/archangel-web"]

COPY back-end/build/install/ /
