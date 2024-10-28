import jwt from "jsonwebtoken";

class jwtService {
  private jwtSecret = "secret";

  async generateToken(userId: string) {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: "24h" });
  }

  async verifyToken(token: string) {
    return jwt.verify(token, this.jwtSecret);
  }

  async decodeToken(token: string) {
    return jwt.decode(token, {
      json: true,
    });
  }
}

export default new jwtService();
