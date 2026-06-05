import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";
import { useMultiplayerStore } from "./multiplayer";

const appId = "78e0fd577ac24263a2dcb2d9397c8bba";
const channel = "global-city";

let rtcClient: IAgoraRTCClient | null = null;
let localAudioTrack: IMicrophoneAudioTrack | null = null;

const remoteAudioTracks: Record<string, IRemoteAudioTrack> = {};

export const initVoice = async (uid: string) => {
  rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  rtcClient.on("user-published", async (user, mediaType) => {
    await rtcClient!.subscribe(user, mediaType);
    if (mediaType === "audio") {
      const remoteAudioTrack = user.audioTrack;
      if (remoteAudioTrack) {
        remoteAudioTracks[user.uid as string] = remoteAudioTrack;
        remoteAudioTrack.play();
      }
    }
  });

  rtcClient.on("user-unpublished", (user, mediaType) => {
    if (mediaType === "audio") {
      delete remoteAudioTracks[user.uid as string];
    }
  });

  await rtcClient.join(appId, channel, null, uid);

  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await rtcClient.publish([localAudioTrack]);
};

export const updateSpatialAudioVolumes = (myX: number, myZ: number) => {
  const players = useMultiplayerStore.getState().players;
  
  for (const [uid, track] of Object.entries(remoteAudioTracks)) {
    const player = players[uid];
    if (!player) {
       track.setVolume(0);
       continue;
    }
    
    // Calculate distance
    const dist = Math.hypot(player.x - myX, player.z - myZ);
    const maxDist = 40; // max distance to hear someone
    
    if (dist > maxDist) {
      track.setVolume(0);
    } else {
      // Scale 0-100 based on distance (closer = louder)
      const vol = Math.floor(Math.pow((1 - dist / maxDist), 2) * 100);
      track.setVolume(Math.max(0, vol));
    }
  }
};

export const leaveVoice = async () => {
    if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
    }
    if (rtcClient) {
        await rtcClient.leave();
    }
    rtcClient = null;
    localAudioTrack = null;
    for (const uid in remoteAudioTracks) {
         delete remoteAudioTracks[uid];
    }
};
