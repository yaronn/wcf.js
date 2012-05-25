using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using System.Net.Security;

/*
 * Want more WCF tips?
 * Visit http://webservices20.blogspot.com/
 *
 * Author: Yaron Naveh
 * Send feedback to yaronn01@gmail.com
 */

[ServiceContract(ProtectionLevel=ProtectionLevel.Sign)]
public interface IServiceSignOnly
{
    [OperationContract(Action = "http://tempuri.org/IService/GetData")]
    string GetData(int value);
}

// NOTE: If you change the interface name "IService" here, you must also update the reference to "IService" in Web.config.
[ServiceContract]
public interface IService
{

    [OperationContract]
    string GetData(int value);

    [OperationContract]
    Files EchoFiles(Files value);

    [OperationContract]
    byte[] EchoFile();

    [OperationContract]
    CompositeType GetDataUsingDataContract(CompositeType composite);

    // TODO: Add your service operations here
}

// Use a data contract as illustrated in the sample below to add composite types to service operations.
[DataContract]
public class CompositeType
{
    bool boolValue = true;
    string stringValue = "Hello ";

    [DataMember]
    public bool BoolValue
    {
        get { return boolValue; }
        set { boolValue = value; }
    }

    [DataMember]
    public string StringValue
    {
        get { return stringValue; }
        set { stringValue = value; }
    }
}

[DataContract]
public class Files
{
    [DataMember]
    public byte[] File1 {get; set;}

    [DataMember]
    public byte[] File2 { get; set; }
}
