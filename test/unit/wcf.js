var wcf = require('../../lib/wcf.js')
  , utils = require('../../lib/utils.js')
  , ws = require('ws.js')

module.exports = {

  "basic http binding correctly translates to custom binding when there are settings": function (test) {        				
    var b = new wcf.BasicHttpBinding({
      SecurityMode:"TransportWithMessageCredential", 
      MessageClientCredentialType: "UserName",
      MessageEncoding: "Mtom"
    })

    var c = b.getCustomBinding()
    test.equal(3, c.channels.length, "wrong number of channels")
    test.equal("Soap11", c.channels[0].MessageVersion, "wrong soap message version")
    test.equal("UserNameOverTransport", c.channels[1].AuthenticationMode, 
              "wrong authentication mode")    
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

  "basic http binding correctly translates to custom binding with message level certificate": function (test) {
    var b = new wcf.BasicHttpBinding({ SecurityMode:"Message"
                                     , MessageClientCredentialType: "Certificate" })
    var c = b.getCustomBinding()
    test.equal(3, c.channels.length, "wrong number of channels")        
    test.equal("MutualCertificate", c.channels[1].AuthenticationMode, 
                "wrong authentication mode")
    test.done()
  },

  "wsHttp binding correctly translates to custom binding when there are settings": function (test) {        				
    var b = new wcf.WSHttpBinding({ SecurityMode:"TransportWithMessageCredential" 
				                          , MessageClientCredentialType: "UserName"
				                          , MessageEncoding: "Mtom"
    })
    var c = b.getCustomBinding()
    test.equal(3, c.channels.length, "wrong number of channels")
    test.equal("Soap12WSAddressing10", c.channels[0].MessageVersion, 
                "wrong soap message version")
    test.equal("UserNameOverTransport", c.channels[1].AuthenticationMode, 
                "wrong authentication mode")    
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

  "ws http binding correctly translates to custom binding with message level certificate": function (test) {
    var b = new wcf.WSHttpBinding({ SecurityMode:"Message"
                                     , MessageClientCredentialType: "Certificate" })
    var c = b.getCustomBinding()
    test.equal(3, c.channels.length, "wrong number of channels")        
    test.equal("MutualCertificate", c.channels[1].AuthenticationMode, 
                "wrong authentication mode")
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
    test.equal("WsAddressingClientHandler", utils.getTypeName(handlers[0], 
              "http handler not found"))              
    test.equal("http://schemas.xmlsoap.org/ws/2004/08/addressing", handlers[0].version, 
              "wrong addressing version found")
    test.equal("SecurityClientHandler", utils.getTypeName(handlers[1], 
              "http handler not found"))	
    test.equal("yaron", handlers[1].tokens[0].options.username, 
              "wrong username found")        
    test.equal("MtomClientHandler", utils.getTypeName(handlers[2], 
              "http handler not found"))
		test.equal("HttpClientHandler", utils.getTypeName(handlers[3], 
              "http handler not found"))
    test.done()
	},

   "custom binding correctly includes and excludes timestamp": function(test) {
    var sec1 = new wcf.SecurityBindingElement()
    var sec2 = new wcf.SecurityBindingElement()
    var sec3 = new wcf.SecurityBindingElement()
    sec2.IncludeTimestamp = true
    sec3.IncludeTimestamp = false

    var binding = new wcf.CustomBinding(
      [ sec1
      , sec2
      , sec3])  

    var proxy = new wcf.Proxy(binding, "dummy")    
    var handlers = binding.getHandlers(proxy)        

    test.equal("SecurityClientHandler", utils.getTypeName(handlers[0], 
              "http handler not found"))  
    test.equal(false, handlers[0].options.excludeTimestamp)

    test.equal("SecurityClientHandler", utils.getTypeName(handlers[1], 
              "http handler not found"))  
    test.equal(false, handlers[1].options.excludeTimestamp)

    test.equal("SecurityClientHandler", utils.getTypeName(handlers[2], 
              "http handler not found"))  
    test.equal(true, handlers[2].options.excludeTimestamp)
    
    test.done()
  },

  "custom binding correctly translated to handlers when there is only http channel": function(test) {
    var binding = new wcf.CustomBinding([new wcf.HttpTransportBindingElement()])		
    var handlers = binding.getHandlers()
    test.equal(1, handlers.length, "wrong number of handlers")
    test.equal("HttpClientHandler", utils.getTypeName(handlers[0], "http handler not found"))	
    test.done()
  },

  "custom binding correctly configures signature when no timestamp, wsa": function(test) {
    validateSignatureElement(test, false, false, 1)
  },


  "custom binding correctly configures signature with timestamp, wsa": function(test) {
    validateSignatureElement(test, true, true, 3)
  },

  "custom binding correctly configures signature validation": function(test) {
    validateSignatureElement(test, false, false, 1, true)
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
  },


  "wsa channel is always first": function (test) {
    var binding = new wcf.CustomBinding(
    [ new wcf.SecurityBindingElement({AuthenticationMode: "None"})
    , new wcf.TextMessageEncodingBindingElement({MessageVersion: "Soap12WSAddressingAugust2004"})
    , new wcf.HttpTransportBindingElement()
    ])    
    var handlers = binding.getHandlers()

    test.equal("WsAddressingClientHandler", utils.getTypeName(handlers[0])) 
    test.equal("SecurityClientHandler", utils.getTypeName(handlers[1])) 
    test.equal("HttpClientHandler", utils.getTypeName(handlers[2])) 

    test.done()
  }
  
}

function validateSignatureElement(test, includeTimestamp, hasWsa, expectedRef, validateResponseSignature) {
  
  var sec = new wcf.SecurityBindingElement(
    { AuthenticationMode: "MutualCertificate"
    , IncludeTimestamp: includeTimestamp
    , ValidateResponseSignature: validateResponseSignature})    


  var binding = new wcf.CustomBinding([ sec ])  
  var text = new wcf.TextMessageEncodingBindingElement({MessageVersion: "Soap12WSAddressing10"})
  if (hasWsa) binding.channels.push(text)
  var proxy = new wcf.Proxy(binding, "dummy")    
  proxy.ClientCredentials.ClientCertificate.Certificate = "dummy_client_cert"
  if (validateResponseSignature) {
    proxy.ClientCredentials.ServiceCertificate.DefaultCertificate = "dummy_server_cert"
  }

  var handlers = binding.getHandlers(proxy)

  var idx = hasWsa ? 1: 0;
  var security = handlers[idx]
  test.equal("SecurityClientHandler", utils.getTypeName(security, 
            "http handler not found"))  
  test.equal(2, security.tokens.length)    
  test.equals("X509BinarySecurityToken", utils.getTypeName(security.tokens[0]))        
  test.equals("Signature", utils.getTypeName(security.tokens[1]))  
  test.equals("dummy_client_cert", security.tokens[0].getKey())
  if (validateResponseSignature) {
    test.equals("dummy_server_cert", security.options.responseKeyInfoProvider.getKey())
  }
  var signedInfo = security.tokens[1].signature
  test.equal(expectedRef, signedInfo.references.length)  
  test.done()
}
