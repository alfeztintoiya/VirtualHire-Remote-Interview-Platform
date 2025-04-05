import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Role = "candidate" | "recruiter";

const Signup: React.FC = () => {
  const [role, setRole] = useState<Role>("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Candidate fields
  const [collegeName, setCollegeName] = useState("");
  const [skills, setSkills] = useState("");

  // Recruiter fields
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [industry, setIndustry] = useState("");

  const [termsAgreed, setTermsAgreed] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      
      const payload =
        role === "candidate"
          ? { role, name, email, password, collegeName, skills }
          : { role, name, email, password, companyName, designation, industry };

      console.log(role);
      await axios.post("http://localhost:8011/auth/signup", payload, { withCredentials: true });
      console.log(1);
      window.location.href = "/login";
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="container flex flex-col px-4 py-8 mx-auto md:max-w-xl">
        
        <h1 className="mb-6 text-2xl font-semibold">Sign up</h1>

        
        <div className="flex mb-6 space-x-2">
          <button
            type="button"
            onClick={() => setRole("candidate")}
            className={`flex-1 rounded-md border px-3 py-2 text-center ${
              role === "candidate"
                ? "border-transparent bg-gray-200 font-medium"
                : "border-gray-300 bg-white"
            }`}
          >
            Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole("recruiter")}
            className={`flex-1 rounded-md border px-3 py-2 text-center ${
              role === "recruiter"
                ? "border-transparent bg-gray-200 font-medium"
                : "border-gray-300 bg-white"
            }`}
          >
            Recruiter
          </button>
        </div>

        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <Label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
              Name
            </Label>
            <Input
              type="text"
              id="name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          
          <div>
            <Label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          
          {role === "candidate" ? (
            <>
              
              <div>
                <Label htmlFor="collegeName" className="block mb-1 text-sm font-medium text-gray-700">
                  College Name
                </Label>
                <Input
                  type="text"
                  id="collegeName"
                  placeholder="Your College"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  required
                />
              </div>

              
              <div>
                <Label htmlFor="skills" className="block mb-1 text-sm font-medium text-gray-700">
                  Skills
                </Label>
                <Input
                  type="text"
                  id="skills"
                  placeholder="e.g. JavaScript, React"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              
              <div>
                <Label htmlFor="companyName" className="block mb-1 text-sm font-medium text-gray-700">
                  Company Name
                </Label>
                <Input
                  type="text"
                  id="companyName"
                  placeholder="Your Company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              
              <div>
                <Label htmlFor="designation" className="block mb-1 text-sm font-medium text-gray-700">
                  Designation
                </Label>
                <Input
                  type="text"
                  id="designation"
                  placeholder="HR Manager , "
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
              </div>

              
              <div>
                <Label htmlFor="industry" className="block mb-1 text-sm font-medium text-gray-700">
                  Industry
                </Label>
                <Input
                  type="text"
                  id="industry"
                  placeholder="e.g. Technology, Finance"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAgreed}
              onCheckedChange={(checked) => setTermsAgreed(!!checked)}
            />
            <Label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the Terms of Service
            </Label>
          </div>

          {/* Create Account Button */}
          <Button
            type="submit"
            className="w-full mt-4 text-white bg-green-500 hover:bg-green-600"
            disabled={!termsAgreed}
          >
            Create Account
          </Button>
        </form>

        {/* Already have an account? */}
        <div className="mt-4 text-sm text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-green-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
