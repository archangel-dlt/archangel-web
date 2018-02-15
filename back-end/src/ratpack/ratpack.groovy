import ratpack.form.Form

import static archangeldlt.DroidWrapper.characterizeFile
import static archangeldlt.DroidWrapper.convertExportToJson
import static ratpack.groovy.Groovy.ratpack
import static ratpack.jackson.Jackson.json

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
  }
}