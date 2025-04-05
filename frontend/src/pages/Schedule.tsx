import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Define a type for Interview
type Interview = {
  _id: string;
  title: string;
  description: string;
  candidate: string;
  interviewer: string;
  date: string;
  time: string;
  status: string;
};

type Candidate = {
  email: string;
  name: string;
};

const Schedule: React.FC = () => {
  // Form state for scheduling a new interview
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [candidate, setCandidate] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");

  // State for storing interviews list
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [candidates,setCandidates] = useState<Candidate[]>([]);

  // Fetch scheduled interviews from backend
  const fetchInterviews = async () => {
    try {
      const res = await axios.get("http://localhost:8011/interviews", {
        withCredentials: true,
      });
      // Assume backend returns an array directly; adjust if nested (e.g., res.data.interviews)
      setInterviews(res.data.interviews);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Error fetching interviews");
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await axios.get("http://localhost:8011/candidates", {
        withCredentials: true,
      });
      console.log("Candidate Error: ",res);
      setCandidates(res.data.candidate);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchCandidates();
  }, []);

  // Reset form after scheduling
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCandidate("");
    setInterviewer("");
    setDate(null);
    setTime("");
  };

  // Handler for saving a new scheduled interview
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: title,
      description,
      candidate,      // e.g., candidate email or ID
      interviewer,    // e.g., interviewer email or ID
      date: date ? date.toISOString() : null,
      time,
      status: "Upcoming", // default status
    };

    try {
      const res = await axios.post("http://localhost:8011/interviews", payload, {
        withCredentials: true,
      });
      console.log(res);
      if (res.status === 201) {
        toast.success("Interview scheduled successfully!");
        resetForm();
        fetchInterviews(); // Refresh the interviews list after adding a new interview
      } else {
        toast.error("Failed to schedule interview. Please try again.");
      }
    } catch (err) {
      console.error("Error scheduling interview:", err);
      toast.error("Error scheduling interview. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Page Header with Schedule Interview Dialog */}
      <div className="container flex items-center justify-between px-4 py-8 mx-auto">
        <div>
          <h2 className="text-2xl font-semibold">Interviews</h2>
          <p className="text-gray-600">Schedule and manage interviews</p>
        </div>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="text-white bg-green-500 hover:bg-green-600"
              >
                Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Schedule Interview</DialogTitle>
                <DialogDescription>
                  Fill out the form below and click save to schedule the interview.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveChanges}>
                <div className="grid gap-4 py-4">
                  {/* Title */}
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Interview Title"
                      className="col-span-3"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  {/* Description */}
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Interview Description"
                      className="col-span-3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  {/* Candidate (Select) */}
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label className="text-right">Candidate</Label>
                    <Select value={candidate} onValueChange={setCandidate}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates.map((cand) => (
                          <SelectItem key={cand.email} value={cand.email}>
                            {cand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Interviewer (Select) */}
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label className="text-right">Interviewer</Label>
                    <Select value={interviewer} onValueChange={setInterviewer}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select an interviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="john.doe@example.com">John Doe</SelectItem>
                        <SelectItem value="burak@example.com">Burak Ohmez</SelectItem>
                        <SelectItem value="alice@example.com">Alice Zhang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Date Picker */}
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label htmlFor="date" className="text-right">
                      Pick a Date
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  {/* Time */}
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label htmlFor="time" className="text-right">
                      Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      className="col-span-3"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="text-white bg-green-500 hover:bg-green-600">
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Interviews List */}
      <div className="container px-4 pb-8 mx-auto">
        {loading ? (
          <p className="text-center text-gray-600">Loading interviews...</p>
        ) : interviews.length === 0 ? (
          <p className="text-center text-gray-600">No interviews scheduled yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {interviews.map((interview) => (
              <Card key={interview._id} className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{interview.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {format(new Date(interview.date), "PPP")} · {interview.time}
                  </p>
                  <p className="text-sm text-gray-500">
                    Candidate: {interview.candidate}
                  </p>
                  <p className="text-sm text-gray-500">
                    Interviewer: {interview.interviewer}
                  </p>
                  <div
                    className={`mt-4 inline-block rounded px-2 py-1 text-xs ${
                      interview.status === "Live Now"
                        ? "bg-green-200 text-green-800"
                        : interview.status === "Upcoming"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {interview.status}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
