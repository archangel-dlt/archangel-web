package archangeldlt

import org.apache.commons.lang.RandomStringUtils
import uk.gov.nationalarchives.droid.command.DroidCommandLine

class Archangel {
  static void main(String[] args) {
    if (args.length == 0) {
      println("Give us a filename then chummy")
      return
    }

    DroidCommandLine.systemExit = false

    def profileName = uniqueName()
    DroidCommandLine.main(["-a", "\"${args[0]}\"", "-A", "-p", "\"${profileName}.droid\""] as String[]);
    DroidCommandLine.main(["-p", "\"${profileName}.droid\"", "-e", "\"${profileName}.csv\""] as String[]);

    println("Welp, let's see what we've got")
    System.exit(0)
  }

  static private String uniqueName() {
    long millis = System.currentTimeMillis()
    String datetime = new Date().toGMTString()
    datetime = datetime.replace(" ", "")
    datetime = datetime.replace(":", "")

    String rndchars = RandomStringUtils.randomAlphanumeric(16)
    String filename = rndchars + "_" + datetime + "_" + millis

    return filename
  }
} // class Archangel
