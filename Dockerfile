FROM openjdk:alpine

CMD ["archangel-web/bin/archangel-web", "--web"]

COPY back-end/build/install/ /
