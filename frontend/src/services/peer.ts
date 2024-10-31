class PeerService {
  private peer: RTCPeerConnection;

  constructor() {
    this.peer = this.createPeerConnection();
  }

  private createPeerConnection(): RTCPeerConnection {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });

    peer.onconnectionstatechange = () => {
      console.log("Connection state:", peer.connectionState);
    };

    return peer;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  }

  public async handleOffer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(new RTCSessionDescription(answer));
    return answer;
  }

  public async setRemoteAnswer(
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
  }

  public addStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      this.peer.addTrack(track, stream);
    });
  }

  public subscribeToTrack(callback: (stream: MediaStream) => void): void {
    this.peer.ontrack = (event) => {
      callback(event.streams[0]);
    };
  }

  public close(): void {
    this.peer.close();
  }
}

export default new PeerService();
