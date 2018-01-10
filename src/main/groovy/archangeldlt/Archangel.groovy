package archangeldlt

import static DroidWrapper.*

class Archangel {
  static void main(String[] args) {
    if (args.length == 0) {
      println("Give us a filename then chummy")
      return
    }

    setupDroid()

    def csvExport = characterizeFile(args[0])
    def jsonExport = convertExportToJson(csvExport)

    println '\n\n\n'
    jsonExport.each { println it }

    System.exit(0)
  } // main
} // class Archangel
