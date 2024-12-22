import { useEffect, useState } from "react";
import usersApi from "@/apis/users.api";
import { TUserAccess } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit2, UserPlus } from "lucide-react";
import AddUserAccessModal from "@/components/modals/add-user-access-modal";
import EditUserAccessModal from "@/components/modals/edit-user-access-modal";
import DeleteUserAccessModal from "@/components/modals/delete-user-access-modal";

const AccessPage = () => {
  const [users, setUsers] = useState<TUserAccess[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<TUserAccess | null>(null);
  const [deletingUser, setDeletingUser] = useState<TUserAccess | null>(null);

  const getUsers = async () => {
    try {
      const data = await usersApi.getDriveAccessEmails();
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingUser(user)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeletingUser(user)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingUser && (
        <EditUserAccessModal
          open={Boolean(editingUser)}
          setOpen={(open) => setEditingUser(open ? editingUser : null)}
          user={editingUser}
          onUserUpdated={(user: TUserAccess) => {
            setUsers(
              users.map((u) => {
                if (u.email === user.email) {
                  return { ...u, role: user.role };
                }
                return u;
              })
            );
          }}
        />
      )}

      {showAddUser && (
        <AddUserAccessModal
          open={showAddUser}
          setOpen={setShowAddUser}
          onUserAdded={(user: TUserAccess) => {
            if (!users.find((u) => u.email === user.email)) {
              setUsers([...users, { email: user.email, role: user.role }]);
            }
          }}
        />
      )}

      {Boolean(deletingUser) && (
        <DeleteUserAccessModal
          open={Boolean(deletingUser)}
          setOpen={(isOpen) => setDeletingUser(isOpen ? deletingUser : null)}
          user={deletingUser!}
          onAction={(user: TUserAccess) => {
            setUsers(users.filter((u) => u.email !== user.email));
          }}
        />
      )}
    </div>
  );
};

export default AccessPage;
