var ws = require('ws.js')
  , utils = require('./utils.js')
  , FileKeyInfo = require('xml-crypto').FileKeyInfo

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
  this.handlers = null
  this.attachments = []
  this.ClientCredentials = {}
  this.ClientCredentials.Username = {}
  this.ClientCredentials.ClientCertificate = {}
  this.ClientCredentials.ServiceCertificate = {}

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
    var channels = []
    
    if (this.MessageEncoding && this.MessageEncoding.toLowerCase()=="mtom") {
      channels.push(new MtomMessageEncodingBindingElement({MessageVersion: "Soap11" }))
    }
    else {
      channels.push(new TextMessageEncodingBindingElement({MessageVersion: "Soap11" }))
    } 

    if (this.SecurityMode=="TransportWithMessageCredential"
        && this.MessageClientCredentialType == "UserName") {						
          channels.push(new SecurityBindingElement({
                          AuthenticationMode: "UserNameOverTransport"}));						
    }
    else if (this.SecurityMode=="Message"
        && this.MessageClientCredentialType == "Certificate") {            
          channels.push(new SecurityBindingElement({
                          AuthenticationMode: "MutualCertificate"}));           
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

    if (this.MessageEncoding && this.MessageEncoding.toLowerCase()=="mtom") {
      channels.push(new MtomMessageEncodingBindingElement(
         {MessageVersion: "Soap12WSAddressing10" }))
    }
    else {
      channels.push(new TextMessageEncodingBindingElement({
                        MessageVersion: "Soap12WSAddressing10" }))
    }   

    if (this.SecurityMode=="TransportWithMessageCredential"
        && this.MessageClientCredentialType == "UserName") {					
          channels.push(new SecurityBindingElement({
  	                    AuthenticationMode: "UserNameOverTransport"}))					
    }
    else if (this.SecurityMode=="Message"
        && this.MessageClientCredentialType == "Certificate") {            
          channels.push(new SecurityBindingElement({
                          AuthenticationMode: "MutualCertificate"}));           
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
      this.channels[i].process(handlers, proxy, channels)		
    }			
    return handlers
  }	
}

function AddAddressing(addr, handlers)
{
  if (!addr) return
  var v = messageVersionToAddressingVersion(addr)
  //we unshift and not pop. wsa channel must be first so it is before security.
  //otherwise security cannot sign the wsa.
  if (v) handlers.unshift(new ws.Addr(v))
}

function messageVersionToAddressingVersion(version) {
  if (version.indexOf("WSAddressingAugust2004")!=-1)  {
    return AddressingMap["WSAddressingAugust2004"]
  }
  if (version.indexOf("WSAddressing10")!=-1) {
    return AddressingMap["WSAddressing10"]
  }  
  return null
}

function MtomMessageEncodingBindingElement(options)
{	
  //set defaults	
  this.MessageVersion = "Soap12WSAddressing10"
  utils.unifyProperties(options, this)	
  
  this.process = function(handlers, proxy, wcfChannels) {
    AddAddressing(this.MessageVersion, handlers)
    handlers.push(new ws.Mtom())
  }
}

function TextMessageEncodingBindingElement(options) {	
  //set defaults	
  this.MessageVersion = "Soap11"
  utils.unifyProperties(options, this)
  
  this.process = function(handlers, proxy, wcfChannels) {		
    AddAddressing(this.MessageVersion, handlers)
  }
}

function HttpTransportBindingElement(options) {
  
  this.process = function(handlers, proxy, wcfChannels) {
    handlers.push(new ws.Http());
  }
}

function HttpsTransportBindingElement(options) {
  
  this.process = function(handlers, proxy, wcfChannels) {
    handlers.push(new ws.Http())
  }
}

function FixedKeyInfo(key) {
  
  this.getKey = function(keyInfo) {      
    return key
  }
}

function SecurityBindingElement(options) {

  utils.unifyProperties(options, this)  
  if (this.IncludeTimestamp==undefined) this.IncludeTimestamp = true
  if (this.ValidateResponseSignature==undefined) this.ValidateResponseSignature = false

  this.process = function(handlers, proxy, wcfChannels) {    
    var tokens = [];	
    var sec = new ws.Security()

    if (this.AuthenticationMode == "UserNameOverTransport") {				
      tokens = [new ws.UsernameToken({
                  username: proxy.ClientCredentials.Username.Username, 
					        password: proxy.ClientCredentials.Username.Password})]
    }

    if (this.AuthenticationMode == "MutualCertificate") {       
      var x509 = new ws.X509BinarySecurityToken(
        { "key": proxy.ClientCredentials.ClientCertificate.Certificate})
      var signature = new ws.Signature(x509)      
      this.addPrimarySignatureReferences(signature, wcfChannels)
      if (this.ValidateResponseSignature)
      {
        sec.options.responseKeyInfoProvider = new FixedKeyInfo(
          proxy.ClientCredentials.ServiceCertificate.DefaultCertificate)
      }

      tokens = [x509, signature]
    }
    
    sec.tokens = tokens
    if (!this.IncludeTimestamp) sec.options.excludeTimestamp = true
    handlers.push(sec)
  }

  this.addPrimarySignatureReferences = function(signature, wcfChannels) {
    signature.addReference("//*[local-name(.)='Body']")    
    if (this.IncludeTimestamp) signature.addReference("//*[local-name(.)='Timestamp']")
    var wsa = this.getWsaVersion(wcfChannels)    
    if (wsa) signature.addReference("//*[namespace-uri(.)='" + wsa + "' and local-name(.)!='Address']")    
  }

  this.getWsaVersion = function(wcfChannels) {        
    for (var c in wcfChannels) {      
      var v = wcfChannels[c].MessageVersion
      if (v) return messageVersionToAddressingVersion(v)
    }
    return null
  }
}

var AddressingMap = { "WSAddressingAugust2004": "http://schemas.xmlsoap.org/ws/2004/08/addressing"
                    , "WSAddressing10": "http://www.w3.org/2005/08/addressing"
                    }
