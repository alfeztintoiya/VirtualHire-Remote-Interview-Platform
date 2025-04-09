import React, { useEffect, useState } from "react";
import { Link} from "react-router-dom";
import { Button } from "../ui/button";
import { Cookie } from "lucide-react";


interface User {
  name: string;
}


const generateProfileSVG = (name: string): string => {
    const firstLetter = name.charAt(0).toUpperCase();
    const ColorPicker = ["#334155","#374151","#dc2626","#65a30d","#0891b2","#0284c7","#db2777","#e11d48"];
    const bgColor = ColorPicker[Math.floor(Math.random()*ColorPicker.length)];
    const textColor = "#f0f9ff";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
        <rect width="200" height="100" fill="${bgColor}"/>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
        fill="${textColor}" font-size="50" font-family="Arial">
          ${firstLetter}
        </text>
      </svg>
    `;
    
    return "data:image/svg+xml;base64,"+btoa(svg);
};

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = document.cookie.includes("token");
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  
  const handleLogout = () => {
    
    localStorage.clear();

    const eqPos = document.cookie.indexOf("=");
    const name = eqPos > -1 ? document.cookie.substring(0,eqPos): document.cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;"
    window.location.href="/";
};

  return (
    <div className="bg-white text-foreground">
      <nav className="border-b border-gray-200">
          <div className="container flex items-center justify-between h-16 px-4 mx-auto">
            
            <Link to="/">
            <img src="/interviewLogo.jpeg" alt="VirtualHire Logo" className="w-auto h-10" />
            </Link>
            
            <div className="flex items-center space-x-6">
              
              

              { isAuthenticated && user ? (
                
                <div className="flex items-center space-x-2">
                  <Link to="/dashboard" >
                    <Button variant="secondary" className="cursor-pointer">Dashboard</Button>
                  </Link>
              
                  
                  <Button variant="primary" className="cursor-pointer" onClick={handleLogout}>Logout</Button>
                  <img
                    src={generateProfileSVG(user.name)}
                    alt="User Profile"
                    className="object-cover w-10 h-10 rounded-full"
                  />
                  <span className="text-lg font-medium">{user.name}</span>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="secondary">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="default" className="bg-green-500 hover:bg-green-600">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
  );
};

export default Navbar;
