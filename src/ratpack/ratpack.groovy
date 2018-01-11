import ratpack.form.Form

import static archangeldlt.DroidWrapper.characterizeFile
import static archangeldlt.DroidWrapper.convertExportToJson
import static ratpack.groovy.Groovy.htmlBuilder
import static ratpack.groovy.Groovy.ratpack

ratpack {
  handlers {
    get ("form") {
      render htmlBuilder {
        html {
          head {
            title "Hello"
          }
          body {
            form (action: 'upload', method: 'post', enctype: 'multipart/form-data') {
              input (type: 'file', name: 'candidate', id: 'candidate') { }
              input (type: 'submit', value: 'Droid!', name: 'submit') { }
            }
          }
        }
      }
    }
    post("upload") {
      def form = parse Form
      form.then {
        def candidate = it.file('candidate')
        if (!candidate.fileName) {
          render "No file uploaded"
          return
        }
        File.createTempFile("archangel-droid", ".tmp").with { file ->
          file.withOutputStream { os ->
            candidate.writeTo(os)
          }
          def csvExport = characterizeFile(file.absolutePath)
          def jsonExport = convertExportToJson(csvExport)

          file.delete()

          render jsonExport
        }
      }
    } // post
    files {
      dir "public" indexFiles "index.html"
    }
  }
}