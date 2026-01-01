import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Check,
  Copy,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
  postContent?: string;
  onShareComplete?: () => void;
}

const ShareDialog = ({
  isOpen,
  onClose,
  postId,
  postTitle,
  postContent,
  onShareComplete
}: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);

  // Generate the shareable link
  const shareUrl = `${window.location.origin}/post/${postId}`;

  // Create share text
  const shareText =
    postTitle || postContent?.slice(0, 100) || "Check out this post";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");

      // Trigger share complete callback
      if (onShareComplete) {
        onShareComplete();
      }

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
    if (onShareComplete) {
      onShareComplete();
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
    if (onShareComplete) {
      onShareComplete();
    }
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
    if (onShareComplete) {
      onShareComplete();
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(url, "_blank");
    if (onShareComplete) {
      onShareComplete();
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareText);
    const body = encodeURIComponent(`Check out this post:\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    if (onShareComplete) {
      onShareComplete();
    }
  };

  // Use native share API if available (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: shareUrl
        });
        if (onShareComplete) {
          onShareComplete();
        }
      } catch (error) {
        // User cancelled or share failed
        console.log("Share cancelled or failed", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share post</DialogTitle>
          <DialogDescription>
            Share this post with others via social media or copy the link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link Section */}
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border bg-muted px-3 py-2">
              <p className="line-clamp-1 break-all text-sm text-muted-foreground">
                {shareUrl}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Native Share (Mobile) */}
          {typeof navigator.share !== "undefined" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleNativeShare}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Share via...
            </Button>
          )}

          {/* Social Media Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Share to social media</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareToTwitter}
              >
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareToFacebook}
              >
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareToLinkedIn}
              >
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareToWhatsApp}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Email Share */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={shareViaEmail}
          >
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
