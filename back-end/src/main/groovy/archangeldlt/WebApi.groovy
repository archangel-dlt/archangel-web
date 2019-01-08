package archangeldlt

import ratpack.groovy.GroovyRatpackMain

import static archangeldlt.DroidWrapper.setupDroid

import static java.awt.Desktop.isDesktopSupported
import static java.awt.Desktop.getDesktop

class WebApi extends GroovyRatpackMain {
  static void main(String... args) {
    setupDroid()
    GroovyRatpackMain.main(args)

    if (isDesktopSupported())
      getDesktop().browse(new URI('http://localhost:5050/'))
  }
} // WebApi
