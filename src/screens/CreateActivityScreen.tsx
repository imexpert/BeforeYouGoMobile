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
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
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
import { activityService, ActivityPayload } from '../api/services/activity';
import RNFS from 'react-native-fs';

// Default image import
const DEFAULT_IMAGE = require('../assets/images/emptyactivity.png');

// Utility function to get default image as base64
const getDefaultImageBase64 = async (): Promise<string> => {
  try {
    // Get the resolved source of the default image
    const source = Image.resolveAssetSource(DEFAULT_IMAGE);
    
    if (source && source.uri) {
      // Fetch the image and convert to base64
      const response = await fetch(source.uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            // Remove any data URL prefix and return only base64
            const base64 = reader.result.replace(/^data:.*?;base64,/, '');
            resolve(base64);
          } else {
            reject(new Error('Failed to convert image to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    throw new Error('Could not resolve default image source');
  } catch (error) {
    console.error('Error converting default image to base64:', error);
    return '';
  }
};

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

// Utility function to process image data
const processImageData = (imageUri: string | null): string | null => {
  if (!imageUri) return null;
  
  // Remove any data URL prefix (handles both image/jpeg and application/octet-stream)
  const base64Data = imageUri.replace(/^data:.*?;base64,/, '');
  
  if (base64Data) {
    if (base64Data.length > 1024 * 1024) {
      console.warn('Base64 image data is too large (>1MB), this may cause issues');
    }
    return base64Data;
  }
  
  // For file URIs, return null
  console.log('Image URI not in base64 format, skipping:', imageUri);
  return null;
};

// Function to safely stringify JSON with large objects
const safeStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    // If the object has circular references or is too large, try to create a simplified version
    if (obj.activity && obj.activity.imageData) {
      const simplifiedObj = {
        ...obj,
        activity: {
          ...obj.activity,
          imageData: obj.activity.imageData ? '[IMAGE DATA]' : null
        }
      };
      console.warn('Original object could not be stringified, using simplified version');
      return JSON.stringify(simplifiedObj);
    }
    throw error;
  }
};

const CreateActivityScreen = ({ navigation, route }: Props) => {
  const activity = route.params?.activity;
  const isEditing = !!activity;

  const [name, setName] = useState(activity?.name || '');
  const [date, setDate] = useState(activity?.activityDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState(activity?.location || '');
  const [image, setImage] = useState<string | null>(activity?.imageUrl || null);
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState<'kg' | 'lt' | 'adet'>('adet');
  const [itemQuantity, setItemQuantity] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [isLoading, setIsLoading] = useState(false);

  const units = [
    { label: 'Adet', value: 'adet' },
    { label: 'Kilogram', value: 'kg' },
    { label: 'Litre', value: 'lt' },
  ];

  // Load activity items when editing
  useEffect(() => {
    if (isEditing && activity?.items) {
      // Convert API items to ActivityItem format
      const convertedItems = activity.items.map((item: any) => ({
        id: item.id || Date.now().toString(),
        name: item.name,
        unit: convertApiUnitToLocal(item.unit),
        quantity: item.itemCount,
      }));
      setItems(convertedItems);
    }
  }, [isEditing, activity]);

  // Convert API unit format to local format
  const convertApiUnitToLocal = (apiUnit: string): 'kg' | 'lt' | 'adet' => {
    switch (apiUnit) {
      case 'Kilogram':
        return 'kg';
      case 'Litre':
        return 'lt';
      case 'Adet':
      default:
        return 'adet';
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      
      // On Android, we need to show the time picker after date is selected
      if (Platform.OS === 'android' && datePickerMode === 'date') {
        setDatePickerMode('time');
        setTimeout(() => {
          setShowDatePicker(true);
        }, 100);
      }
    }
  };

  const showDatepicker = () => {
    setDatePickerMode('date');
    setShowDatePicker(true);
  };

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: true,
      maxWidth: 800,
      maxHeight: 800,
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        console.log('Image picked:', {
          hasBase64: !!asset.base64,
          hasUri: !!asset.uri,
          base64Length: asset.base64?.length
        });
        
        if (asset.base64) {
          // Directly use base64 data without adding prefix
          setImage(asset.base64);
          setIsDefaultImage(false);
        } else if (asset.uri) {
          console.warn('Image picked without base64 data, using URI instead:', asset.uri);
          setImage(asset.uri);
          setIsDefaultImage(false);
        }
      }
    });
  };

  const handleEditItem = (item: ActivityItem) => {
    setItemName(item.name);
    setItemUnit(item.unit);
    setItemQuantity(item.quantity.toString());
    setEditingItemId(item.id);
    setShowAddItemModal(true);
  };

  const handleAddItem = () => {
    if (!itemName || !itemQuantity) return;

    const newItem: ActivityItem = {
      id: editingItemId || Date.now().toString(),
      name: itemName,
      unit: itemUnit,
      quantity: Number(itemQuantity),
    };

    if (editingItemId) {
      // Update existing item
      setItems(items.map(item => 
        item.id === editingItemId ? newItem : item
      ));
      setEditingItemId(null);
    } else {
      // Add new item
      setItems([...items, newItem]);
    }

    setItemName('');
    setItemQuantity('');
    setItemUnit('adet');
    setShowAddItemModal(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Birim değerini API formatına dönüştürme
  const mapUnitToApiFormat = (unit: 'kg' | 'lt' | 'adet'): string => {
    switch (unit) {
      case 'kg':
        return 'Kilogram';
      case 'lt':
        return 'Litre';
      case 'adet':
        return 'Adet';
      default:
        return 'Adet';
    }
  };

  // API'ye veri gönderme
  const sendDataToApi = async (data: ActivityPayload) => {
    try {
      if (isEditing && activity?.id) {
        // Aktivite güncelleme işlemi
        const response = await activityService.updateActivityWithItems(activity.id, data);
        
        // API yanıtını kontrol et
        if (!response.isSuccess) {
          // Oturum hatası kontrolü
          if (response.message?.includes('Oturum süresi doldu')) {
            console.log('Oturum süresi doldu, login ekranına yönlendirilecek');
            return { success: false, sessionExpired: true };
          }
          throw new Error(response.message || 'Aktivite güncellenirken bir hata oluştu');
        }
        
        return { success: true, data: response.data };
      } else {
        // Yeni aktivite oluşturma işlemi
        const response = await activityService.createActivityWithItems(data);
        
        // API yanıtını kontrol et
        if (!response.isSuccess) {
          // Oturum hatası kontrolü
          if (response.message?.includes('Oturum süresi doldu')) {
            console.log('Oturum süresi doldu, login ekranına yönlendirilecek');
            return { success: false, sessionExpired: true };
          }
          throw new Error(response.message || 'Aktivite oluşturulurken bir hata oluştu');
        }
        
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!name) return;

    // Tarih formatını API'nin beklediği formata dönüştürme
    const formattedDate = date.toISOString();

    // Process image data - convert default image to base64 if no image is selected
    let processedImageData = image ? processImageData(image) : null;
    
    if (!processedImageData && isDefaultImage) {
      try {
        processedImageData = await getDefaultImageBase64();
      } catch (error) {
        console.error('Error getting default image base64:', error);
      }
    }

    console.log('Processed image data:', {
      hasImage: !!image,
      isDefaultImage,
      processedImageDataLength: processedImageData?.length,
      imageFormat: processedImageData?.substring(0, 30) + '...' // Log the start of the image data
    });

    console.log(processedImageData); 
    
    // API'ye gönderilecek veriyi hazırlama
    const activityData: ActivityPayload = {
      activity: {
        ...(isEditing && activity?.id ? { id: activity.id } : {}),
        name,
        activityTime: formattedDate,
        location,
        imageData: processedImageData,
      },
      activityItems: items.map(item => ({
        ...(isEditing ? { id: item.id } : {}),
        name: item.name,
        unit: mapUnitToApiFormat(item.unit),
        itemCount: item.quantity,
      })),
    };

    // Detailed logging for debugging
    console.log('Activity Data Structure:', {
      activityName: name,
      activityTime: formattedDate,
      location: location,
      imageDataExists: processedImageData ? 'Yes (data not shown)' : 'No',
      imageDataType: processedImageData ? typeof processedImageData : 'null',
      imageDataLength: processedImageData ? processedImageData.length : 0,
      itemsCount: items.length,
      isEditing: isEditing,
    });
    
    // Log each item separately for easier debugging
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        name: item.name,
        unit: item.unit,
        apiUnit: mapUnitToApiFormat(item.unit),
        quantity: item.quantity,
        id: item.id
      });
    });

    // Try to stringify with a size limit for console output
    try {
      const jsonString = safeStringify(activityData);
      console.log('JSON String Length:', jsonString.length);
      
      // Only log the first part of the JSON if it's very large
      if (jsonString.length > 1000) {
        console.log('JSON Preview (first 1000 chars):', jsonString.substring(0, 1000) + '...');
      } else {
        console.log('Full JSON:', jsonString);
      }
      
      // Check if image data is too large
      if (processedImageData && processedImageData.length > 500000) {
        console.warn('Warning: Image data is very large (' + processedImageData.length + ' chars). This may cause JSON parsing issues.');
      }
    } catch (error) {
      console.error('Error stringifying activity data:', error);
      Alert.alert(
        'Hata',
        'Veri formatında bir sorun var. Lütfen resim eklemeden tekrar deneyin.'
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendDataToApi(activityData);
      
      // Oturum süresi doldu kontrolü
      if (!result.success && result.sessionExpired) {
        console.log('Session expired, not showing success message');
        // Burada ek bir işlem yapmaya gerek yok, API client zaten navigasyonu ve toast mesajını hallediyor
        setIsLoading(false);
        return;
      }
      
      // Başarılı durumda kullanıcıya bilgi ver ve geri dön
      Alert.alert(
        'Başarılı', 
        isEditing ? 'Aktivite başarıyla güncellendi' : 'Aktivite başarıyla oluşturuldu'
      );
      navigation.goBack();
    } catch (error) {
      console.error('API error details:', error);
      
      // Check if it's a JSON parse error
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      // 401 hatası artık merkezi olarak API client'ta ele alınıyor
      // Sadece JSON parse hatası ve diğer hataları burada ele alıyoruz
      if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
        Alert.alert(
          'Hata',
          'Veri formatı hatası. Resim boyutu çok büyük olabilir. Lütfen daha küçük bir resim seçin veya resim eklemeden tekrar deneyin.'
        );
      } else if (!errorMessage.includes('Oturum süresi doldu')) {
        // Oturum süresi doldu hatası dışındaki diğer hataları göster
        Alert.alert(
          'Hata',
          'Aktivite kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      }
    } finally {
      setIsLoading(false);
    }
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

  // Set isDefaultImage based on whether we have an image from the activity
  useEffect(() => {
    if (activity?.imageUrl) {
      setIsDefaultImage(false);
    }
  }, [activity]);

  // Render item for the table
  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.name}</Text>
      <Text style={styles.tableCell}>{item.quantity}</Text>
      <Text style={styles.tableCell}>{item.unit}</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => handleEditItem(item)}
          style={styles.editButton}
        >
          <Icon name="edit" size={20} color="#5D5FEF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRemoveItem(item.id)}
          style={styles.removeButton}
        >
          <Icon name="delete" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Table header component
  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.tableHeaderText}>Öğe</Text>
      <Text style={styles.tableHeaderText}>Miktar</Text>
      <Text style={styles.tableHeaderText}>Birim</Text>
      <Text style={styles.tableHeaderText}>İşlemler</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#5D5FEF" />
          <Text style={styles.loadingText}>Kaydediliyor...</Text>
        </View>
      )}
      
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
            disabled={!name || isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Güncelle' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          {image ? (
            <View style={styles.defaultImageContainer}>
              <Image 
                source={{ uri: image }} 
                style={styles.selectedImage} 
                resizeMode="stretch"
              />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={handleImagePick}
              >
                <Text style={styles.changeImageText}>Resmi Değiştir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.defaultImageContainer}>
              <Image 
                source={DEFAULT_IMAGE} 
                style={styles.defaultImage} 
                resizeMode="stretch"
              />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={handleImagePick}
              >
                <Text style={styles.changeImageText}>Resmi Değiştir</Text>
              </TouchableOpacity>
            </View>
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
              onPress={showDatepicker}
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
                <TableHeader />
                <FlatList
                  data={items}
                  renderItem={renderItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz öğe eklenmemiş</Text>
                <TouchableOpacity
                  style={styles.addFirstItemButton}
                  onPress={() => setShowAddItemModal(true)}
                >
                  <Text style={styles.addFirstItemText}>İlk Öğeyi Ekle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={datePickerMode}
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </ScrollView>

      {/* Simple Modal Implementation */}
      <Modal
        visible={showAddItemModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowAddItemModal(false);
          setEditingItemId(null);
          setItemName('');
          setItemQuantity('');
          setItemUnit('adet');
        }}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => {
            setShowAddItemModal(false);
            setEditingItemId(null);
            setItemName('');
            setItemQuantity('');
            setItemUnit('adet');
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={e => e.stopPropagation()}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingItemId ? 'Öğeyi Düzenle' : 'Öğe Ekle'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowAddItemModal(false);
                      setEditingItemId(null);
                      setItemName('');
                      setItemQuantity('');
                      setItemUnit('adet');
                    }}
                    style={styles.closeButton}
                  >
                    <Icon name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalForm}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>İsim</Text>
                    <TextInput
                      style={styles.input}
                      value={itemName}
                      onChangeText={setItemName}
                      placeholder="Öğe adını girin"
                    />
                  </View>

                  <View style={styles.formGroup}>
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

                  <View style={styles.formGroup}>
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
                    <Text style={styles.addButtonText}>
                      {editingItemId ? 'Güncelle' : 'Ekle'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  defaultImageContainer: {
    position: 'relative',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'stretch',
  },
  selectedImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'stretch',
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
    marginBottom: 20,
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
    textAlign: 'center',
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
    textAlign: 'center',
  },
  actionButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
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
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  formGroup: {
    marginBottom: 16,
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
    marginBottom: 12,
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
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addFirstItemButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#5D5FEF',
    borderRadius: 8,
  },
  addFirstItemText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    alignItems: 'center',
  },
  changeImageText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CreateActivityScreen; 