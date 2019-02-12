package archangeldlt.webapi

import ratpack.form.Form
import ratpack.groovy.handling.GroovyContext
import ratpack.groovy.handling.GroovyHandler
import static archangeldlt.DroidWrapper.characterizeFile
import static archangeldlt.DroidWrapper.convertExportToJson
import static ratpack.jackson.Jackson.json
import org.slf4j.LoggerFactory

class UploadHandler extends GroovyHandler {
  @Override
  protected void handle(GroovyContext context) {
    def logger = LoggerFactory.getLogger("Upload")

    def form = context.parse Form
    form.then {
      def candidate = it.file('candidate')
      if (!candidate.fileName) {
        context.render "No file uploaded"
        return
      }

      logger.info "Uploaded ${candidate.fileName}"

      def lastModified = it['lastModified']

      File.createTempDir('archangel-droid', 'tmp').with { dir ->
        def file = new File(dir, candidate.fileName)

        file.withOutputStream { os ->
          candidate.writeTo(os)
        }

        if (lastModified)
          file.setLastModified(Long.parseLong(lastModified))

        def csvExport = characterizeFile(file.absolutePath)
        def jsonExport = convertExportToJson(csvExport, dir.absolutePath)

        file.delete()

        context.render json(jsonExport)
        logger.info "   characterisation complete"

        dir.delete()
      } // File.createTempDir
    } // upload
  } // handle
} // class UploadHandler

