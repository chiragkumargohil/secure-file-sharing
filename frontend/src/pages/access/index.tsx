import usersApi from "@/apis/users.api";
import PrimaryLayout from "@/components/layouts/primary-layout";
import UserAccess from "@/components/tables/user-access";
import { TUserAccess } from "@/types";
import { useEffect, useState } from "react";

const AccessPage = () => {
  const [users, setUsers] = useState<TUserAccess[]>([]);

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
    <PrimaryLayout>
      <UserAccess users={users} setUsers={setUsers} />
    </PrimaryLayout>
  );
};

export default AccessPage;
