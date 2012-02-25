var wcf = require('../../lib/wcf.js')
  , utils = require('../../lib/utils.js')

module.exports = {

  "basic http binding correctly translates to custom binding when there are settings": function (test) {        				
    var b = new wcf.BasicHttpBinding({
      SecurityMode:"TransportWithMessageCredential", 
      MessageClientCredentialType: "UserName",
      MessageEncoding: "Mtom"
    })

    var c = b.getCustomBinding()
    test.equal(3, c.channels.length, "wrong number of channels")
    test.equal("UserNameOverTransport", c.channels[0].AuthenticationMode, 
              "wrong authentication mode")
    test.equal("Soap11", c.channels[1].MessageVersion, "wrong soap message version")
    test.equal("HttpsTransportBindingElement", utils.getTypeName(c.channels[2]), 
              "wrong soap message version")
    test.done()
	},

  "basic http binding correctly translates to custom binding when there are no settings": function (test) {
    var b = new wcf.BasicHttpBinding({})
    var c = b.getCustomBinding()
    test.equal(2, c.channels.length, "wrong number of channels")		
    test.equal("Soap11", c.channels[0].MessageVersion, "wrong soap message version")
    test.equal("HttpTransportBindingElement", utils.getTypeName(c.channels[1]), 
                "wrong soap message version")
    test.done()
	},

  "wsHttp binding correctly translates to custom binding when there are settings": function (test) {        				
    var b = new wcf.WSHttpBinding({ SecurityMode:"TransportWithMessageCredential" 
				                          , MessageClientCredentialType: "UserName"
				                          , MessageEncoding: "Mtom"
    })
    var c = b.getCustomBinding()
    test.equal(3, c.channels.length, "wrong number of channels")
    test.equal("UserNameOverTransport", c.channels[0].AuthenticationMode, 
                "wrong authentication mode")
    test.equal("Soap12WSAddressing10", c.channels[1].MessageVersion, 
                "wrong soap message version")
    test.equal("HttpsTransportBindingElement", utils.getTypeName(c.channels[2]), 
                "wrong soap message version")
    test.done()
  },


  "wsHttp binding correctly translates to custom binding when there are no settings": function (test) {
    var b = new wcf.WSHttpBinding()
      , c = b.getCustomBinding()
    test.equal(2, c.channels.length, "wrong number of channels")		
    test.equal("Soap12WSAddressing10", c.channels[0].MessageVersion, "wrong soap message version")
    test.equal("HttpTransportBindingElement", utils.getTypeName(c.channels[1]), "wrong soap message version")
    test.done()
	},

  "custom binding correctly translated to handlers when there are addressing and security": function(test) {
    var binding = new wcf.CustomBinding([
      new wcf.SecurityBindingElement({AuthenticationMode: "UserNameOverTransport"}),
      new wcf.MtomMessageEncodingBindingElement({MessageVersion: "Soap11WSAddressingAugust2004"}),
      new wcf.HttpsTransportBindingElement()
    ])	

    var proxy = new wcf.Proxy(binding, "dummy")
    proxy.ClientCredentials.Username.Username = "yaron"
    var handlers = binding.getHandlers(proxy)
    
    test.equal(4, handlers.length, "wrong number of handlers")
    test.equal("SecurityClientHandler", utils.getTypeName(handlers[0], 
              "http handler not found"))	
    test.equal("yaron", handlers[0].tokens[0].options.username, 
              "wrong username found")    
    test.equal("WsAddressingClientHandler", utils.getTypeName(handlers[1], 
              "http handler not found"))	            
    test.equal("http://schemas.xmlsoap.org/ws/2004/08/addressing", handlers[1].version, 
              "wrong addressing version found")
    test.equal("MtomClientHandler", utils.getTypeName(handlers[2], 
              "http handler not found"))
		test.equal("HttpClientHandler", utils.getTypeName(handlers[3], 
              "http handler not found"))
    test.done()
	},

  "custom binding correctly translated to handlers when there is only http channel": function(test) {
    var binding = new wcf.CustomBinding([new wcf.HttpTransportBindingElement()])		
    var handlers = binding.getHandlers()
    test.equal(1, handlers.length, "wrong number of handlers")
    test.equal("HttpClientHandler", utils.getTypeName(handlers[0], "http handler not found"))	
    test.done()
  },

  "custom binding correctly identifies soap11": function (test) {
    var binding = new wcf.CustomBinding([new wcf.HttpTransportBindingElement()])		
    test.equal("text/xml", binding.getContentType())
    test.done()
  },

  "custom binding correctly identifies soap12": function (test) {
    var binding = new wcf.CustomBinding([		
      new wcf.MtomMessageEncodingBindingElement({MessageVersion: "Soap12WSAddressingAugust2004"}),
      new wcf.HttpTransportBindingElement()
    ])		
    test.equal("application/soap+xml", binding.getContentType())
    test.done()
  }
}
