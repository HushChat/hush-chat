import { PLATFORM } from "@/constants/platformConstants";
import { logInfo, logError } from "@/utils/logger";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

export type WebRTCCallbacks = {
  onIceCandidate: (candidate: string) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onRemoteStream: (stream: MediaStream) => void;
};

function getRTCPeerConnection(): typeof RTCPeerConnection {
  if (PLATFORM.IS_WEB) {
    return window.RTCPeerConnection;
  }
  // react-native-webrtc provides these globals when imported
  return globalThis.RTCPeerConnection;
}

function getMediaDevices(): MediaDevices {
  if (PLATFORM.IS_WEB) {
    return navigator.mediaDevices;
  }
  return globalThis.navigator?.mediaDevices;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callbacks: WebRTCCallbacks | null = null;

  async initialize(callbacks: WebRTCCallbacks): Promise<void> {
    this.callbacks = callbacks;

    try {
      this.localStream = await getMediaDevices().getUserMedia({
        audio: true,
        video: false,
      });
      logInfo("Local audio stream acquired");
    } catch (error) {
      logError("Failed to get local audio stream:", error);
      throw error;
    }
  }

  async createOffer(): Promise<string> {
    this.createPeerConnection();

    if (!this.peerConnection) {
      throw new Error("PeerConnection not initialized");
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    });

    await this.peerConnection.setLocalDescription(offer);
    logInfo("SDP offer created");

    return JSON.stringify(offer);
  }

  async handleOffer(sdpString: string): Promise<string> {
    this.createPeerConnection();

    if (!this.peerConnection) {
      throw new Error("PeerConnection not initialized");
    }

    const offer = JSON.parse(sdpString) as RTCSessionDescriptionInit;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    logInfo("SDP answer created");

    return JSON.stringify(answer);
  }

  async handleAnswer(sdpString: string): Promise<void> {
    if (!this.peerConnection) {
      logInfo("No peer connection to handle answer");
      return;
    }

    const answer = JSON.parse(sdpString) as RTCSessionDescriptionInit;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    logInfo("Remote SDP answer set");
  }

  async addIceCandidate(candidateString: string): Promise<void> {
    if (!this.peerConnection) {
      logInfo("No peer connection to add ICE candidate");
      return;
    }

    try {
      const candidate = JSON.parse(candidateString) as RTCIceCandidateInit;
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      logError("Failed to add ICE candidate:", error);
    }
  }

  toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // returns true if muted
    }
    return false;
  }

  cleanup(): void {
    logInfo("Cleaning up WebRTC resources");

    if (this.peerConnection) {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.callbacks = null;
  }

  private createPeerConnection(): void {
    if (this.peerConnection) return;

    this.peerConnection = new (getRTCPeerConnection())({
      iceServers: ICE_SERVERS,
    });

    // Add local audio tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // ICE candidate handler
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.callbacks) {
        this.callbacks.onIceCandidate(JSON.stringify(event.candidate.toJSON()));
      }
    };

    // Connection state handler
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection && this.callbacks) {
        logInfo("WebRTC connection state:", this.peerConnection.connectionState);
        this.callbacks.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    // Remote stream handler
    this.peerConnection.ontrack = (event) => {
      if (event.streams[0] && this.callbacks) {
        this.remoteStream = event.streams[0];
        this.callbacks.onRemoteStream(event.streams[0]);
      }
    };
  }
}
