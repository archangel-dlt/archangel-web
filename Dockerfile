FROM openjdk:11

CMD ["archangel-web/bin/archangel-web"]

COPY back-end/build/install/ /
