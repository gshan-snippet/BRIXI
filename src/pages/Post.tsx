import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { postsAPI } from "@/lib/api";
import { toast } from "sonner";

const Post = () => {
  const [typeOfWork, setTypeOfWork] = useState("");
  const [description, setDescription] = useState("");
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [hoursWorked, setHoursWorked] = useState("");
  const [userRating, setUserRating] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBeforeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBeforeImage(e.target.files[0]);
    }
  };

  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAfterImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!typeOfWork || !beforeImage || !afterImage || !hoursWorked) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const operatorId = sessionStorage.getItem("userId");
      if (!operatorId) {
        toast.error("Operator ID not found");
        return;
      }

      const result = await postsAPI.createPost(
        operatorId,
        typeOfWork,
        beforeImage,
        afterImage,
        parseFloat(hoursWorked),
        parseFloat(userRating) || 0,
        description
      );

      if (result.success) {
        toast.success("Post created successfully!");
        setTypeOfWork("");
        setDescription("");
        setBeforeImage(null);
        setAfterImage(null);
        setHoursWorked("");
        setUserRating("");
      } else {
        toast.error(result.error || "Failed to create post");
      }
    } catch (error) {
      toast.error("Error creating post");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Share Your Work</CardTitle>
          <CardDescription>Create a post showing your before and after work</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Type of Work */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="typeOfWork">Type of Work</Label>
              <Input
                id="typeOfWork"
                placeholder="e.g., Bathroom Renovation, Plumbing Repair"
                value={typeOfWork}
                onChange={(e) => setTypeOfWork(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the work you did, challenges faced, and results achieved"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Before and After Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="beforeImage">Before Photo</Label>
                <Input
                  id="beforeImage"
                  type="file"
                  accept="image/*"
                  onChange={handleBeforeImageChange}
                />
                {beforeImage && <p className="text-sm text-green-600">✓ {beforeImage.name}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="afterImage">After Photo</Label>
                <Input
                  id="afterImage"
                  type="file"
                  accept="image/*"
                  onChange={handleAfterImageChange}
                />
                {afterImage && <p className="text-sm text-green-600">✓ {afterImage.name}</p>}
              </div>
            </div>

            {/* Hours Worked */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="hoursWorked">Hours Worked</Label>
              <Input
                id="hoursWorked"
                type="number"
                placeholder="e.g., 8"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                min="0"
                step="0.5"
              />
            </div>

            {/* User Rating */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="userRating">Rating (Optional)</Label>
              <Input
                id="userRating"
                type="number"
                placeholder="e.g., 4.5"
                value={userRating}
                onChange={(e) => setUserRating(e.target.value)}
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating post..." : "Upload Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Post;
