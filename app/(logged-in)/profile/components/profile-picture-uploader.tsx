import FileUploader from "@/components/shared/file-uploader";
import { useState } from "react";
import { toast } from "sonner";

interface ProfilePictureUploaderProps {
  value: string;
  onChange: (file: string) => void;
}

const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({
  value: defaultValue,
  onChange
}) => {
  const [value, setValue] = useState(defaultValue || "");

  const handleFileChange = (file: string) => {
    setValue(file);
    onChange(file);
  };

  return (
    <div>
      <FileUploader
        acceptedFileTypes={["image/*"]}
        max={2}
        enableCrop={true}
        value={value}
        onChange={handleFileChange}
        onError={(message) => toast.error(message)}
      />
    </div>
  );
};

export default ProfilePictureUploader;
