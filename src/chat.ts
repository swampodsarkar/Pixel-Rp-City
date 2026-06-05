import { ref, push, set, onValue } from "firebase/database";
import { db } from "./firebase";

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
  const msgRef = push(ref(db, "messages"));
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
  const messagesRef = ref(db, "messages");
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
