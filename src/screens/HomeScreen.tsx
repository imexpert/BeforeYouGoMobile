import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useState, useMemo } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

// Renk sabitleri
const COLORS = {
  GREEN: '#34C759',
  ORANGE: '#FF9500',
  RED: '#FF3B30',
};

// Örnek veri tipi
interface Activity {
  id: string;
  name: string;
  activityDate: Date;
  createdAt: Date;
  imageUrl: string;
  participantCount: number;
}

// Davet tipi
interface Invitation {
  id: string;
  activity: Activity;
  invitedBy: {
    name: string;
    photoUrl: string;
  };
  status: 'pending' | 'accepted' | 'declined';
}

// Örnek veriler
const activities: Activity[] = [
  {
    id: '1',
    name: 'Yoga Dersi',
    activityDate: new Date('2024-03-19T10:00:00'),
    createdAt: new Date('2024-03-15T14:30:00'),
    imageUrl: 'https://picsum.photos/200',
    participantCount: 12,
  },
  {
    id: '2',
    name: 'Pilates Dersi',
    activityDate: new Date(),
    createdAt: new Date('2024-03-16T09:15:00'),
    imageUrl: 'https://picsum.photos/200',
    participantCount: 10,
  },
  {
    id: '3',
    name: 'Zumba Dersi',
    activityDate: new Date(Date.now() + 86400000),
    createdAt: new Date('2024-03-18T11:45:00'),
    imageUrl: 'https://picsum.photos/200',
    participantCount: 15,
  },
  {
    id: '4',
    name: 'Spinning Dersi',
    activityDate: new Date(Date.now() + 172800000),
    createdAt: new Date('2024-03-17T16:20:00'),
    imageUrl: 'https://picsum.photos/200',
    participantCount: 18,
  },
  {
    id: '5',
    name: 'Kickbox Dersi',
    activityDate: new Date('2024-03-15T15:00:00'),
    createdAt: new Date('2024-03-10T10:00:00'),
    imageUrl: 'https://picsum.photos/200',
    participantCount: 10,
  },
];

// Örnek davetler
const invitations: Invitation[] = [
  {
    id: '1',
    activity: {
      id: '6',
      name: 'Tenis Dersi',
      activityDate: new Date(Date.now() + 259200000), // 3 gün sonra
      createdAt: new Date(),
      imageUrl: 'https://picsum.photos/200',
      participantCount: 4,
    },
    invitedBy: {
      name: 'Ahmet Yılmaz',
      photoUrl: 'https://picsum.photos/200',
    },
    status: 'pending',
  },
  {
    id: '2',
    activity: {
      id: '7',
      name: 'Yüzme Kursu',
      activityDate: new Date(Date.now() + 432000000), // 5 gün sonra
      createdAt: new Date(),
      imageUrl: 'https://picsum.photos/200',
      participantCount: 8,
    },
    invitedBy: {
      name: 'Mehmet Demir',
      photoUrl: 'https://picsum.photos/200',
    },
    status: 'pending',
  },
];

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

const ActivityCard = ({ activity }: { activity: Activity }) => {
  const navigation = useNavigation();
  const status = getActivityStatus(activity.activityDate);

  const handleEdit = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CreateActivity',
        params: { activity },
      })
    );
  };

  const handleDelete = () => {
    // Silme işlemi
    console.log('Delete activity:', activity.id);
  };

  return (
    <View style={[styles.card, { borderColor: status.color }]}>
      <View style={styles.statusBadge}>
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.text}
        </Text>
      </View>

      <View style={styles.cardHeader}>
        <Image
          source={{ uri: activity.imageUrl }}
          style={styles.activityImage}
        />
        <View style={styles.headerContent}>
          <Text style={styles.activityName} numberOfLines={1}>
            {activity.name}
          </Text>
          <Text style={styles.dateText} numberOfLines={1}>
            {format(activity.activityDate, 'dd MMM yyyy HH:mm', { locale: tr })}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.createdAtText} numberOfLines={1}>
            {format(activity.createdAt, 'dd MMM yyyy')}
          </Text>
          <View style={styles.participantContainer}>
            <Text style={styles.participantCount}>{activity.participantCount}</Text>
            <Text style={styles.participantLabel}>Katılımcı</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleEdit}
            >
              <Icon name="edit" size={20} color="#5D5FEF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleDelete}
            >
              <Icon name="delete" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const InvitationCard = ({ invitation }: { invitation: Invitation }) => {
  const handleAccept = () => {
    console.log('Accept invitation:', invitation.id);
  };

  const handleDecline = () => {
    console.log('Decline invitation:', invitation.id);
  };

  return (
    <View style={styles.invitationCard}>
      <Image
        source={{ uri: invitation.activity.imageUrl }}
        style={styles.invitationImage}
      />
      <View style={styles.invitationContent}>
        <Text style={styles.invitationTitle} numberOfLines={1}>
          {invitation.activity.name}
        </Text>
        <View style={styles.invitedByContainer}>
          <Image
            source={{ uri: invitation.invitedBy.photoUrl }}
            style={styles.inviterPhoto}
          />
          <Text style={styles.invitedByText}>
            <Text style={styles.inviterName}>{invitation.invitedBy.name}</Text> davet etti
          </Text>
        </View>
        <Text style={styles.invitationDate}>
          {format(invitation.activity.activityDate, 'dd MMM yyyy HH:mm', { locale: tr })}
        </Text>
      </View>
      <View style={styles.invitationActions}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Icon name="check" size={20} color="#34C759" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
          <Icon name="close" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const navigation = useNavigation();

  const { upcomingActivities, pastActivities } = useMemo(() => {
    const now = new Date();
    return {
      upcomingActivities: activities
        .filter(activity => activity.activityDate >= now)
        .sort((a, b) => a.activityDate.getTime() - b.activityDate.getTime()),
      pastActivities: activities
        .filter(activity => activity.activityDate < now)
        .sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime()),
    };
  }, []);

  const handleCreateActivity = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CreateActivity',
        params: {},
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {invitations.length > 0 && (
        <View style={styles.invitationsSection}>
          <Text style={styles.invitationsTitle}>Davetler</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.invitationsList}
          >
            {invitations.map(invitation => (
              <InvitationCard key={invitation.id} invitation={invitation} />
            ))}
          </ScrollView>
        </View>
      )}

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
        data={activeTab === 'upcoming' ? upcomingActivities : pastActivities}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming'
                ? 'Gelecek aktivite bulunmuyor'
                : 'Geçmiş aktivite bulunmuyor'}
            </Text>
          </View>
        }
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
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  activityImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardContent: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createdAtText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  participantContainer: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  participantCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D5FEF',
  },
  participantLabel: {
    fontSize: 10,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
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
  invitationsSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  invitationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
    marginBottom: 8,
  },
  invitationsList: {
    paddingHorizontal: 8,
    gap: 8,
  },
  invitationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 8,
    width: 280,
    alignItems: 'center',
  },
  invitationImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  invitationContent: {
    flex: 1,
    marginLeft: 8,
  },
  invitationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  invitedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  inviterPhoto: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  invitedByText: {
    fontSize: 12,
    color: '#666',
  },
  inviterName: {
    fontWeight: '500',
    color: '#000',
  },
  invitationDate: {
    fontSize: 12,
    color: '#666',
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    padding: 4,
  },
  declineButton: {
    padding: 4,
  },
});

export default HomeScreen; 