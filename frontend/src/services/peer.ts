class PeerService {
  private peer: RTCPeerConnection | null = null;
  private remoteStream: MediaStream | null = null;

  constructor() {
    this.createPeerConnection();
  }

  private createPeerConnection() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });

    this.peer.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };
  }

  async getOffer(): Promise<RTCSessionDescriptionInit | undefined> {
    try {
      if (!this.peer) this.createPeerConnection();
      const offer = await this.peer!.createOffer();
      await this.peer!.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  async getAnswer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit | undefined> {
    try {
      if (!this.peer) this.createPeerConnection();
      await this.peer!.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer!.createAnswer();
      await this.peer!.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  }

  async setRemoteDescription(sdp: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.peer) this.createPeerConnection();
      await this.peer!.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (error) {
      console.error("Error setting remote description:", error);
    }
  }

  addTrack(stream: MediaStream): void {
    if (!this.peer) this.createPeerConnection();
    stream.getTracks().forEach((track) => {
      this.peer!.addTrack(track, stream);
    });
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  close(): void {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
      this.remoteStream = null;
    }
  }
}

export default new PeerService();
