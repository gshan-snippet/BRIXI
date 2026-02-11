import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    // Load user data from sessionStorage
    const userName = sessionStorage.getItem("userName") || "";
    const userEmail = sessionStorage.getItem("userEmail") || "";
    const userPhone = sessionStorage.getItem("userPhone") || "";

    setProfile({
      name: userName,
      email: userEmail,
      phone: userPhone,
    });
  }, []);

  const handleSave = () => {
    setEditing(false);
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="font-heading text-3xl font-bold mb-8">My Profile</h1>
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <Avatar className="h-16 w-16 bg-primary text-primary-foreground">
            <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
              {profile.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="font-heading text-xl">{profile.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Member since Jan 2025</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => (editing ? handleSave() : setEditing(true))}
          >
            {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" /> Username
            </Label>
            {editing ? (
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            ) : (
              <p className="font-medium">{profile.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> Email
            </Label>
            {editing ? (
              <Input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            ) : (
              <p className="font-medium">{profile.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> Phone
            </Label>
            {editing ? (
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            ) : (
              <p className="font-medium">{profile.phone}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
