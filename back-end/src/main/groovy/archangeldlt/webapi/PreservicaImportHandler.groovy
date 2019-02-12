package archangeldlt.webapi

import ratpack.form.Form
import ratpack.groovy.handling.GroovyContext
import ratpack.groovy.handling.GroovyHandler
import groovy.json.JsonSlurper
import javax.xml.transform.TransformerFactory
import javax.xml.transform.stream.StreamResult
import javax.xml.transform.stream.StreamSource
import static ratpack.jackson.Jackson.json

class PreservicaImportHandler extends GroovyHandler {
  @Override
  protected void handle(GroovyContext context) {
    def form = context.parse Form
    form.then {
      def sip = it.file('sip')
      if (!sip.fileName) {
        context.render "No file uploaded"
        return
      }

      File.createTempDir('archangel-droid', 'tmp').with { dir ->
        def file = new File(dir, sip.fileName)

        file.withOutputStream { os ->
          sip.writeTo(os)
        }

        def sipInfo = readSipFile(file)
        def sipJson = new JsonSlurper().parseText(sipInfo)

        file.delete()

        context.render json(sipJson)

        dir.delete()
      } // File.createTempDir
    } // upload
  } // handle

  private def readSipFile(sipFile) {
    def transformer = sipTransformer()

    def importedSip = new StringWriter()
    transformer.transform(
        new StreamSource(new FileReader(sipFile)),
        new StreamResult(importedSip)
    )

    return importedSip.toString()
  } // readSipString

  private def sipTransformer() {
    def factory = TransformerFactory.newInstance()
    def xsltResource = PreservicaImportHandler.class.getResourceAsStream("/preservica-extract.xsl")
    def xsltSource = new StreamSource(xsltResource)
    def transformer = factory.newTransformer(xsltSource)
    return transformer
  }
} // class UploadHandler


