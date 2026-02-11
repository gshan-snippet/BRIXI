import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '../database');
const USERS_FILE = path.join(DATABASE_DIR, 'users.json');
const POSTS_FILE = path.join(DATABASE_DIR, 'posts.json');
const MESSAGES_FILE = path.join(DATABASE_DIR, 'messages.json');
const APPOINTMENTS_FILE = path.join(DATABASE_DIR, 'appointments.json');
const USER_DATA_FILE = path.join(DATABASE_DIR, 'userData.json');

// Initialize database files if they don't exist
const initializeDatabase = () => {
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
  }

  // Default operator account
  const defaultOperator = {
    id: 'operator-1',
    email: 'asifkazi369@gmail.com',
    password: 'CONSCIENTIOUS', // In production, this should be hashed
    name: 'Operator',
    role: 'operator',
    createdAt: new Date().toISOString()
  };

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultOperator], null, 2));
  }

  if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(APPOINTMENTS_FILE)) {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(USER_DATA_FILE)) {
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify([], null, 2));
  }
};

// User operations
export const getUserById = (id) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  return users.find(u => u.id === id);
};

export const getUserByEmail = (email) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  return users.find(u => u.email === email);
};

export const createUser = (user) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return user;
};

export const getAllUsers = () => {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
};

// Post operations
export const createPost = (post) => {
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  posts.push(post);
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
  return post;
};

export const getAllPosts = () => {
  return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
};

export const getPostsByOperator = (operatorId) => {
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  return posts.filter(p => p.operatorId === operatorId);
};

export const deletePost = (postId) => {
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  const filteredPosts = posts.filter(p => p.id !== postId);
  fs.writeFileSync(POSTS_FILE, JSON.stringify(filteredPosts, null, 2));
  return true;
};

export const updatePost = (postId, updatedData) => {
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return null;
  
  posts[postIndex] = { ...posts[postIndex], ...updatedData };
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
  return posts[postIndex];
};

// Message operations
export const createMessage = (message) => {
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
  messages.push(message);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  return message;
};

export const getMessages = (operatorId) => {
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
  return messages.filter(m => m.operatorId === operatorId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getMessagesByUser = (userId) => {
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
  return messages.filter(m => m.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getConversation = (operatorId, userId) => {
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
  return messages.filter(m => m.operatorId === operatorId && m.userId === userId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export const deleteConversation = (operatorId, userId) => {
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
  const filteredMessages = messages.filter(m => !(m.operatorId === operatorId && m.userId === userId));
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(filteredMessages, null, 2));
  return true;
};

// Appointment operations
export const createAppointment = (appointment) => {
  const appointments = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf-8'));
  appointments.push(appointment);
  fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2));
  return appointment;
};

export const getAppointments = (operatorId) => {
  const appointments = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf-8'));
  return appointments.filter(a => a.operatorId === operatorId);
};

export const getAppointmentsByUser = (userId) => {
  const appointments = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf-8'));
  return appointments.filter(a => a.userId === userId);
};

// User data operations (operator-entered)
export const getAllUserData = () => {
  return JSON.parse(fs.readFileSync(USER_DATA_FILE, 'utf-8'));
};

export const createUserData = (entry) => {
  const entries = JSON.parse(fs.readFileSync(USER_DATA_FILE, 'utf-8'));
  entries.push(entry);
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify(entries, null, 2));
  return entry;
};

export const updateUserData = (entryId, updatedData) => {
  const entries = JSON.parse(fs.readFileSync(USER_DATA_FILE, 'utf-8'));
  const entryIndex = entries.findIndex(e => e.id === entryId);
  if (entryIndex === -1) return null;

  entries[entryIndex] = { ...entries[entryIndex], ...updatedData };
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify(entries, null, 2));
  return entries[entryIndex];
};

export const deleteUserData = (entryId) => {
  const entries = JSON.parse(fs.readFileSync(USER_DATA_FILE, 'utf-8'));
  const filtered = entries.filter(e => e.id !== entryId);
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify(filtered, null, 2));
  return true;
};

// Initialize database on module load
initializeDatabase();
