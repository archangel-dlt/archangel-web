package archangeldlt

import ratpack.groovy.GroovyRatpackMain

import static archangeldlt.DroidWrapper.setupDroid

class WebApi extends GroovyRatpackMain {
  static void main(String... args) {
    setupDroid()
    GroovyRatpackMain.main(args)
  }
} // WebApi