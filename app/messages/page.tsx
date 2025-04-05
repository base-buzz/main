"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

// Mock message data
const messageRequests = [
  {
    id: 1,
    avatar:
      "https://pbs.twimg.com/profile_images/1662164422422315008/V8wxXFal_400x400.jpg",
    name: "PumpFun Bull 💥",
    handle: "@PumpFunBull",
    verified: true,
    date: "Mar 23",
    message: "Do you want my promotion service?",
  },
  {
    id: 2,
    avatar:
      "https://pbs.twimg.com/profile_images/1713422997824286720/-NbUIzrC_400x400.jpg",
    name: "HODL Crypto Hub",
    handle: "@HodlPromo",
    verified: true,
    date: "Mar 23",
    message: "Please check my X page",
  },
  {
    id: 3,
    avatar:
      "https://pbs.twimg.com/profile_images/1723352407402930176/X_ZJI_nP_400x400.jpg",
    name: "MEME AI-$MEME",
    handle: "@memeaix",
    verified: true,
    date: "Mar 23",
    message: "Hi, can I have a video call with you to discuss...",
  },
  {
    id: 4,
    avatar:
      "https://pbs.twimg.com/profile_images/1613710127120465920/bBjZ01Iz_400x400.jpg",
    name: "Charlie",
    handle: "@btc_charlie",
    verified: true,
    date: "Mar 16",
    message: "I'm in Malaga Spain it's a quick flight to Lond...",
  },
  {
    id: 5,
    avatar:
      "https://pbs.twimg.com/profile_images/1617700070786387968/cIOcFG5h_400x400.jpg",
    name: "Matt",
    handle: "@matt_npl",
    verified: true,
    date: "Mar 11",
    message: "Wow good luck with the launch great idea",
  },
  {
    id: 6,
    avatar:
      "https://pbs.twimg.com/profile_images/1564689363389657090/H7ma3nV8_400x400.jpg",
    name: "Chicken Genius",
    handle: "@pakpakchicken",
    verified: true,
    date: "Feb 27",
    message: "Hi ken, if you post your top ten indicators (w...",
  },
  {
    id: 7,
    avatar:
      "https://pbs.twimg.com/profile_images/1732696792615395328/KRBJ2Co4_400x400.png",
    name: "microgift",
    handle: "@microgift88",
    verified: true,
    date: "Feb 13",
    message: "not h8r btw",
  },
  {
    id: 8,
    avatar:
      "https://pbs.twimg.com/profile_images/1689092412332228609/xzd-a9EG_400x400.jpg",
    name: "Architect",
    handle: "@Architect9000",
    verified: true,
    date: "Feb 12",
    message: "subcent transactions seem good to me",
  },
  {
    id: 9,
    avatar:
      "https://pbs.twimg.com/profile_images/1752015493334810624/gg0PzCnS_400x400.jpg",
    name: "James.exe",
    handle: "@millerexe",
    verified: false,
    date: "Dec 4, 2024",
    message: "thanks Dave",
  },
  {
    id: 10,
    avatar:
      "https://pbs.twimg.com/profile_images/1750996768071233536/HuaGgf9a_400x400.jpg",
    name: "Lola",
    handle: "@RQqwconOAXeLoj",
    verified: false,
    date: "Nov 22, 2024",
    message: "Hi Dave",
  },
];

export default function MessagesPage() {
  const { isAuthenticated, loading } = useAuth({ required: true });
  const { isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState("");

  if (loading || !isConnected) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 p-4 backdrop-blur-md">
        <h1 className="text-xl font-bold">Messages</h1>
        <div className="flex space-x-2">
          <button className="rounded-full p-2 hover:bg-accent">
            <Icon name="more-horizontal" className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-border p-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon name="search" className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search Direct Messages"
            className="rounded-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Message Requests Section */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Icon name="mail" className="h-5 w-5" />
          <div>
            <h2 className="font-semibold">Message requests</h2>
            <p className="text-sm text-muted-foreground">
              8 people you may know
            </p>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="divide-y divide-border">
        {messageRequests.map((message) => (
          <Link
            href={`/messages/${message.id}`}
            key={message.id}
            className="flex items-start gap-3 p-4 hover:bg-accent/5"
          >
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
              <img
                src={message.avatar}
                alt={message.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 truncate">
                  <span className="font-bold">{message.name}</span>
                  {message.verified && (
                    <span className="text-primary">
                      <Icon name="shield-check" className="h-4 w-4" />
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {message.handle}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    · {message.date}
                  </span>
                </div>
                <button className="rounded-full p-1 text-muted-foreground hover:bg-accent/20 hover:text-foreground">
                  <Icon name="more-horizontal" className="h-4 w-4" />
                </button>
              </div>
              <p className="truncate text-muted-foreground">
                {message.message}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State for Right Side */}
      <div className="fixed right-1/3 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center p-8 text-center">
        <h2 className="mb-2 text-3xl font-bold">Select a message</h2>
        <p className="mb-6 text-muted-foreground">
          Choose from your existing conversations, start a new one, or just keep
          swimming.
        </p>
        <button className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90">
          New message
        </button>
      </div>
    </div>
  );
}
