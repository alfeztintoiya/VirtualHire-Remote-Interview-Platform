import React,{ useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "../components/ui/dialog";
import MeetingSetupDialog from "../components/ui/WebRTC/MeetingSetupDialog";
import { Input } from "../components/ui/input";
import {BASE_URL}  from "../constants/index";

const CallLogo: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
    />
  </svg>
);

const InterviewLogo: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0Zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0Zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0Z"
    />
  </svg>
);

const ScheduleLogo: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
    />
  </svg>
);

const RecordingLogo: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25Z"
    />
  </svg>
);

const Dashboard: React.FC = () => {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();

  const handleJoinMeeting = () => {
    if (meetingId.trim()) {
      navigate(`/interview/${meetingId.trim()}`);
      setIsJoinDialogOpen(false);
    }
  };

  const storedUser = localStorage.getItem('user');
  let user;
  if(storedUser){
    user = JSON.parse(storedUser);
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      
      <div className="container px-4 py-8 mx-auto">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mb-6 text-gray-700">
          Manage your interviews and activities seamlessly.
        </p>

        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex items-center gap-2">
              <CallLogo />
              <CardTitle className="text-lg">New Call</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Start an instant call for interviews.
              </p>
              <MeetingSetupDialog />
            </CardContent>
          </Card>

          
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex items-center gap-2">
              <InterviewLogo />
              <CardTitle className="text-lg">Join Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Enter your invitation link to join an interview.
              </p>
              <Button
                variant="default"
                className="w-full mt-2 text-white bg-green-500 hover:bg-green-600"
                onClick={() => setIsJoinDialogOpen(true)}
              >
                Join Now
              </Button>
            </CardContent>
          </Card>

          
              <Card className="transition-shadow hover:shadow-lg">
                <CardHeader className="flex items-center gap-2">
                  <ScheduleLogo />
                  <CardTitle className="text-lg">Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Plan and schedule upcoming interviews.
                  </p>
                  <Link to="/schedule">
                    <Button
                      variant="default"
                      className="w-full mt-2 text-white bg-green-500 hover:bg-green-600"
                    >
                      Schedule
                    </Button>
                  </Link>
                </CardContent>
              </Card>
          
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex items-center gap-2">
              <RecordingLogo />
              <CardTitle className="text-lg">Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Access past interview recordings.
              </p>
              <Button
                variant="default"
                className="w-full text-white bg-green-500 mt-7 hover:bg-green-600"
              >
                View Recordings
              </Button>
            </CardContent>
          </Card>
        </div>

        
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Meeting ID or Link</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Enter meeting ID (e.g. abc-123)"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
              />
              <DialogFooter>
                <Button
                  variant="default"
                  className="text-white bg-blue-600"
                  onClick={handleJoinMeeting}
                >
                  Join Meeting
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Dashboard;
