exports.soapTest = function(test, proxy, validator) {	
  var version = proxy.binding.getCustomBinding().getContentType()	
  , ns = version=="text/xml" ? 
    "http://schemas.xmlsoap.org/soap/envelope/" : 
    "http://www.w3.org/2003/05/soap-envelope"
  , message = "<Envelope xmlns='"+ns+"'>" +
                "<Header />" +
                  "<Body>" +
                    "<GetData xmlns='http://tempuri.org/'>" +
                      "<value>123</value>" +
                    "</GetData>" +
                  "</Body>" +
              "</Envelope>"

  proxy.send(message, "http://tempuri.org/IService/GetData", function(message, ctx) {
    test.equal(200, ctx.statusCode, "status code shows an error")
    test.equal(null, ctx.error, "there was an error")
    if (message.indexOf("You entered: 123")==-1) {
     test.fail("response does not contain 'You entered: 123'. Response is: " + ctx.response)
   }
   if (validator) validator(test, ctx)
   test.done()
  })
}


exports.setUp = function (callback) {
  this.wcf = require('child_process').spawn('./test/integration/working-services/service-c#/service/bin/Debug/service.exe')
  this.up = false
  this.wcf.stdout.on('data', function (data) {                  
    if (this.up) return
    if (data.toString().indexOf("Service Started")==-1) return          
    this.up=true
    callback()
  })    
}

exports.tearDown = function (callback) {    
  this.wcf.kill()
  callback()
}