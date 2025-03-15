// Define Activity interface if it's not imported from elsewhere
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

export type RootStackParamList = {
  Welcome: undefined;
  LoginForm: undefined;
  Register: undefined;
  Main: undefined;
  CreateActivity: {
    activity?: Activity;
  };
  Notifications: undefined;
};

export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
}; 