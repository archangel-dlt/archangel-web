package archangeldlt.webapi

import ratpack.groovy.handling.GroovyContext
import ratpack.groovy.handling.GroovyHandler
import ratpack.http.TypedData
import ratpack.http.client.HttpClient
import ratpack.http.client.RequestSpec
import ratpack.http.client.StreamedResponse

class GethProxyHandler extends GroovyHandler {
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
        responseStream.forwardTo response
      }
    } // then
  } // handle
} // class TinyProxyHandler
