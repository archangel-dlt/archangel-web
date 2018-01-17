import ratpack.form.Form

import static archangeldlt.DroidWrapper.characterizeFile
import static archangeldlt.DroidWrapper.convertExportToJson
import static ratpack.groovy.Groovy.ratpack
import static ratpack.jackson.Jackson.json

ratpack {
  handlers {
    post("upload") {
      def form = parse Form
      form.then {
        def candidate = it.file('candidate')
        if (!candidate.fileName) {
          render "No file uploaded"
          return
        }

        File.createTempDir('archangel-droid', 'tmp').with { dir ->
          println "Created directory ${dir.name}"
          def file = new File(dir, candidate.fileName)
          println "Created file ${file.name}"

          file.withOutputStream { os ->
            candidate.writeTo(os)
          }
          def csvExport = characterizeFile(file.absolutePath)
          def jsonExport = convertExportToJson(csvExport)

          file.delete()

          render json(jsonExport)

          dir.delete()
        } // File.createTempDir
      } // upload
    } // post
    files {
      dir "front-end" indexFiles "index.html"
    }
  }
}