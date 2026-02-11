import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarIcon, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { messagesAPI } from "@/lib/api";

import workerPlumber from "@/assets/worker-plumber.jpg";
import workerElectrician from "@/assets/worker-electrician.jpg";
import workerCarpenter from "@/assets/worker-carpenter.jpg";
import workerPainter from "@/assets/worker-painter.jpg";
import workerAC from "@/assets/worker-ac.jpg";
import workerCleaner from "@/assets/worker-cleaner.jpg";

const workerTypes = [
  { name: "Plumber", image: workerPlumber, rating: 4.8, jobs: 1240, desc: "Pipe repairs, installations & leak fixes" },
  { name: "Electrician", image: workerElectrician, rating: 4.9, jobs: 980, desc: "Wiring, panel upgrades & electrical repairs" },
  { name: "Carpenter", image: workerCarpenter, rating: 4.7, jobs: 860, desc: "Custom furniture, repairs & woodwork" },
  { name: "Painter", image: workerPainter, rating: 4.6, jobs: 1100, desc: "Interior & exterior painting services" },
  { name: "AC Technician", image: workerAC, rating: 4.8, jobs: 750, desc: "AC installation, repair & maintenance" },
  { name: "Cleaner", image: workerCleaner, rating: 4.5, jobs: 2000, desc: "Deep cleaning, regular upkeep & sanitization" },
];

const Workers = () => {
  const navigate = useNavigate();
  const [selectedWorker, setSelectedWorker] = useState<typeof workerTypes[0] | null>(null);
  const [date, setDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName") || "";
  const userPhone = sessionStorage.getItem("userPhone") || "";
  const userRole = sessionStorage.getItem("userRole");
  const operatorId = "operator-1";

  const handleBook = async () => {
    if (!userId) {
      toast.error("Please log in to book an appointment");
      navigate("/login");
      return;
    }

    if (!date) {
      toast.error("Please select a date first");
      return;
    }

    if (!location.trim()) {
      toast.error("Please enter your location");
      return;
    }

    if (!workingHours.trim()) {
      toast.error("Please specify working hours");
      return;
    }

    setIsLoading(true);
    try {
      const result = await messagesAPI.sendAppointment(
        operatorId,
        userId,
        userName,
        userPhone,
        format(date, "PPP"),
        location,
        workingHours,
        selectedWorker?.name || "Service"
      );

      if (result.success) {
        toast.success(`Appointment requested for ${selectedWorker?.name}!`);
        setSelectedWorker(null);
        setDate(undefined);
        setLocation("");
        setWorkingHours("");
        navigate("/messages");
      } else {
        toast.error(result.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error booking appointment");
    } finally {
      setIsLoading(false);
    }
  };

  // Operator can't book, redirect to home
  if (userRole === "operator") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Workers</h1>
        <p className="text-muted-foreground mb-4">As an operator, you cannot book appointments.</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="font-heading text-3xl font-bold mb-2">Workers</h1>
      <p className="text-muted-foreground mb-8">Choose a service and book your appointment</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {workerTypes.map((worker, i) => (
          <button
            key={worker.name}
            onClick={() => {
              if (!userId) {
                toast.error("Please log in to book an appointment");
                navigate("/login");
                return;
              }
              setSelectedWorker(worker);
            }}
            className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 text-left active:scale-[0.98]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={worker.image}
                alt={worker.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading text-lg font-semibold">{worker.name}</h3>
                <div className="flex items-center gap-1 text-secondary">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{worker.rating}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{worker.desc}</p>
              <p className="text-xs text-muted-foreground mt-2">{worker.jobs.toLocaleString()}+ jobs completed</p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedWorker} onOpenChange={() => setSelectedWorker(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Book {selectedWorker?.name}
            </DialogTitle>
            <DialogDescription>{selectedWorker?.desc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Appointment Date */}
            <div>
              <Label>Appointment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick an appointment date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Current Location</Label>
              <Input
                id="location"
                placeholder="e.g., 123 Main St, Apt 4B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Working Hours */}
            <div>
              <Label htmlFor="workingHours">Preferred Working Hours</Label>
              <Input
                id="workingHours"
                placeholder="e.g., 9 AM - 12 PM"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleBook}
              disabled={isLoading}
            >
              {isLoading ? "Confirming..." : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workers;

