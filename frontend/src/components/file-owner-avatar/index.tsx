import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tooltip } from "../ui/tooltip";

const FileOwnerAvatar = ({ value }: { value: string }) => {
  return (
    <Tooltip title={value}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="leading-none text-sm">
          {value[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </Tooltip>
  );
};

export default FileOwnerAvatar;
