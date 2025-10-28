"use client";

import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import ChatBubble from "./chat-bubble";
import ChatInput from "./chat-input";
import DateDivider from "./date-divider";

interface Sender {
  name: string;
  avatar: string;
}

interface Message {
  id: number;
  message: string;
  time: string;
  timestamp: string;
  sender: Sender;
  isOwn: boolean;
}

const messages: Message[] = [
  {
    id: 1,
    message: "Hey! Did you get a chance to review the latest designs?",
    time: "10:32",
    timestamp: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm"),
    sender: { name: "Sarah Chen", avatar: "" },
    isOwn: false
  },
  {
    id: 2,
    message:
      "Yes! I just finished looking through them. The new color scheme is really clean.",
    time: "10:35",
    timestamp: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm"),
    sender: { name: "You", avatar: "" },
    isOwn: true
  },
  {
    id: 3,
    message:
      "That's awesome. I think our users will really appreciate the improvements.",
    time: "10:36",
    timestamp: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm"),
    sender: { name: "Sarah Chen", avatar: "" },
    isOwn: false
  },
  {
    id: 4,
    message:
      "Agreed! Should we schedule a meeting to discuss the implementation timeline?",
    time: "10:38",
    timestamp: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm"),
    sender: { name: "You", avatar: "" },
    isOwn: true
  },
  {
    id: 5,
    message: "Perfect idea. How about tomorrow at 2 PM?",
    time: "10:40",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "Sarah Chen", avatar: "" },
    isOwn: false
  },
  {
    id: 6,
    message: "Let's confirm after standup tomorrow.",
    time: "10:41",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "Sarah Chen", avatar: "" },
    isOwn: false
  },
  {
    id: 7,
    message: "Sounds good.",
    time: "10:42",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "You", avatar: "" },
    isOwn: true
  },
  {
    id: 8,
    message:
      "By the way, have you checked the prototype on mobile? It looks a bit off on smaller screens.",
    time: "10:45",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "Sarah Chen", avatar: "" },
    isOwn: false
  },
  {
    id: 9,
    message:
      "Oh, not yet. I'll test it right after lunch and push a fix if needed.",
    time: "10:47",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "You", avatar: "" },
    isOwn: true
  },
  {
    id: 10,
    message:
      "Cool. Also, the animations feel smoother now. Did you tweak the easing curve?",
    time: "10:49",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "Sarah Chen", avatar: "" },
    isOwn: false
  },
  {
    id: 11,
    message:
      "Yeah, I switched it to a cubic-bezier curve to make transitions feel more natural.",
    time: "10:50",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "You", avatar: "" },
    isOwn: true
  },
  {
    id: 12,
    message: "Nice touch! That subtle detail really improves the overall feel.",
    time: "10:52",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "Sarah Chen", avatar: "" },
    isOwn: false
  },
  {
    id: 13,
    message:
      "Thanks! Once the responsive issue is fixed, I think we'll be ready for stakeholder review.",
    time: "10:54",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "You", avatar: "" },
    isOwn: true
  },
  {
    id: 14,
    message:
      "True. I'll also update the presentation slides tonight so we can walk them through the flow tomorrow.",
    time: "10:56",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "Sarah Chen", avatar: "" },
    isOwn: false
  },
  {
    id: 15,
    message:
      "Perfect. Let me know if you need help adding screenshots or user flow diagrams.",
    time: "10:58",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "You", avatar: "" },
    isOwn: true
  },
  {
    id: 16,
    message: "Will do. Thanks! Talk later?",
    time: "11:00",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "Sarah Chen", avatar: "" },
    isOwn: false
  },
  {
    id: 17,
    message: "Sure thing. Catch you after standup tomorrow.",
    time: "11:02",
    timestamp: moment().format("YYYY-MM-DD HH:mm"),
    sender: { name: "You", avatar: "" },
    isOwn: true
  }
];

const ChatZone: React.FC = () => {
  const [stickyDate, setStickyDate] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to bottom on initial load
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight + 1000;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const dates = Object.keys(dateRefs.current).sort();

      for (let i = dates.length - 1; i >= 0; i--) {
        const dateEl = dateRefs.current[dates[i]];
        if (dateEl && dateEl.offsetTop <= scrollTop + 20) {
          setStickyDate(dates[i]);
          return;
        }
      }

      setStickyDate(dates[0]);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const groupMessagesByDate = (): Record<string, Message[]> => {
    const grouped: Record<string, Message[]> = {};

    messages.forEach((msg) => {
      const dateKey = moment(msg.timestamp).format("YYYY-MM-DD");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(msg);
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate();
  const sortedDates = Object.keys(groupedMessages).sort();

  return (
    <section className="flex flex-col overflow-hidden rounded-lg bg-background text-sm">
      <div
        ref={scrollContainerRef}
        className="thin-scrollbar relative h-[calc(100vh-150px)] flex-1 overflow-y-auto"
      >
        {stickyDate && <DateDivider date={stickyDate} isSticky={true} />}

        <div className="space-y-2 p-4">
          {sortedDates.map((date, dateIndex) => (
            <div key={date}>
              <div
                ref={(el) => {
                  dateRefs.current[date] = el;
                }}
                style={{
                  opacity: stickyDate === date ? 0 : 1
                }}
              >
                <DateDivider date={date} isSticky={false} />
              </div>

              {groupedMessages[date].map((msg, index) => {
                const messagesOnDate = groupedMessages[date];
                const prevMsg = messagesOnDate[index - 1];
                const sameAsPrev =
                  prevMsg &&
                  prevMsg.sender.name === msg.sender.name &&
                  prevMsg.isOwn === msg.isOwn;

                const isGrouped = sameAsPrev;
                const isFirstOfGroup = !sameAsPrev;

                return (
                  <ChatBubble
                    key={msg.id}
                    message={msg.message}
                    time={msg.time}
                    sender={msg.sender}
                    isOwn={msg.isOwn}
                    isGrouped={isGrouped}
                    isFirstOfGroup={isFirstOfGroup}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <ChatInput
        onSend={(content: string) => {
          console.log("Message sent:", content);
        }}
      />
    </section>
  );
};

export default ChatZone;
