import ratpack.form.Form
import ratpack.groovy.handling.GroovyContext
import ratpack.groovy.handling.GroovyHandler
import ratpack.http.TypedData

import static archangeldlt.DroidWrapper.characterizeFile
import static archangeldlt.DroidWrapper.convertExportToJson
import static ratpack.groovy.Groovy.ratpack
import static ratpack.jackson.Jackson.json
import ratpack.http.client.HttpClient
import ratpack.http.client.RequestSpec
import ratpack.http.client.StreamedResponse

class TinyProxyHandler extends GroovyHandler {
  @Override
  protected void handle(GroovyContext context) {
    def request = context.request
    def response = context.response

    request.getBody().then { TypedData body ->
      def proxyUri = new URI('http://geth:8545')
      def httpClient = context.get(HttpClient)

      httpClient.requestStream(proxyUri) { RequestSpec spec ->
        spec.method(request.method)

        spec.body.type(body.contentType.type)
        spec.body.bytes(body.bytes)

        spec.headers.copy(request.headers)
      }.then { StreamedResponse responseStream ->
        responseStream.forwardTo(response)
      }
    }
  }
}

def tenMegs = 1048576 * 10

ratpack {
  serverConfig { conf ->
    conf.maxContentLength(tenMegs)
  }

  handlers {
    post("upload") {
      def form = parse Form
      form.then {
        def candidate = it.file('candidate')
        if (!candidate.fileName) {
          render "No file uploaded"
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

          render json(jsonExport)

          dir.delete()
        } // File.createTempDir
      } // upload
    } // post
    get("monitor") {
      redirect("/monitor/index.html")
    }
    get {
      redirect("/front-end/index.html")
    }
    prefix("monitor") {
      files {
        dir "monitor" indexFiles "index.html"
      }
    }
    prefix("front-end") {
      files {
        dir "front-end" indexFiles "index.html"
      }
    }
    post("geth", new TinyProxyHandler())
  }
}