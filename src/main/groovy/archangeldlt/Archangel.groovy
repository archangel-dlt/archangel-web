package archangeldlt

import au.com.bytecode.opencsv.CSVReader
import org.apache.commons.io.FileUtils
import org.apache.commons.lang.RandomStringUtils
import uk.gov.nationalarchives.droid.command.DroidCommandLine

class Archangel {
  static void main(String[] args) {
    if (args.length == 0) {
      println("Give us a filename then chummy")
      return
    }

    DroidCommandLine.systemExit = false

    def csvExport = characterizeFile(args[0])
    def jsonExport = convertExportToJson(csvExport)

    println(jsonExport)
    System.exit(0)
  }

  static private String characterizeFile(String file) {
    def passName = uniqueName()
    def profileName = "${passName}.droid"
    def exportName ="${passName}.csv"

    droid(["-a", "\"${file}\"", "-A", "-p", "\"${profileName}\""])
    droid(["-p", "\"${profileName}\"", "-e", "\"${exportName}\""])

    def exportFile = new File(exportName)
    def csvExport = exportFile.getText('utf8')

    FileUtils.deleteQuietly(new File(profileName))
    FileUtils.deleteQuietly(exportFile)

    return csvExport
  } // characterizeFile

  static private void droid(def args) {
    DroidCommandLine.systemExit = false
    DroidCommandLine.main(args as String[])
  } // droid

  static private def convertExportToJson(String csvExport) {
    def csvReader = new CSVReader(new StringReader(csvExport), ',' as Character, '"' as Character)
    def columnNames = csvReader.readNext().collect { it.toString().trim() }
    def desiredColumns = ['ID', 'PARENT_ID', 'NAME', 'SIZE', 'TYPE', 'LAST_MODIFIED', 'SHA256_HASH', 'PUID']

    def json = csvReader.readAll().collect { line ->
      def index = 0
      columnNames.inject([:]) { map, key ->
        if (desiredColumns.contains(key))
          map << [ "$key": line[index] ]
        ++index
        return map
      }
    }

    

    return json
  } // convertExportToJson

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
