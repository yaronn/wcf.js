var wcf = require('../../lib/wcf.js')
  , utils = require('../utils.js')  
  , assert = require("assert")
  , fs = require("fs")

module.exports = {
	
  setUp: function (callback) {        
    utils.setUp.call(this, callback);
  },

  tearDown: function (callback) {    
    utils.tearDown.call(this, callback);
  },
    
  "simple basic http": function (test) {
    var binding = new wcf.BasicHttpBinding()
      , proxy = new wcf.Proxy(binding, "http://localhost:7171/Service/simple-soap")
    utils.soapTest(test, proxy)
	},

  "simple custom": function (test) {
    var binding = new wcf.CustomBinding([new wcf.HttpTransportBindingElement()])
      , proxy = new wcf.Proxy(binding, "http://localhost:7171/Service/simple-soap")
    utils.soapTest(test, proxy)
  },

  "custom soap12wsa10": function (test) {
    var binding = new wcf.CustomBinding([		
      new wcf.TextMessageEncodingBindingElement({MessageVersion: "Soap12WSAddressing10"}),
      new wcf.HttpTransportBindingElement()
    ])
			
    var proxy = new wcf.Proxy(binding, "http://localhost:7171/Service/soap12wsa10")
    utils.soapTest(test, proxy);
  },

  "custom clearUsername": function (test) {
    var binding = new wcf.CustomBinding([		
      new wcf.SecurityBindingElement({AuthenticationMode: "UserNameOverTransport"}),
      new wcf.HttpTransportBindingElement()
    ]);
			
    var proxy = new wcf.Proxy(binding, "http://localhost:7171/Service/clearUsername")
    proxy.ClientCredentials.Username.Username = "yaron"
    proxy.ClientCredentials.Username.Password = "1234"
    utils.soapTest(test, proxy)
	},

  "basic clearUsername": function (test) {		
    var binding = new wcf.BasicHttpBinding({
        SecurityMode:"TransportWithMessageCredential"
        , MessageClientCredentialType: "UserName"
      })		
      , proxy = new wcf.Proxy(binding, "http://localhost:7171/Service/clearUsername")

    proxy.ClientCredentials.Username.Username = "yaron"
    proxy.ClientCredentials.Username.Password = "1234"
    utils.soapTest(test, proxy)
	},

  "custom mtom": function (test) {		
    var message = '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
                    '<s:Header />' +
                      '<s:Body>' +
                        '<EchoFiles xmlns="http://tempuri.org/">' +
                          '<value xmlns:a="http://schemas.datacontract.org/2004/07/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">' +
                            '<a:File1 />' +
                            '<a:File2 />' +
                          '</value>' +
                        '</EchoFiles>' +
                      '</s:Body>' +
                  '</s:Envelope>'
    var binding = new wcf.CustomBinding([					
      new wcf.MtomMessageEncodingBindingElement({MessageVersion: "Soap12WSAddressing10"}),
      new wcf.HttpTransportBindingElement()
    ])
		  , proxy = new wcf.Proxy(binding, "http://localhost:7171/Service/mtom")
    proxy.addAttachment("//*[local-name(.)='File1']", "./test/files/p.jpg")
    proxy.addAttachment("//*[local-name(.)='File2']", "./test/files/text.txt")
    proxy.send(message, "http://tempuri.org/IService/EchoFiles", function(message, ctx) {											
      var attach = proxy.getAttachment("//*[local-name(.)='File1']")
      assert.deepEqual(fs.readFileSync("./test//files/p.jpg"), 
                       attach, 
                       "attachment 1 is not the jpg file");
      var attach = proxy.getAttachment("//*[local-name(.)='File2']")
      assert.deepEqual(fs.readFileSync("./test/files/text.txt"), 
                       attach, 
                       "attachment 2 is not the txt file")						
      test.done();
    });
  },

}