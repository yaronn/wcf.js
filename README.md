## WCF.JS
A WCF-compatible web service client implementation for node.js. Written in pure javascript!

**Imagine this:**
    
    var binding = new WSHttpBinding(
          { MessageEncoding: "Mtom"
          , SecurityMode:"TransportWithMessageCredential"
          })
      , proxy = new Proxy(binding)      

    proxy.ClientCredentials.Username.Username = "yaron";
    proxy.ClientCredentials.Username.Password = "1234";

    proxy.send(message, function(response) {
      console.log(response)
    });

(See below for a complete sample)

**Currently supports a subset of:**

* BasicHttpBinding
* WSHttpBinding
* CustomBinding

**The current subset includes:**

* MTOM / Text encodings
* WS-Addressing (all versions)
* Transport Security (SSL)
* Transport with message credential (Username)

For more information visit my [wcf blog](http://webservices20.blogspot.com/).

## Install
Install with [npm](http://github.com/isaacs/npm):

    npm install wcf.js

## Usage

### BasicHttpBinding (TransportWithMessageCredential)
    var BasicHttpBinding = require('wcf.js').BasicHttpBinding
      , Proxy = require('wcf.js').Proxy
      , binding = new BasicHttpBinding(
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
      console.log(response)
    });

### CustomBinding (Mtom + UserNameOverTransport + WSAddressing10)
    var CustomBinding = require('wcf.js').CustomBinding
      , MtomMessageEncodingBindingElement = require('wcf.js').MtomMessageEncodingBindingElement
      , HttpTransportBindingElement = require('wcf.js').HttpTransportBindingElement
      , SecurityBindingElement = require('./lib/proxies/wcf.js').SecurityBindingElement
      , Proxy = require('wcf.js').Proxy
      , fs = require('fs')
      , binding = new CustomBinding(
            [ new SecurityBindingElement({AuthenticationMode: "UserNameOverTransport"})
            , new MtomMessageEncodingBindingElement({MessageVersion: "Soap12WSAddressing10"}),
            , new HttpTransportBindingElement()
            ])
      , proxy = new Proxy(binding, "http://localhost:7171/Service/mtom")
      , message = '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
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

    proxy.addAttachment("//*[local-name(.)='File1']", "me.jpg");
    proxy.addAttachment("//*[local-name(.)='File2']", "stuff.txt");

    proxy.ClientCredentials.Username.Username = "yaron";
    proxy.ClientCredentials.Username.Password = "1234";

    proxy.send(message, "http://tempuri.org/IService/EchoFiles", function(response, ctx) {
      console.log(response);
      //read an mtom attachment from the soap response
      var file = proxy.getAttachment("//*[local-name(.)='File1']")
      fs.writeFileSync("result.jpg", file)      
    });