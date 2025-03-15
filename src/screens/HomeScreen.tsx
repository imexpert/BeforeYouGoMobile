import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, differenceInDays, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Activity } from '../navigation/types';
import { activityService } from '../api/services/activity';
import { useToast } from 'react-native-toast-notifications';

// Renk sabitleri
const COLORS = {
  GREEN: '#34C759',
  ORANGE: '#FF9500',
  RED: '#FF3B30',
};

// Aktivite durumunu hesaplayan fonksiyon
const getActivityStatus = (activityDate: Date) => {
  const today = new Date();
  const diffDays = differenceInDays(activityDate, today);
  
  if (diffDays > 1) return { color: COLORS.GREEN, text: 'Yaklaşıyor' };
  if (diffDays === 1) return { color: COLORS.ORANGE, text: 'Yarın' };
  if (diffDays === 0) return { color: COLORS.RED, text: 'Bugün' };
  return { color: '#999', text: 'Geçmiş' };
};

// NavigationProp tipini basitleştirelim
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CARD_COLORS = [
  '#4A90E2',  // Mavi
  '#F5A623',  // Turuncu
  '#FF6B6B',  // Pembe
  '#A352FF',  // Mor
  '#50E3C2',  // Yeşil
];

const ActivityCard = ({ 
  activity, 
  index, 
  onRefresh 
}: { 
  activity: Activity; 
  index: number;
  onRefresh: () => void;
}) => {
  const navigation = useNavigation();
  const toast = useToast();
  const activityDate = activity.activityTime ? parseISO(activity.activityTime) : new Date();
  const backgroundColor = CARD_COLORS[index % CARD_COLORS.length];

  const handleEdit = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CreateActivity',
        params: { activity },
      })
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Aktiviteyi Sil',
      'Bu aktiviteyi silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await activityService.deleteActivity(activity.id);
              
              if (response.isSuccess) {
                toast.show('Aktivite başarıyla silindi', {
                  type: 'success',
                });
                // Ana sayfayı yenile
                onRefresh();
              } else {
                toast.show(response.message || 'Aktivite silinirken bir hata oluştu', {
                  type: 'danger',
                });
              }
            } catch (error) {
              console.error('Error deleting activity:', error);
              toast.show('Aktivite silinirken bir hata oluştu', {
                type: 'danger',
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.card]}
      onPress={handleEdit}
      activeOpacity={0.8}
    >
      <View style={[styles.cardBackground]}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Icon name="delete" size={16} color="#1B3B6F" />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <View style={styles.leftContent}>
            <Image
              source={activity.imageUrl ? { uri: activity.imageUrl } : require('../assets/images/emptyactivity.png')}
              style={styles.activityImage}
            />
            <View style={styles.textContent}>
              <Text style={styles.activityName} numberOfLines={1}>
                {activity.name}
              </Text>
              <Text style={styles.activityTitle} numberOfLines={1}>
                {format(activityDate, 'dd MMM yyyy HH:mm', { locale: tr })}
              </Text>
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>{activity.userCount}</Text>
                <Text style={styles.statsLabel}>Kullanıcı</Text>
                <Text style={styles.statsDivider}>•</Text>
                <Text style={styles.statsText}>{activity.itemCount}</Text>
                <Text style={styles.statsLabel}>Parça</Text>
                <Text style={styles.statsText}>{activity.participantCount}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const navigation = useNavigation();
  const toast = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add focus effect to refresh activities
  useFocusEffect(
    React.useCallback(() => {
      fetchActivities();
    }, [])
  );

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await activityService.getUserActivities();
        
      if (response.isSuccess) {
        console.log(response.data);
        // Add default values for userCount and itemCount
        const activitiesWithCounts = response.data?.map(activity => ({
          ...activity,
          userCount: activity.userCount || 0,
          itemCount: activity.itemCount || 0
        })) || [];
        setActivities(activitiesWithCounts);
      } else {
        setError(response.message || 'Aktiviteler yüklenirken bir hata oluştu');
        toast.show(response.message || 'Aktiviteler yüklenirken bir hata oluştu', {
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Aktiviteler yüklenirken bir hata oluştu');
      toast.show('Aktiviteler yüklenirken bir hata oluştu', {
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { upcomingActivities, pastActivities } = useMemo(() => {
    const now = new Date();
    return {
      upcomingActivities: activities
        .filter(activity => new Date(activity.activityTime) >= now)
        .sort((a, b) => new Date(a.activityTime).getTime() - new Date(b.activityTime).getTime()),
      pastActivities: activities
        .filter(activity => new Date(activity.activityTime) < now)
        .sort((a, b) => new Date(b.activityTime).getTime() - new Date(a.activityTime).getTime()),
    };
  }, [activities]);

  const handleCreateActivity = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CreateActivity',
        params: {},
      })
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D5FEF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'upcoming' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Gelecek Aktiviteler
          </Text>
          <View style={[
            styles.badgeContainer,
            activeTab === 'upcoming' && styles.activeBadgeContainer
          ]}>
            <Text style={[
              styles.badgeText,
              activeTab === 'upcoming' && styles.activeBadgeText
            ]}>
              {upcomingActivities.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'past' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.activeTabText,
            ]}
          >
            Geçmiş Aktiviteler
          </Text>
          <View style={[
            styles.badgeContainer,
            activeTab === 'past' && styles.activeBadgeContainer
          ]}>
            <Text style={[
              styles.badgeText,
              activeTab === 'past' && styles.activeBadgeText
            ]}>
              {pastActivities.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          activeTab === 'upcoming' 
            ? upcomingActivities 
            : activeTab === 'past'
            ? pastActivities
            : []
        }
        renderItem={({ item, index }) => (
          <ActivityCard 
            activity={item} 
            index={index} 
            onRefresh={fetchActivities}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyContentContainer}>
              <Text style={styles.emptyText}>
                {error || (activeTab === 'upcoming'
                  ? 'Gelecek aktivite bulunmuyor'
                  : 'Geçmiş aktivite bulunmuyor')}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchActivities}
              >
                <Icon name="refresh" size={20} color="#5D5FEF" />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchActivities}
          >
            <Icon name="refresh" size={20} color="#5D5FEF" />
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </TouchableOpacity>
        }
        onRefresh={fetchActivities}
        refreshing={isLoading}
      />

      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleCreateActivity}
      >
        <Icon name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  activeTabButton: {
    backgroundColor: '#5D5FEF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  badgeContainer: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  activeBadgeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeBadgeText: {
    color: '#fff',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  retryButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(93, 95, 239, 0.1)',
  },
  listContainer: {
    padding: 12,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  cardBackground: {
    padding: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.85)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  statsLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  statsDivider: {
    marginHorizontal: 8,
    color: 'rgba(255,255,255,0.5)',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 6,
    zIndex: 1,
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#5D5FEF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(93, 95, 239, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 80,
    gap: 8,
  },
  refreshButtonText: {
    color: '#5D5FEF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen; 