package archangeldlt.webapi

import ratpack.form.Form
import ratpack.groovy.handling.GroovyContext
import ratpack.groovy.handling.GroovyHandler

import static archangeldlt.DroidWrapper.characterizeFile
import static archangeldlt.DroidWrapper.convertExportToJson
import static ratpack.jackson.Jackson.json

class UploadHandler extends GroovyHandler {
  @Override
  protected void handle(GroovyContext context) {
    def form = context.parse Form
    form.then {
      def candidate = it.file('candidate')
      if (!candidate.fileName) {
        context.render "No file uploaded"
        return
      }

      def lastModified = it['lastModified']

      File.createTempDir('archangel-droid', 'tmp').with { dir ->
        println "Created directory ${dir.name}"
        def file = new File(dir, candidate.fileName)
        println "Created file ${file.name}"

        file.withOutputStream { os ->
          candidate.writeTo(os)
        }

        if (lastModified)
          file.setLastModified(Long.parseLong(lastModified))

        def csvExport = characterizeFile(file.absolutePath)
        def jsonExport = convertExportToJson(csvExport)

        file.delete()

        context.render json(jsonExport)

        dir.delete()
      } // File.createTempDir
    } // upload
  } // handle
} // class UploadHandler

