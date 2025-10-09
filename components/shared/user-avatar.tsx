import { FaUser } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
  fallback?: string;
  onClick?: () => void;
};

const UserAvatar = ({ className, src, alt, fallback, onClick }: Props) => {
  return (
    <Avatar className={className} onClick={onClick}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>
        {fallback ?? (
          <FaUser className="absolute bottom-0 size-3/4 text-white" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
