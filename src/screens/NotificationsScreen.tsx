import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  type: 'activity' | 'invitation' | 'system';
  image?: string;
}

// Örnek bildirimler
const notifications: Notification[] = [
  {
    id: '1',
    title: 'Yeni Davet',
    message: 'Ahmet Yılmaz sizi Tenis Dersi etkinliğine davet etti',
    createdAt: new Date(Date.now() - 3600000), // 1 saat önce
    read: false,
    type: 'invitation',
    image: 'https://picsum.photos/200',
  },
  {
    id: '2',
    title: 'Etkinlik Hatırlatması',
    message: 'Yoga Dersi yarın saat 10:00\'da başlayacak',
    createdAt: new Date(Date.now() - 7200000), // 2 saat önce
    read: true,
    type: 'activity',
    image: 'https://picsum.photos/200',
  },
];

const NotificationItem = ({ notification }: { notification: Notification }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification
      ]}
    >
      {notification.image && (
        <Image 
          source={{ uri: notification.image }} 
          style={styles.notificationImage} 
        />
      )}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.notificationTime}>
          {format(notification.createdAt, 'HH:mm', { locale: tr })}
        </Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const NotificationsScreen = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bildirim bulunmuyor</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: '#f0f1ff',
  },
  notificationImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5D5FEF',
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
});

export default NotificationsScreen; 