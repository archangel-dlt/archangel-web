import static ratpack.groovy.Groovy.htmlBuilder
import static ratpack.groovy.Groovy.ratpack

ratpack {
  handlers {
    get {
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
    get(":name") {
      render "Hello $pathTokens.name!"
    }
  }
}