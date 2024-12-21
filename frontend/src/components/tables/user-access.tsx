"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit2, UserPlus } from "lucide-react";
import { TUserAccess } from "@/types";
import usersApi from "@/apis/users.api";
import { toast } from "sonner";

const UserAccess = ({
  users,
  setUsers,
}: {
  users: TUserAccess[];
  setUsers: (users: TUserAccess[]) => void;
}) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    role: "viewer" as TUserAccess["role"],
  });
  const [editingUser, setEditingUser] = useState<TUserAccess | null>(null);

  const addUser = async () => {
    try {
      await usersApi.upsertDriveAccess(newUser.email, { role: newUser.role });
      if (!users.find((user) => user.email === newUser.email)) {
        setUsers([...users, { email: newUser.email, role: newUser.role }]);
      }
      setNewUser({ email: "", role: "viewer" });
      setShowAddUser(false);
      toast.success("User added successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const updateUserRole = async (
    email: TUserAccess["email"],
    role: TUserAccess["role"]
  ) => {
    try {
      await usersApi.upsertDriveAccess(email, { role });
      setUsers(
        users.map((user) => {
          if (user.email === email) {
            return { ...user, role };
          }
          return user;
        })
      );
      toast.success("User role updated successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (email: string) => {
    try {
      await usersApi.deleteDriveAccess(email);
      setUsers(users.filter((user) => user.email !== email));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Access</h2>
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog
                    open={Boolean(editingUser)}
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditingUser(null);
                      } else {
                        setEditingUser(user);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                        <DialogDescription>
                          Change the role for {user.email}
                        </DialogDescription>
                      </DialogHeader>
                      <Select
                        onValueChange={(value: TUserAccess["role"]) =>
                          setEditingUser({ ...user, role: value })
                        }
                        defaultValue={user.role}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <DialogFooter>
                        <Button
                          onClick={() => {
                            if (editingUser) {
                              updateUserRole(
                                editingUser?.email,
                                editingUser?.role
                              );
                              setEditingUser(null);
                            }
                          }}
                        >
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove {user.email}'s access?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button onClick={() => deleteUser(user.email)}>
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showAddUser && (
        <div className="mt-6 p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Add New User</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value: TUserAccess["role"]) =>
                  setNewUser({ ...newUser, role: value })
                }
                defaultValue={newUser.role}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
              <Button onClick={addUser}>Add User</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccess;
