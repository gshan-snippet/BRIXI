import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { userDataAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";

type UserDataEntry = {
  id: string;
  username: string;
  phoneNumber: string;
  location: string;
  typeOfWork: string;
  serviceCharge: number;
  materialCosts: number;
  totalFees: number;
  profitMargin: number;
};

const emptyForm = {
  username: "",
  phoneNumber: "",
  location: "",
  typeOfWork: "",
  serviceCharge: "",
  materialCosts: "",
  totalFees: "",
  profitMargin: "",
};

const UserData = () => {
  const navigate = useNavigate();
  const userRole = sessionStorage.getItem("userRole");
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<UserDataEntry[]>([]);
  const [newEntry, setNewEntry] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState({ ...emptyForm });

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await userDataAPI.getAll();
      setEntries(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "operator") {
      fetchEntries();
    }
  }, [userRole]);

  const handleCreate = async () => {
    if (!newEntry.username || !newEntry.phoneNumber || !newEntry.location || !newEntry.typeOfWork) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await userDataAPI.create({
        username: newEntry.username,
        phoneNumber: newEntry.phoneNumber,
        location: newEntry.location,
        typeOfWork: newEntry.typeOfWork,
        serviceCharge: parseFloat(newEntry.serviceCharge) || 0,
        materialCosts: parseFloat(newEntry.materialCosts) || 0,
        totalFees: parseFloat(newEntry.totalFees) || 0,
        profitMargin: parseFloat(newEntry.profitMargin) || 0,
      });

      if (result.success) {
        toast.success("Entry saved");
        setNewEntry({ ...emptyForm });
        fetchEntries();
      } else {
        toast.error(result.error || "Failed to save entry");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving entry");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (entry: UserDataEntry) => {
    setEditingId(entry.id);
    setEditEntry({
      username: entry.username,
      phoneNumber: entry.phoneNumber,
      location: entry.location,
      typeOfWork: entry.typeOfWork,
      serviceCharge: entry.serviceCharge.toString(),
      materialCosts: entry.materialCosts.toString(),
      totalFees: entry.totalFees.toString(),
      profitMargin: entry.profitMargin.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditEntry({ ...emptyForm });
  };

  const saveEdit = async (entryId: string) => {
    if (!editEntry.username || !editEntry.phoneNumber || !editEntry.location || !editEntry.typeOfWork) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await userDataAPI.update(entryId, {
        username: editEntry.username,
        phoneNumber: editEntry.phoneNumber,
        location: editEntry.location,
        typeOfWork: editEntry.typeOfWork,
        serviceCharge: parseFloat(editEntry.serviceCharge) || 0,
        materialCosts: parseFloat(editEntry.materialCosts) || 0,
        totalFees: parseFloat(editEntry.totalFees) || 0,
        profitMargin: parseFloat(editEntry.profitMargin) || 0,
      });

      if (result.success) {
        toast.success("Entry updated");
        setEditingId(null);
        setEditEntry({ ...emptyForm });
        fetchEntries();
      } else {
        toast.error(result.error || "Failed to update entry");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating entry");
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm("Delete this entry?")) return;
    setLoading(true);
    try {
      const result = await userDataAPI.remove(entryId);
      if (result.success) {
        toast.success("Entry deleted");
        fetchEntries();
      } else {
        toast.error(result.error || "Failed to delete entry");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting entry");
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== "operator") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User Data</h1>
        <p className="text-muted-foreground mb-4">This section is available to operators only.</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="font-heading text-3xl font-bold">User Data</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add New Entry</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Username"
            value={newEntry.username}
            onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
          />
          <Input
            placeholder="Phone Number"
            value={newEntry.phoneNumber}
            onChange={(e) => setNewEntry({ ...newEntry, phoneNumber: e.target.value })}
          />
          <Input
            placeholder="Location"
            value={newEntry.location}
            onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
          />
          <Input
            placeholder="Type of Work"
            value={newEntry.typeOfWork}
            onChange={(e) => setNewEntry({ ...newEntry, typeOfWork: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Service Charge"
            value={newEntry.serviceCharge}
            onChange={(e) => setNewEntry({ ...newEntry, serviceCharge: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Material Costs"
            value={newEntry.materialCosts}
            onChange={(e) => setNewEntry({ ...newEntry, materialCosts: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Total Fees"
            value={newEntry.totalFees}
            onChange={(e) => setNewEntry({ ...newEntry, totalFees: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Profit Margin"
            value={newEntry.profitMargin}
            onChange={(e) => setNewEntry({ ...newEntry, profitMargin: e.target.value })}
          />
          <div className="lg:col-span-4">
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-muted-foreground">No entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type of Work</TableHead>
                  <TableHead>Service Charge</TableHead>
                  <TableHead>Material Costs</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Profit Margin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const isEditing = editingId === entry.id;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editEntry.username}
                            onChange={(e) => setEditEntry({ ...editEntry, username: e.target.value })}
                          />
                        ) : (
                          entry.username
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editEntry.phoneNumber}
                            onChange={(e) => setEditEntry({ ...editEntry, phoneNumber: e.target.value })}
                          />
                        ) : (
                          entry.phoneNumber
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editEntry.location}
                            onChange={(e) => setEditEntry({ ...editEntry, location: e.target.value })}
                          />
                        ) : (
                          entry.location
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editEntry.typeOfWork}
                            onChange={(e) => setEditEntry({ ...editEntry, typeOfWork: e.target.value })}
                          />
                        ) : (
                          entry.typeOfWork
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editEntry.serviceCharge}
                            onChange={(e) => setEditEntry({ ...editEntry, serviceCharge: e.target.value })}
                          />
                        ) : (
                          entry.serviceCharge
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editEntry.materialCosts}
                            onChange={(e) => setEditEntry({ ...editEntry, materialCosts: e.target.value })}
                          />
                        ) : (
                          entry.materialCosts
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editEntry.totalFees}
                            onChange={(e) => setEditEntry({ ...editEntry, totalFees: e.target.value })}
                          />
                        ) : (
                          entry.totalFees
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editEntry.profitMargin}
                            onChange={(e) => setEditEntry({ ...editEntry, profitMargin: e.target.value })}
                          />
                        ) : (
                          entry.profitMargin
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={() => saveEdit(entry.id)} disabled={loading}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit} disabled={loading}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEdit(entry)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)} disabled={loading}>
                              Delete
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserData;
