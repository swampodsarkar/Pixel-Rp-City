import { ref, push, set, onValue } from "firebase/database";
import { db } from "./firebase";
import { useMultiplayerStore } from "./multiplayer";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
}

export const sendChatMessage = (
  senderId: string,
  senderName: string,
  senderColor: string,
  text: string
) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  const msgRef = push(ref(db, `servers/${serverId}/messages`));
  set(msgRef, {
    senderId,
    senderName,
    senderColor,
    text,
    timestamp: Date.now(),
  });
};

export const listenToMessages = (
  cb: (messages: ChatMessage[]) => void
) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return () => {};
  const messagesRef = ref(db, `servers/${serverId}/messages`);
  return onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      cb([]);
      return;
    }
    const msgs: ChatMessage[] = Object.entries(data).map(
      ([id, msg]: [string, any]) => ({ id, ...msg })
    );
    msgs.sort((a, b) => a.timestamp - b.timestamp);
    cb(msgs.slice(-50));
  });
};
