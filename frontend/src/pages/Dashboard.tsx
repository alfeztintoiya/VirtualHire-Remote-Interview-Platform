import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-foreground">

      {/* DASHBOARD CONTENT */}
      <div className="container px-4 py-8 mx-auto">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">
          Dashboard
        </h2>
        <p className="mb-6 text-gray-700">
          Manage your interviews and activities seamlessly.
        </p>

        {/* CARD GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* New Call */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">New Call</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Start an instant call for interviews.
              </p>
              <Button variant="default" className="w-full text-white bg-green-500 mt-7 hover:bg-green-600">
                Start Call
              </Button>
            </CardContent>
          </Card>

          {/* Join Interview */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Join Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Enter your invitation link to join an interview.
              </p>
              <Button variant="default" className="w-full mt-2 text-white bg-green-500 hover:bg-green-600">
                Join Now
              </Button>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Plan and schedule upcoming interviews.
              </p>
              <Button variant="default" className="w-full mt-2 text-white bg-green-500 hover:bg-green-600">
                Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Recordings */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Access past interview recordings.
              </p>
              <Button variant="default" className="w-full text-white bg-green-500 mt-7 hover:bg-green-600">
                View Recordings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
