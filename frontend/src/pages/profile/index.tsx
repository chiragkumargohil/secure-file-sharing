import usersApi from "@/apis/users.api";
import { UserProfileForm } from "@/components/forms";
import PrimaryLayout from "@/components/layouts/primary-layout";
import { setUser } from "@/redux/slices/auth-slice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const ProfilePage = () => {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      await usersApi.updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
      });
      dispatch(
        setUser({
          ...user,
          firstName: user.firstName,
          lastName: user.lastName,
        })
      );
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <PrimaryLayout>
      <UserProfileForm handleSubmit={updateProfile} />
    </PrimaryLayout>
  );
};

export default ProfilePage;
