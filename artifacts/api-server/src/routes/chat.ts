import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

interface ChatMsg {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  initials: string;
}

interface OnlineUser {
  username: string;
  initials: string;
  lastSeen: string;
}

const messages: ChatMsg[] = [
  {
    id: "1",
    username: "Ali Khan",
    text: "Salam everyone! Just generated an awesome landing page 🔥",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    initials: "AK",
  },
  {
    id: "2",
    username: "Sara Ahmed",
    text: "The AI generator is amazing! Made a bakery site in seconds.",
    timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
    initials: "SA",
  },
  {
    id: "3",
    username: "Usman Malik",
    text: "Anyone know how to customize the generated HTML colors?",
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    initials: "UM",
  },
  {
    id: "4",
    username: "Zara Sheikh",
    text: "You can edit the HTML directly after copying. Works great!",
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    initials: "ZS",
  },
];

const onlineUsers: Map<string, OnlineUser> = new Map([
  ["Ali Khan", { username: "Ali Khan", initials: "AK", lastSeen: new Date().toISOString() }],
  ["Sara Ahmed", { username: "Sara Ahmed", initials: "SA", lastSeen: new Date().toISOString() }],
  ["Usman Malik", { username: "Usman Malik", initials: "UM", lastSeen: new Date().toISOString() }],
]);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

router.get("/chat/messages", (_req: Request, res: Response) => {
  res.json(messages.slice(-50));
});

router.post("/chat/messages", (req: Request, res: Response) => {
  const { username, text } = req.body as { username?: string; text?: string };
  if (!username || !text) {
    res.status(400).json({ error: "username and text are required" });
    return;
  }
  const msg: ChatMsg = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    username,
    text: text.slice(0, 500),
    timestamp: new Date().toISOString(),
    initials: getInitials(username),
  };
  messages.push(msg);
  if (messages.length > 200) messages.splice(0, messages.length - 200);

  onlineUsers.set(username, {
    username,
    initials: getInitials(username),
    lastSeen: new Date().toISOString(),
  });

  res.status(201).json(msg);
});

router.get("/chat/online", (_req: Request, res: Response) => {
  const cutoff = Date.now() - 5 * 60 * 1000;
  const active = Array.from(onlineUsers.values()).filter(
    (u) => new Date(u.lastSeen).getTime() > cutoff,
  );
  res.json(active);
});

export default router;
