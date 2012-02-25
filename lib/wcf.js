var ws = require('ws.js')
  , utils = require('./utils.js')  

exports.Proxy = Proxy
exports.BasicHttpBinding = BasicHttpBinding
exports.WSHttpBinding = WSHttpBinding
exports.CustomBinding = CustomBinding
exports.MtomMessageEncodingBindingElement = MtomMessageEncodingBindingElement
exports.TextMessageEncodingBindingElement = TextMessageEncodingBindingElement
exports.HttpTransportBindingElement = HttpTransportBindingElement
exports.HttpsTransportBindingElement = HttpTransportBindingElement
exports.SecurityBindingElement = SecurityBindingElement

function Proxy(binding, url) {
  this.context = {url: url}
  this.binding = binding
  this.hanlders = null
  this.attachments = []
  this.ClientCredentials = {}
  this.ClientCredentials.Username = {}

  this.addAttachment = function (xpath, file) {
    this.attachments.push({xpath: xpath, file: file})
  }

  this.getAttachment = function (xpath) {
    return ws.getAttachment(this.context, "response", xpath)
  }

  this.cleanAttachments = function () {
    this.attachments = []
  }

  this.send = function(message, action, callback) {				
    var custom = this.binding.getCustomBinding()
    if (this.handlers==null) {
      this.handlers = this.binding.getCustomBinding().getHandlers(this)
    }
		
    this.context.request = message
    this.context.action = action
    this.context.contentType = custom.getContentType()

    for (var i in this.attachments) {
      ws.addAttachment(
      this.context, 
      "request", 
      this.attachments[i].xpath, 
      this.attachments[i].file, 
      "application/octet-stream")		
    }

    ws.send(this.handlers, this.context, function(ctx) {
      callback(ctx.response, ctx)})
    }
}

function BasicHttpBinding(options) {	
  utils.unifyProperties(options, this)
  
  this.getCustomBinding = function() {
    if (this.customBinding) return this.customBinding;
    var channels = [];
    if (this.SecurityMode=="TransportWithMessageCredential"
        && this.MessageClientCredentialType == "UserName") {						
          channels.push(new SecurityBindingElement({
                          AuthenticationMode: "UserNameOverTransport"}));						
    }
    if (this.MessageEncoding && this.MessageEncoding.toLowerCase()=="mtom") {
      channels.push(new MtomMessageEncodingBindingElement({MessageVersion: "Soap11" }))
    }
    else {
      channels.push(new TextMessageEncodingBindingElement({MessageVersion: "Soap11" }))
    }	
    if (this.SecurityMode=="TransportWithMessageCredential") {
      channels.push(new HttpsTransportBindingElement());	
    }
    else {
      channels.push(new HttpTransportBindingElement)
    }
    this.customBinding = new CustomBinding(channels, [])
    return this.customBinding
  }

  this.getHandlers = function(proxy) {		
    var custom = this.getCustomBinding()
    return custom.getHandlers(proxy)
  }
}

function WSHttpBinding(options) {
  utils.unifyProperties(options, this)
  
  this.getCustomBinding = function() {		
    if (this.customBinding) return this.customBinding
    var channels = [];
    if (this.SecurityMode=="TransportWithMessageCredential"
        && this.MessageClientCredentialType == "UserName") {					
          channels.push(new SecurityBindingElement({
  	                    AuthenticationMode: "UsernameOverTransport"}))					
    }
    if (this.MessageEncoding && this.MessageEncoding.toLowerCase()=="mtom") {
      channels.push(new MtomMessageEncodingBindingElement(
         {MessageVersion: "Soap12WSAddressing10" }))
    }
    else {
      channels.push(new TextMessageEncodingBindingElement({
  	                    MessageVersion: "Soap12WSAddressing10" }))
    }		
    if (this.SecurityMode=="TransportWithMessageCredential") {
      channels.push(new HttpsTransportBindingElement())	
    }
    else {
      channels.push(new HttpTransportBindingElement)
    }
    this.customBinding = new CustomBinding(channels, [])
    return this.customBinding
  }

  this.getHandlers = function(proxy) {		
    var custom = this.getCustomBinding()
    return custom.getHandlers(proxy)
  }
}

function CustomBinding(channels, options) {
  this.channels = channels
  utils.unifyProperties(options, this)

  this.getCustomBinding = function() {
    return this;
  }

  this.getContentType = function() {
    for (var i in this.channels) {
      if (this.channels[i].MessageVersion 
        && this.channels[i].MessageVersion.indexOf("Soap12")!=-1) {
          return "application/soap+xml"
      }
    }		
    return "text/xml";
  }

  this.getHandlers = function(proxy) {
    var handlers = [];
    for (var i in channels) {
      this.channels[i].process(handlers, proxy)		
    }			
    return handlers
  }	
}

function AddAddressing(addr, handlers)
{
  if (!addr) return
  if (addr.indexOf("WSAddressingAugust2004")!=-1)	{
    handlers.push(new ws.Addr("http://schemas.xmlsoap.org/ws/2004/08/addressing"))
  }
	if (addr.indexOf("WSAddressing10")!=-1)	{
    handlers.push(new ws.Addr("http://www.w3.org/2005/08/addressing"))
  }
}

function MtomMessageEncodingBindingElement(options)
{	
  //set defaults	
  this.MessageVersion = "Soap12WSAddressing10"
  utils.unifyProperties(options, this)	
  
  this.process = function(handlers, proxy) {
    AddAddressing(this.MessageVersion, handlers)
    handlers.push(new ws.Mtom())		
  }
}

function TextMessageEncodingBindingElement(options) {	
  //set defaults	
  this.MessageVersion = "Soap11"
  utils.unifyProperties(options, this)
  
  this.process = function(handlers, proxy) {		
    AddAddressing(this.MessageVersion, handlers)
  }
}

function HttpTransportBindingElement(options) {
  
  this.process = function(handlers, proxy) {
    handlers.push(new ws.Http());
  }
}

function HttpsTransportBindingElement(options) {
  
  this.process = function(handlers, proxy) {
    handlers.push(new ws.Http());
  }

}

function SecurityBindingElement(options) {
  utils.unifyProperties(options, this);
  
  this.process = function(handlers, proxy) {
    var tokens = [];	
    if (this.AuthenticationMode == "UserNameOverTransport") {				
      tokens = [new ws.UsernameToken({
                  username: proxy.ClientCredentials.Username.Username, 
					        password: proxy.ClientCredentials.Username.Password})];
    }
    handlers.push(new ws.Security({}, tokens));
  }
}