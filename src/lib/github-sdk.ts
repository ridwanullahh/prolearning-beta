import { Configuration, OpenAIApi } from "openai";
import { config } from "./config";
import { authService } from "./auth";

class GitHubDatabase {
  private initialized = false;
  private tableName = 'prolearning_data';

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing GitHub SDK...');
      
      if (!config.github.owner || !config.github.repo || !config.github.token) {
        throw new Error('GitHub configuration is missing. Please check your environment variables.');
      }

      // Test the connection
      const response = await fetch(`https://api.github.com/repos/${config.github.owner}/${config.github.repo}`, {
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      this.initialized = true;
      console.log('GitHub SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GitHub SDK:', error);
      throw error;
    }
  }

  private async getData(): Promise<any> {
    try {
      await this.initialize();

      const response = await fetch(`https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${this.tableName}.json`, {
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 404) {
        console.warn('Data file not found. Returning default data.');
        return { users: [], courses: [] }; // Return default data
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to get data:', error);
      throw error;
    }
  }

  private async saveData(data: any): Promise<void> {
    try {
      await this.initialize();

      const content = JSON.stringify(data, null, 2);
      const contentBase64 = Buffer.from(content).toString('base64');

      // Get the current file's SHA for the update
      const getResponse = await fetch(`https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${this.tableName}.json`, {
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      let sha = '';
      if (getResponse.ok) {
        const getData = await getResponse.json();
        sha = getData.sha;
      } else if (getResponse.status === 404) {
        console.log('File does not exist, creating new file.');
      } else {
        throw new Error(`GitHub API error: ${getResponse.status} ${getResponse.statusText}`);
      }

      const body = JSON.stringify({
        message: 'Update prolearning data',
        content: contentBase64,
        sha: sha,
        branch: 'main', // Ensure this is your default branch name
      });

      const response = await fetch(`https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${this.tableName}.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('GitHub API error details:', errorData);
        throw new Error(`Failed to save data: ${response.status} ${response.statusText}`);
      }

      console.log('Data saved successfully');
    } catch (error) {
      console.error('Failed to save data:', error);
      throw error;
    }
  }

   async createUser(userData: any): Promise<any> {
    try {
      await this.initialize();

      const user = {
        id: `user_${Date.now()}`,
        ...userData,
        role: userData.role || 'learner',
        createdAt: new Date().toISOString(),
      };

      const existingData = await this.getData();
      existingData.users = existingData.users || [];
      existingData.users.push(user);

      await this.saveData(existingData);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: any): Promise<void> {
    try {
      await this.initialize();

      const data = await this.getData();
      const userIndex = data.users?.findIndex((user: any) => user.id === userId);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      data.users[userIndex] = {
        ...data.users[userIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await this.saveData(data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.initialize();

      const data = await this.getData();
      data.users = data.users?.filter((user: any) => user.id !== userId) || [];

      await this.saveData(data);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<any> {
    try {
      await this.initialize();

      const data = await this.getData();
      return data.users?.find((user: any) => user.id === userId) || null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      await this.initialize();
      const data = await this.getData();
      return data.users?.find((user: any) => user.email === email) || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async generateCourse(topic: string, userId: string): Promise<any> {
    try {
      await this.initialize();
      if (!config.openai.apiKey) {
        throw new Error('OpenAI API key is missing. Please check your environment variables.');
      }
      const configuration = new Configuration({
        apiKey: config.openai.apiKey,
      });
      const openai = new OpenAIApi(configuration);
  
      const prompt = `Generate a comprehensive course about ${topic}. Include a title, description, level, subject, difficulty, and a list of lessons. Each lesson should have a title and content.`;
      
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
      });
  
      const courseData = JSON.parse(response.data.choices[0].message?.content || '{}');
      
      const course = {
        id: `course_${Date.now()}`,
        ...courseData,
        userId: userId,
        createdAt: new Date().toISOString(),
      };
  
      const existingData = await this.getData();
      existingData.courses = existingData.courses || [];
      existingData.courses.push(course);
  
      await this.saveData(existingData);
      return course;
    } catch (error) {
      console.error('Error generating course:', error);
      throw error;
    }
  }

  async createCourse(courseData: any): Promise<any> {
    try {
      await this.initialize();
      
      const course = {
        id: `course_${Date.now()}`,
        ...courseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingData = await this.getData();
      existingData.courses = existingData.courses || [];
      existingData.courses.push(course);
      
      await this.saveData(existingData);
      return course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(courseId: string, updateData: any): Promise<void> {
    try {
      await this.initialize();
      
      const data = await this.getData();
      const courseIndex = data.courses?.findIndex((c: any) => c.id === courseId);
      
      if (courseIndex === -1) {
        throw new Error('Course not found');
      }

      data.courses[courseIndex] = {
        ...data.courses[courseIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      await this.saveData(data);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(courseId: string): Promise<void> {
    try {
      await this.initialize();
      
      const data = await this.getData();
      data.courses = data.courses?.filter((c: any) => c.id !== courseId) || [];
      
      await this.saveData(data);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  async getCourse(courseId: string): Promise<any> {
    try {
      await this.initialize();
      
      const data = await this.getData();
      return data.courses?.find((c: any) => c.id === courseId) || null;
    } catch (error) {
      console.error('Error getting course:', error);
      throw error;
    }
  }

  async getUserCourses(userId: string): Promise<any[]> {
    try {
      await this.initialize();
      
      const data = await this.getData();
      return data.courses?.filter((c: any) => c.userId === userId) || [];
    } catch (error) {
      console.error('Error getting user courses:', error);
      return [];
    }
  }

  async getInstructorCourses(instructorId: string): Promise<any[]> {
    try {
      await this.initialize();
      
      const data = await this.getData();
      return data.courses?.filter((c: any) => 
        c.userId === instructorId && c.type === 'instructor_created'
      ) || [];
    } catch (error) {
      console.error('Error getting instructor courses:', error);
      return [];
    }
  }

  async getPublishedCourses(): Promise<any[]> {
    try {
      await this.initialize();
      
      const data = await this.getData();
      return data.courses?.filter((c: any) => c.published === true) || [];
    } catch (error) {
      console.error('Error getting published courses:', error);
      return [];
    }
  }
}

export const db = new GitHubDatabase();
