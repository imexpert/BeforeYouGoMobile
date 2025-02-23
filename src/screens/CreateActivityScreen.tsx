import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from 'react-native-modal';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateActivity'>;
  route: RouteProp<RootStackParamList, 'CreateActivity'>;
};

// Item tipi tanımı
interface ActivityItem {
  id: string;
  name: string;
  unit: 'kg' | 'lt' | 'adet';
  quantity: number;
}

const CreateActivityScreen = ({ navigation, route }: Props) => {
  const activity = route.params?.activity;
  const isEditing = !!activity;

  const [name, setName] = useState(activity?.name || '');
  const [date, setDate] = useState(activity?.activityDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState(activity?.location || '');
  const [image, setImage] = useState<string | null>(activity?.imageUrl || null);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState<'kg' | 'lt' | 'adet'>('adet');
  const [itemQuantity, setItemQuantity] = useState('');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const units = [
    { label: 'Adet', value: 'adet' },
    { label: 'Kilogram', value: 'kg' },
    { label: 'Litre', value: 'lt' },
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    }, (response) => {
      if (response.assets && response.assets[0].uri) {
        setImage(response.assets[0].uri);
      }
    });
  };

  const handleAddItem = () => {
    if (!itemName || !itemQuantity) return;

    const newItem: ActivityItem = {
      id: Date.now().toString(),
      name: itemName,
      unit: itemUnit,
      quantity: Number(itemQuantity),
    };

    setItems([...items, newItem]);
    setItemName('');
    setItemQuantity('');
    setItemUnit('adet');
    setShowAddItemModal(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    const activityData = {
      name,
      date,
      location,
      image,
    };

    if (isEditing) {
      // Aktivite güncelleme işlemi
      console.log('Update activity:', { id: activity.id, ...activityData });
    } else {
      // Yeni aktivite oluşturma işlemi
      console.log('Create new activity:', activityData);
    }

    navigation.goBack();
  };

  const handleUnitSelect = (item: { value: 'kg' | 'lt' | 'adet' }) => {
    setItemUnit(item.value);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showAddItemModal) {
        setShowAddItemModal(false);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [showAddItemModal]);

  const AddItemModal = () => (
    <Modal
      isVisible={showAddItemModal}
      onBackdropPress={() => setShowAddItemModal(false)}
      onBackButtonPress={() => setShowAddItemModal(false)}
      useNativeDriver
      style={{ margin: 0 }}
      avoidKeyboard={true}
      propagateSwipe={true}
      backdropTransitionOutTiming={0}
      statusBarTranslucent
      coverScreen={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <View style={styles.addItemModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Öğe Ekle</Text>
            <TouchableOpacity 
              onPress={() => setShowAddItemModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalForm}>
            <View>
              <Text style={styles.label}>İsim</Text>
              <TextInput
                style={styles.input}
                value={itemName}
                onChangeText={setItemName}
                placeholder="Öğe adını girin"
              />
            </View>

            <View>
              <Text style={styles.label}>Birim</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={units}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Birim seçin"
                value={itemUnit}
                onChange={item => handleUnitSelect(item)}
              />
            </View>

            <View>
              <Text style={styles.label}>Miktar</Text>
              <TextInput
                style={styles.input}
                value={itemQuantity}
                onChangeText={setItemQuantity}
                keyboardType="numeric"
                placeholder="Miktar girin"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                (!itemName || !itemQuantity) && styles.addButtonDisabled
              ]}
              onPress={handleAddItem}
              disabled={!itemName || !itemQuantity}
            >
              <Text style={styles.addButtonText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite'}
          </Text>
          <TouchableOpacity 
            style={[styles.saveButton, !name && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={!name}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Güncelle' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.selectedImage} />
          ) : (
            <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
              <Icon name="add-photo-alternate" size={32} color="#666" />
              <Text style={styles.imagePickerText}>Resim Ekle</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Aktivite Adı</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Aktivite adını girin"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Aktivite Zamanı</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {format(date, 'dd MMMM yyyy HH:mm', { locale: tr })}
              </Text>
              <Icon name="event" size={24} color="#5D5FEF" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Aktivite Yeri</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Aktivite yerini girin"
            />
          </View>

          <View style={styles.itemsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Aktivite Öğeleri</Text>
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => setShowAddItemModal(true)}
              >
                <Icon name="add" size={24} color="#5D5FEF" />
              </TouchableOpacity>
            </View>

            {items.length > 0 ? (
              <View style={styles.itemsTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Öğe</Text>
                  <Text style={styles.tableHeaderText}>Miktar</Text>
                  <Text style={styles.tableHeaderText}>Birim</Text>
                  <Text style={styles.tableHeaderText}></Text>
                </View>
                {items.map(item => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.name}</Text>
                    <Text style={styles.tableCell}>{item.quantity}</Text>
                    <Text style={styles.tableCell}>{item.unit}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.id)}
                      style={styles.removeButton}
                    >
                      <Icon name="delete" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Henüz öğe eklenmemiş</Text>
            )}
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <AddItemModal />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#5D5FEF',
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageContainer: {
    padding: 16,
  },
  imagePicker: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  selectedImage: {
    height: 200,
    borderRadius: 12,
    width: '100%',
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  datePickerButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  itemsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addItemButton: {
    padding: 8,
  },
  itemsTable: {
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  removeButton: {
    padding: 4,
  },
  unitSelector: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitSelectorText: {
    fontSize: 16,
    color: '#000',
  },
  modalContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    gap: 16,
  },
  addButton: {
    height: 48,
    backgroundColor: '#5D5FEF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 16,
  },
  unitPickerContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxHeight: '50%',
  },
  unitOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  unitOptionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  unitOptionTextActive: {
    color: '#5D5FEF',
    fontWeight: '600',
  },
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#666',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000',
  },
  addItemModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
  },
});

export default CreateActivityScreen; 