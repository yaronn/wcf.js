var wcf = require('wcf.js')    
, fs = require("fs")

var sec = new wcf.SecurityBindingElement({ AuthenticationMode: "MutualCertificate"
 , ValidateResponseSignature: true})
 , binding = new wcf.CustomBinding(
  [ sec
  , new wcf.TextMessageEncodingBindingElement({MessageVersion: "Soap11WSAddressing10"})
  , new wcf.HttpTransportBindingElement()
  ])

var proxy = new wcf.Proxy(binding, "http://localhost:7171/Service/sign_body_timestamp_wsa")
proxy.ClientCredentials.ClientCertificate.Certificate = 
fs.readFileSync("client.pem").toString()
proxy.ClientCredentials.ServiceCertificate.DefaultCertificate = 
fs.readFileSync("server_public.pem").toString()    

  message = "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
                "<Header />" +
                  "<Body>" +
                    "<GetData xmlns='http://tempuri.org/'>" +
                      "<value>123</value>" +
                    "</GetData>" +
                  "</Body>" +
              "</Envelope>"

proxy.send(message, "http://tempuri.org/IService/GetData", function(message, ctx) {
  console.log(ctx)
})


