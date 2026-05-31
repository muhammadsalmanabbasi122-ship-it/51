import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_KEY = "ai_generator_history";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  html?: string;
  timestamp: Date;
}

export interface AIChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export async function getSessions(): Promise<AIChatSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSession(session: AIChatSession): Promise<void> {
  const sessions = await getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  const now = new Date().toISOString();
  if (idx >= 0) {
    sessions[idx] = { ...session, updatedAt: now };
  } else {
    sessions.push({ ...session, createdAt: session.createdAt || now, updatedAt: now });
  }
  sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
}

export async function deleteSession(id: string): Promise<void> {
  const sessions = await getSessions();
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.filter((s) => s.id !== id)));
}
