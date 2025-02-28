// Define Activity interface if it's not imported from elsewhere
interface Activity {
  id?: string;
  name: string;
  activityDate?: Date;
  location?: string;
  imageUrl?: string;
  items?: any[];
}

export type RootStackParamList = {
  Login: undefined;
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