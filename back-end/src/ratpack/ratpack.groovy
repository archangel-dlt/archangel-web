import archangeldlt.webapi.GethProxyHandler
import archangeldlt.webapi.UploadHandler

import static ratpack.groovy.Groovy.ratpack

def tenMegs = 1048576 * 10
def uploadLimit = tenMegs

ratpack {
  serverConfig { conf ->
    conf.maxContentLength(uploadLimit)
  }

  handlers {
    post("upload", new UploadHandler())

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

    post("geth", new GethProxyHandler())
  }
}