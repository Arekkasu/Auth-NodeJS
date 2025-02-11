import { compareSync, genSaltSync, hashSync } from "bcrypt";

export const bcryptAdapter = {
  hash: (passsword: string) => {
    const salt = genSaltSync();
    return hashSync(passsword, salt);
  },
  compare: (password: string, hashed: string) => {
    return compareSync(password, hashed);
  },
};
