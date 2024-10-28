import bcrypt from "bcrypt";

class bcryptService {
  private salt = bcrypt.genSaltSync(10);

  hashPassword(password: string) {
    return bcrypt.hashSync(password, this.salt);
  }

  comparePassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
}

export default new bcryptService();
