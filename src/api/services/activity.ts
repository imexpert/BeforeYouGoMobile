import { apiClient } from '../client';
import { ApiResponse } from '../types';

// Activity payload interface
export interface ActivityPayload {
  activity: {
    id?: string; // Optional ID for editing existing activities
    name: string;
    activityTime: string;
    location: string;
    imageData: string | null;
  };
  activityItems: {
    id?: string; // Optional ID for editing existing items
    name: string;
    unit: string;
    itemCount: number;
  }[];
}

// Helper function to validate and process activity data
const processActivityData = (data: ActivityPayload): ActivityPayload => {
  // Create a copy to avoid modifying the original
  const processedData = { ...data };
  
  // Check if imageData is too large (> 1MB)
  if (
    processedData.activity.imageData && 
    processedData.activity.imageData.length > 1024 * 1024
  ) {
    console.warn('Image data is too large, this may cause issues with the API');
    
    // You could implement image resizing here if needed
    // For now, we'll just warn about it
  }
  
  return processedData;
};

export interface Activity {
  id: string;
  name: string;
  userId: string;
  activityTime: string;
  location: string;
  activityCode: string;
  imageUrl: string | null;
  userRole: string;
  isOwner: boolean;
  userCount: number;
  itemCount: number;
  activityItems: {
    id: string;
    name: string;
    unit: string;
    itemCount: number;
  }[];
  createdAt: string;
  participantCount: number;
}

// Activity service for handling activity-related API calls
export const activityService = {
  // Create a new activity with items
  createActivityWithItems: async (data: ActivityPayload): Promise<ApiResponse<any>> => {
    try {
      // Validate data before sending
      if (!data.activity || !data.activityItems) {
        throw new Error('Invalid activity data structure');
      }
      
      // Process the data to handle large images
      const processedData = processActivityData(data);
      
      // Ensure the data can be properly stringified
      JSON.stringify(processedData);
      
      return apiClient.post<any>('/Activities/CreateWithItems', processedData);
    } catch (error) {
      console.error('Error in createActivityWithItems:', error);
      if (error instanceof SyntaxError) {
        console.error('JSON parsing error. Data cannot be properly stringified.');
      }
      throw error;
    }
  },
  
  // Update an existing activity with items
  updateActivityWithItems: async (id: string, data: ActivityPayload): Promise<ApiResponse<any>> => {
    try {
      // Validate data before sending
      if (!data.activity) {
        throw new Error('Invalid activity data structure');
      }
      
      // Process the data to handle large images
      const processedData = processActivityData(data);
      
      // Ensure the data can be properly stringified
      JSON.stringify(processedData.activity);
      console.log(processedData.activityItems);
      return apiClient.put<any>(`/Activities/Update/${id}`, processedData.activity);
    } catch (error) {
      console.error('Error in updateActivityWithItems:', error);
      if (error instanceof SyntaxError) {
        console.error('JSON parsing error. Data cannot be properly stringified.');
      }
      throw error;
    }
  },
  
  // Get all activities
  getActivities: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<any>('/Activities');
  },
  
  // Get a specific activity by ID
  getActivityById: async (id: number): Promise<ApiResponse<Activity>> => {
    return apiClient.get<Activity>(`/Activities/GetById/${id}`);
  },
  
  // Delete an activity
  deleteActivity: async (activityId: string): Promise<ApiResponse<any>> => {
    return apiClient.delete<any>(`/Activities/Delete/${activityId}`);
  },

  // Get user activities
  getUserActivities: async (): Promise<ApiResponse<Activity[]>> => {
    try {
      const response = await apiClient.get<Activity[]>('/Activities/GetUserActivities');
      
      // Ensure all activities have default values for new fields
      if (response.isSuccess && response.data) {
        response.data = response.data.map(activity => ({
          ...activity,
          userRole: activity.userRole || '',
          isOwner: activity.isOwner || false,
          userCount: activity.userCount || 0,
          itemCount: activity.itemCount || 0,
          activityItems: activity.activityItems || [],
          activityCode: activity.activityCode || ''
        }));
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  },
}; 