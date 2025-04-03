import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Replace these images with your own or from a CDN
const heroImage = "https://cdn.usegalileo.ai/sdxl10/9faa4b93-dee9-45cd-b4a7-5fd24e9d8e0f.png";
const featureImage1 = "https://cdn.usegalileo.ai/sdxl10/69295ffe-7590-4be0-bd03-c4b2e86c8599.png";
const featureImage2 = "https://cdn.usegalileo.ai/sdxl10/df1121a9-97fe-4819-85ac-87d745e6b6da.png";
const testimonialImage1 = "https://cdn.usegalileo.ai/sdxl10/e8ceecd9-43b1-41e5-92b8-8c0f63a91cc8.png";
const testimonialImage2 = "https://cdn.usegalileo.ai/sdxl10/d40d555d-113d-4947-946a-e3662dd35c20.png";
const testimonialImage3 = "https://cdn.usegalileo.ai/sdxl10/2e58a568-aa50-44e4-9391-dbb85b43a4dc.png";

const Home: React.FC = () => {
  return (
    <div className="bg-white text-foreground">
      {/* HERO SECTION */}
      <section className="container flex flex-col-reverse items-center gap-8 px-4 py-12 mx-auto md:flex-row md:py-20">
        {/* Text Content */}
        <div className="space-y-6 md:w-1/2">
          <h1 className="text-4xl font-bold md:text-5xl">
            Elevate Your Hiring Process with Seamless Virtual Assessments
          </h1>
          <p className="text-lg text-gray-600">
            Connect with global talent through engaging virtual interviews and
            comprehensive skill assessments. Empower your hiring team to
            confidently select the best candidates, faster.
          </p>
          <Button
            variant="default"
            className="bg-green-500 hover:bg-green-600"
          >
            Get Started
          </Button>
        </div>
        {/* Image / Illustration */}
        <div className="flex justify-center md:w-1/2">
          <img
            src={heroImage}
            alt="Hero Illustration"
            className="max-w-full rounded-md shadow-md"
          />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 mx-auto">
          <h2 className="mb-6 text-3xl font-bold">
            Key Features to Streamline Your Selection
          </h2>
          <p className="mb-10 text-gray-600">
            From live coding sessions to video interviews, VirtualHire offers a
            suite of tools that let you spend more time on the human element and
            less on logistics.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Feature 1 */}
            <div className="flex flex-col items-start space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <img
                src={featureImage1}
                alt="Live Coding Assessments"
                className="object-cover w-48 h-48 rounded-md"
              />
              <div>
                <h3 className="text-xl font-semibold">Live Coding Assessments</h3>
                <p className="mt-2 text-gray-600">
                  Assess candidates in real-time with interactive coding
                  challenges. Evaluate problem-solving skills and code quality
                  on the spot.
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-start space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <img
                src={featureImage2}
                alt="Interactive Video Interviews"
                className="object-cover w-48 h-48 rounded-md"
              />
              <div>
                <h3 className="text-xl font-semibold">Interactive Video Interviews</h3>
                <p className="mt-2 text-gray-600">
                  Conduct remote interviews with ease. Share documents, whiteboard
                  ideas, and gauge communication skills—all in one platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="container px-4 py-12 mx-auto">
        <h2 className="mb-8 text-3xl font-bold">What Our Users Say</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Testimonial 1 */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <img
                  src={testimonialImage1}
                  alt="User 1"
                  className="object-cover w-16 h-16 rounded-full"
                />
                <div>
                  <CardTitle>Sophie Chen, Talent Acquisition</CardTitle>
                  <p className="text-sm text-gray-500">TechCorp Inc.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                “VirtualHire helped us reduce time-to-hire by 40%. The live
                coding feature is a game-changer for screening developers.”
              </p>
            </CardContent>
          </Card>

          {/* Testimonial 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <img
                  src={testimonialImage2}
                  alt="User 2"
                  className="object-cover w-16 h-16 rounded-full"
                />
                <div>
                  <CardTitle>David Ramirez, Lead Engineer</CardTitle>
                  <p className="text-sm text-gray-500">Innova Labs</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                “The platform’s coding tests let us quickly identify top talent.
                Our team loves the real-time collaboration tools.”
              </p>
            </CardContent>
          </Card>

          {/* Testimonial 3 */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <img
                  src={testimonialImage3}
                  alt="User 3"
                  className="object-cover w-16 h-16 rounded-full"
                />
                <div>
                  <CardTitle>Emily Weng, HR Manager</CardTitle>
                  <p className="text-sm text-gray-500">BrightVision</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                “We used to juggle multiple tools for remote interviews. Now,
                everything is in one place, and candidates love the experience.”
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="mb-6 text-gray-600">
            Experience seamless virtual assessments and streamlined interviewing
            with VirtualHire.
          </p>
          <Link to="/signup">
            <Button variant="default" className="bg-green-500 hover:bg-green-600">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-4 border-t border-gray-200">
        <div className="container flex flex-col items-center justify-between px-4 mx-auto space-y-2 md:flex-row">
          <p className="text-sm text-gray-500">
            ©2025 VirtualHire. All rights reserved.
          </p>
          <div className="flex space-x-4 text-sm">
            <Link to="#" className="text-gray-600 hover:underline">
              Privacy Policy
            </Link>
            <Link to="#" className="text-gray-600 hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
