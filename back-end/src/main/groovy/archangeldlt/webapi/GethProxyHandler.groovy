package archangeldlt.webapi

import ratpack.groovy.handling.GroovyContext
import ratpack.groovy.handling.GroovyHandler
import ratpack.http.TypedData
import ratpack.http.client.HttpClient
import ratpack.http.client.RequestSpec
import ratpack.http.client.StreamedResponse

class GethProxyHandler extends GroovyHandler {
  static def gethHost = System.getenv("HANDLER_GETH_HOST") ?: "geth"
  static def gethPort = System.getenv("HANDLER_GETH_PORT") ?: "8545"

  static def proxyUri = new URI("http://${gethHost}:${gethPort}")

  @Override
  protected void handle(GroovyContext context) {
    def request = context.request
    def response = context.response

    request.getBody().then { TypedData body ->
      def httpClient = context.get(HttpClient)

      httpClient.requestStream(proxyUri) { RequestSpec spec ->
        spec.method(request.method)

        spec.body.type(body.contentType.type)
        spec.body.bytes(body.bytes)

        spec.headers.copy(request.headers)
      }.then { StreamedResponse responseStream ->
        responseStream.forwardTo response
      }
    } // then
  } // handle
} // class TinyProxyHandler
