using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ServiceModel;
using System.ServiceModel.Dispatcher;
using System.ServiceModel.Channels;

/*
 * Want more WCF tips?
 * Visit http://webservices20.blogspot.com/
 *
 * Author: Yaron Naveh
 * Send feedback to yaronn01@gmail.com
 */


namespace webservices20.blogspot.com
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine();
            Console.WriteLine();
            Console.WriteLine("***********************");
            Console.WriteLine("Want more WCF tips?");
            Console.WriteLine("Visit http://webservices20.blogspot.com/");
            Console.WriteLine();
            Console.WriteLine();
            Console.WriteLine("Author: Yaron Naveh");
            Console.WriteLine("Send feedback to yaronn01@gmail.com");
            Console.WriteLine("***********************");
            Console.WriteLine();
            Console.WriteLine();

            
            Console.WriteLine("Opening service...\r\n");
            try
            {
                using (ServiceHost host = new ServiceHost(typeof(Service)))
                {
                    host.Open();
                    PrintEndpoints(host);

                    NotifyHostOnStart();
                    
                    Console.WriteLine("\nPress enter to close service...\n");
                    Console.ReadLine();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(String.Format("Error: {0} \r\n {1}", e.Message, e.StackTrace));
                Console.ReadLine();
            }            

        }

        private static void NotifyHostOnStart()
        {
            Console.WriteLine("\nService Started\n");
        }

        /// <summary>
        /// print the endpoints of current service
        /// </summary>
        /// <param name="host"></param>
        private static void PrintEndpoints(ServiceHost host)
        {
            foreach (ChannelDispatcher cd in host.ChannelDispatchers)
            {
                foreach (EndpointDispatcher ed in cd.Endpoints)
                {
                    if (ed.ContractName == "IHttpGetHelpPageAndMetadataContract")
                        Console.WriteLine("Service metadata at {0}?wsdl", ed.EndpointAddress.Uri);
                    else
                        Console.WriteLine("Service listening at {0}", ed.EndpointAddress.Uri);
                }
            }
        }
    }
}
