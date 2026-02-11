const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  register: async (email: string, password: string, name: string, phone?: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone })
    });
    return response.json();
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/users`);
    return response.json();
  }
};

// Posts API
export const postsAPI = {
  createPost: async (operatorId: string, typeOfWork: string, beforeImage: File, afterImage: File, hoursWorked: number, userRating: number, description: string = '') => {
    const formData = new FormData();
    formData.append('operatorId', operatorId);
    formData.append('typeOfWork', typeOfWork);
    formData.append('description', description);
    formData.append('beforeImage', beforeImage);
    formData.append('afterImage', afterImage);
    formData.append('hoursWorked', hoursWorked.toString());
    formData.append('userRating', userRating.toString());

    const response = await fetch(`${API_BASE_URL}/posts/create`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  getAllPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/posts/all`);
    const posts = await response.json();
    
    // Convert relative image paths to full URLs
    return posts.map((post: any) => ({
      ...post,
      beforeImage: post.beforeImage.startsWith('http') 
        ? post.beforeImage 
        : `http://localhost:3001${post.beforeImage}`,
      afterImage: post.afterImage.startsWith('http') 
        ? post.afterImage 
        : `http://localhost:3001${post.afterImage}`
    }));
  },

  getOperatorPosts: async (operatorId: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/operator/${operatorId}`);
    const posts = await response.json();
    
    // Convert relative image paths to full URLs
    return posts.map((post: any) => ({
      ...post,
      beforeImage: post.beforeImage.startsWith('http') 
        ? post.beforeImage 
        : `http://localhost:3001${post.beforeImage}`,
      afterImage: post.afterImage.startsWith('http') 
        ? post.afterImage 
        : `http://localhost:3001${post.afterImage}`
    }));
  },

  deletePost: async (postId: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  updatePost: async (postId: string, data: { typeOfWork?: string; hoursWorked?: number; userRating?: number; description?: string }) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// Messages API
export const messagesAPI = {
  sendMessage: async (operatorId: string, userId: string, userName: string, messageText: string, senderRole: string = 'consumer') => {
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId, userId, userName, messageText, senderRole })
    });
    return response.json();
  },

  sendAppointment: async (operatorId: string, userId: string, userName: string, userPhone: string, appointmentDate: string, location: string, workingHours: string, typeOfWork: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operatorId,
        userId,
        userName,
        userPhone,
        appointmentDate,
        location,
        workingHours,
        typeOfWork
      })
    });
    return response.json();
  },

  getOperatorMessages: async (operatorId: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/operator/${operatorId}`);
    return response.json();
  },

  getConversation: async (operatorId: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/conversation/${operatorId}/${userId}`);
    return response.json();
  },

  deleteConversation: async (operatorId: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/conversation/${operatorId}/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
};

// User Data API (operator-only)
export const userDataAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/user-data`);
    return response.json();
  },

  create: async (data: {
    username: string;
    phoneNumber: string;
    location: string;
    typeOfWork: string;
    serviceCharge: number;
    materialCosts: number;
    totalFees: number;
    profitMargin: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/user-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  update: async (entryId: string, data: {
    username: string;
    phoneNumber: string;
    location: string;
    typeOfWork: string;
    serviceCharge: number;
    materialCosts: number;
    totalFees: number;
    profitMargin: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/user-data/${entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  remove: async (entryId: string) => {
    const response = await fetch(`${API_BASE_URL}/user-data/${entryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
};
