using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using System.IO;

/*
 * Want more WCF tips?
 * Visit http://webservices20.blogspot.com/
 *
 * Author: Yaron Naveh
 * Send feedback to yaronn01@gmail.com
 */



// NOTE: If you change the class name "Service" here, you must also update the reference to "Service" in Web.config and in the associated .svc file.
public class Service : IService, IServiceSignOnly
{
    public string GetData(int value)
    {
        Console.WriteLine(String.Format("GetDate({0})", value));
            
        return string.Format("You entered: {0}", value);
    }   

    public CompositeType GetDataUsingDataContract(CompositeType composite)
    {

        Console.WriteLine(String.Format("GetDataUsingDataContract(Composite({0}, {1})", composite.BoolValue, composite.StringValue));

        if (composite.BoolValue)
        {
            composite.StringValue += "Suffix";
        }
        return composite;
    }

    #region IService Members


    public Files EchoFiles(Files value)
    {
        return value;
    }

    public byte[] EchoFile()
    {
        return File.ReadAllBytes(@"C:/temp/ubuntu.PNG");
    }

    #endregion
}
