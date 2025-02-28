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
  updateActivityWithItems: async (activityId: string, data: ActivityPayload): Promise<ApiResponse<any>> => {
    try {
      // Validate data before sending
      if (!data.activity || !data.activityItems) {
        throw new Error('Invalid activity data structure');
      }
      
      // Process the data to handle large images
      const processedData = processActivityData(data);
      
      // Ensure the data can be properly stringified
      JSON.stringify(processedData);
      
      return apiClient.put<any>(`/Activities/${activityId}`, processedData);
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
  getActivityById: async (activityId: string): Promise<ApiResponse<any>> => {
    return apiClient.get<any>(`/Activities/${activityId}`);
  },
  
  // Delete an activity
  deleteActivity: async (activityId: string): Promise<ApiResponse<any>> => {
    return apiClient.delete<any>(`/Activities/${activityId}`);
  }
}; 