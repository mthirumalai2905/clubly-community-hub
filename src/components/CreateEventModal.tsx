import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clubId: string;
}

const CreateEventModal = ({
  open,
  onClose,
  onSuccess,
  clubId,
}: CreateEventModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"online" | "offline">("online");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !eventDate || !eventTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const dateTime = new Date(`${eventDate}T${eventTime}`);

      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          club_id: clubId,
          title: title.trim(),
          description: description.trim(),
          event_type: eventType,
          location: eventType === "offline" ? location.trim() : null,
          meeting_link: eventType === "online" ? meetingLink.trim() : null,
          event_date: dateTime.toISOString(),
          max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
          created_by: user.id,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Auto RSVP the creator
      await supabase.from("event_rsvps").insert({
        event_id: event.id,
        user_id: user.id,
        status: "attending",
      });

      toast({
        title: "Event created!",
        description: `${title} is now scheduled.`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setEventType("online");
      setLocation("");
      setMeetingLink("");
      setEventDate("");
      setEventTime("");
      setMaxAttendees("");
      onSuccess();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Create an Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title *</Label>
            <Input
              id="event-title"
              placeholder="e.g., Weekly Standup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Date *</Label>
              <Input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-time">Time *</Label>
              <Input
                id="event-time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select
              value={eventType}
              onValueChange={(v) => setEventType(v as "online" | "offline")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {eventType === "online" ? (
            <div className="space-y-2">
              <Label htmlFor="meeting-link">Meeting Link</Label>
              <Input
                id="meeting-link"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Central Park"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="max-attendees">Max Attendees (optional)</Label>
            <Input
              id="max-attendees"
              type="number"
              placeholder="Leave empty for unlimited"
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="What's this event about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
