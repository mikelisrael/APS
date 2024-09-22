import { LoaderCircle } from "lucide-react";
import React from "react";
import { Button, ButtonProps } from "../ui/button";

interface SubmitButtonProps extends ButtonProps {
  loading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  children,
  ...props
}) => {
  return (
    <Button type="submit" {...props}>
      {loading ? <LoaderCircle size={20} className="animate-spin" /> : children}
    </Button>
  );
};

export default SubmitButton;
