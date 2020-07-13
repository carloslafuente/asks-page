'user strict';

const bcrypt = require('bcrypt');

class User {
  constructor(db) {
    this.db = db;
    this.ref = this.db.ref('/');
    this.collection = this.ref.child('users');
  }

  async createUser(data) {
    const user = { ...data };
    user.password = await this.constructor.encrypt(user.password);
    const newUser = this.collection.push(user);
    newUser.set(user);
    return newUser.key;
  }

  async validateUser(data) {
    const user = { ...data };
    const userQuery = await this.collection
      .orderByChild('email')
      .equalTo(user.email)
      .once('value');
    const userFound = userQuery.val();
    if (userFound) {
      const userId = Object.keys(userFound)[0];
      const passwordRight = await bcrypt.compare(
        user.password,
        userFound[userId].password
      );
      const result = passwordRight ? userFound[userId] : false;
      return result;
    }
    return false;
  }

  static async encrypt(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }
}

module.exports = User;
