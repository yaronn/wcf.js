var wcf = require('../lib/wcf.js')
  , fs = require("fs")
  , BasicHttpBinding = require('../lib/wcf.js').BasicHttpBinding
  , Proxy = require('../lib/wcf.js').Proxy

function testBasicHttpWithSecurity() {
  var binding = new BasicHttpBinding(
        { SecurityMode: "TransportWithMessageCredential"
        , MessageClientCredentialType: "UserName"
        })
    , proxy = new Proxy(binding, "http://localhost:7171/Service/clearUsername")
    , message =  "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
                   "<Header />" +
                     "<Body>" +
                       "<GetData xmlns='http://tempuri.org/'>" +
                         "<value>123</value>" +
                       "</GetData>" +
                      "</Body>" +
                 "</Envelope>";

proxy.ClientCredentials.Username.Username = "yaron";
proxy.ClientCredentials.Username.Password = "1234";

proxy.send(message, "http://tempuri.org/IService/GetData", function(response, ctx) {
  console.log("\r\n");
  console.log("***basic http");
  console.log(response)
});
}

function testCustomWithMtom() {
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
      console.log("\r\n");
      console.log("***mtom");
      var file = proxy.getAttachment("//*[local-name(.)='File1']")
      fs.writeFileSync("c:/temp/res.jpg", file)   
    });  
}


testBasicHttpWithSecurity();
testCustomWithMtom();
