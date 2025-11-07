"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { motion } from "framer-motion";
import { Smile } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
  className?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

const EmojiPickerButton = ({
  onEmojiSelect,
  disabled = false,
  className = "",
  buttonSize = "icon"
}: EmojiPickerButtonProps) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size={buttonSize}
            className={`shrink-0 ${className}`}
            type="button"
            disabled={disabled}
          >
            <motion.div
              animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Smile className="h-5 w-5" />
            </motion.div>
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent
        className="w-full border-0 p-0"
        side="top"
        align="end"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
            width="100%"
            height={400}
            searchPlaceHolder="Search emoji..."
            previewConfig={{ showPreview: false }}
          />
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPickerButton;