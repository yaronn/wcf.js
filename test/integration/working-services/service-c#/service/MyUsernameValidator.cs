using System;
using System.Collections.Generic;
using System.IdentityModel.Selectors;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Text;


/*
 * Want more WCF tips?
 * Visit http://webservices20.blogspot.com/
 */


public class MyUserNameValidator : UserNamePasswordValidator
{
    public override void Validate(string userName, string password)
    {
        if (userName != "yaron")
            throw new SecurityTokenException("Unknown Username or Password");
    }
}

