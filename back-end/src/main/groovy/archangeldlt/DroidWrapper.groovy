package archangeldlt

import au.com.bytecode.opencsv.CSVReader
import org.apache.commons.io.FileUtils
import org.apache.commons.lang.RandomStringUtils
import uk.gov.nationalarchives.droid.command.DroidCommandLine
import uk.gov.nationalarchives.droid.core.interfaces.config.DroidGlobalProperty
import uk.gov.nationalarchives.droid.core.interfaces.config.RuntimeConfig

class DroidWrapper {
  static void setupDroid() {
    RuntimeConfig.configureRuntimeEnvironment()

    // Don't kill the process when we've finished a Droid command
    DroidCommandLine.systemExit = false

    // Make sure we're generating the SHA256 hash
    def cmdLine = new DroidCommandLine([] as String[])
    def globalContext = cmdLine.context
    def globalConfig = globalContext.globalConfig
    def props = globalConfig.properties
    props.setProperty(DroidGlobalProperty.GENERATE_HASH.name, true)
    props.setProperty(DroidGlobalProperty.HASH_ALGORITHM.name, "sha256")
    props.save()
  } // setupDroid

  static String characterizeFile(String file) {
    def passName = uniqueName()
    def profileName = "${passName}.droid"
    def exportName ="${passName}.csv"

    droid(["-A", "-a", "\"${file}\"", "-p", "\"${profileName}\""])
    droid(["-p", "\"${profileName}\"", "-e", "\"${exportName}\""])

    def exportFile = new File(exportName)
    def csvExport = exportFile.getText('utf8')

    FileUtils.deleteQuietly(new File(profileName))
    FileUtils.deleteQuietly(exportFile)

    return csvExport
  } // characterizeFile

  static def convertExportToJson(String csvExport, String tmpDirPath) {
    def csvReader = new CSVReader(new StringReader(csvExport), ',' as Character, '"' as Character)
    def columnNames = csvReader.readNext().collect { it.toString().trim() }
    def desiredColumns = ['ID', 'PARENT_ID', 'URI', 'NAME', 'SIZE', 'TYPE', 'LAST_MODIFIED', 'SHA256_HASH', 'PUID']

    def json = csvReader.readAll().collect { line ->
      def index = 0
      columnNames.inject([:]) { map, key ->
        if (desiredColumns.contains(key))
          map << [ ("$key" as String): line[index] ]
        ++index
        return map
      }
    }

    json = fixupJson(json, tmpDirPath)

    return json
  } // convertExportToJson

  ////////////////////////////////////////////////
  static private void droid(def args) {
    def cmdLine = new DroidCommandLine(args as String[])
    cmdLine.processExecution()
  } // droid

  static private def fixupJson(def jsonArray, tmpDirPath) {
    def idToHash = jsonArray.collectEntries {
      [ (it['ID']): it['SHA256_HASH']]
    }
    jsonArray.findAll { it['TYPE'] == 'Folder' }.each {
      idToHash[it['ID']] = idToHash[it['PARENT_ID']]
    }

    for (def line : jsonArray) {
      def parent = line['PARENT_ID']
      line << [ PARENT_SHA256_HASH : parent ? idToHash[parent] : '' ]

      def uri = line['URI']
      line << [ 'PATH' : uri.replaceAll(tmpDirPath, '') ]
      line.remove('URI')
    }

    return jsonArray
  } // fixupJson

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
