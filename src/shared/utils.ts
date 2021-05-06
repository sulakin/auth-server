import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

async function createToken(id: number, email: string): Promise<string> {
  return await jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
}

async function createConfirmToken(
  email: string,
  password: string,
): Promise<string> {
  return await jwt.sign({ email, password }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

async function createHashedPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(
  attempt: string,
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(attempt, password);
}

function generatePassword(length = 8) {
  let password = '';

  for (let i = 0; i < length; i++) {
    const type = [
      getRandomUpperCase,
      getRandomLowerCase,
      getRandomNumber,
      getRandomSymbol,
    ];

    const char = type[Math.floor(Math.random() * type.length)]();

    password += char;
  }

  return password;
}

const getRandomUpperCase = () => {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
};

const getRandomLowerCase = () => {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
};

const getRandomNumber = () => {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
};

const getRandomSymbol = () => {
  const symbol = '!@#$%^&*(){}[]=<>/,.|~?';
  return symbol[Math.floor(Math.random() * symbol.length)];
};

const getMessageAsString = (dict) => {
  return {
    message: dict.join('%langs%'),
  };
};

export {
  createConfirmToken,
  createToken,
  createHashedPassword,
  comparePassword,
  generatePassword,
  getMessageAsString,
};
