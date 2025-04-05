import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallLogo: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
  </svg>
);

const InterviewLogo: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
</svg>
);

const ScheduleLogo: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
</svg>
);

const RecordingLogo: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>
);

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
              <CallLogo/>
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
              <InterviewLogo/>
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
              <ScheduleLogo/>
              <CardTitle className="text-lg">Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Plan and schedule upcoming interviews.
              </p>
              <Link to="/schedule">
                <Button variant="default" className="w-full mt-2 text-white bg-green-500 hover:bg-green-600">
                  Schedule
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recordings */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <RecordingLogo/>
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
