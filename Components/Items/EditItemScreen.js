import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import languageService from '../Globals/Store/Lang';

const API_BASE_URL = 'https://planetdory.dwrylight.com/api';
const AUTH_TOKEN = 'Bearer nPGpb5zlVvVJ197sNyBvLiGIBWsc1X8ACRolWnLO76533a07';

const EditItemScreen = ({ navigation, route }) => {
  const { item } = route.params;
  
  const [formData, setFormData] = useState({
    name: item.name || '',
    name_ar: item.name_ar || '',
    item_code: item.item_code || '', // Handle null values properly
    qty: item.qty?.toString() || '',
    amount: item.amount?.toString() || '',
    selling_rate: item.selling_rate?.toString() || '',
    cost_to_company: item.cost_to_company?.toString() || '',
    description: item.description || '', // Handle null values properly
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState(item.images || []);
  const [loading, setLoading] = useState(false);

  const translate = (key) => languageService.translate(key);

  // Debug: Log the item data when component mounts
  useEffect(() => {
    console.log('=== EDIT ITEM SCREEN INITIALIZATION ===');
    console.log('Item received:', JSON.stringify(item, null, 2));
    console.log('FormData initialized:', JSON.stringify(formData, null, 2));
    console.log('item_code value:', item.item_code, 'type:', typeof item.item_code);
    console.log('description value:', item.description, 'type:', typeof item.description);
  }, []);

  // Update form data when item changes (in case of timing issues)
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        name_ar: item.name_ar || '',
        item_code: item.item_code || '', // This should handle null values
        qty: item.qty?.toString() || '',
        amount: item.amount?.toString() || '',
        selling_rate: item.selling_rate?.toString() || '',
        cost_to_company: item.cost_to_company?.toString() || '',
        description: item.description || '', // This should handle null values
      });
      console.log('FormData updated from item:', {
        item_code: item.item_code || '',
        description: item.description || ''
      });
    }
  }, [item]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Pick images
  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera roll permissions to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        setSelectedImages(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select images');
    }
  };

  // Remove new image
  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Item name is required');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append ALL fields exactly like Postman (including empty ones)
      formDataToSend.append("name", formData.name || "");
      formDataToSend.append("name_ar", formData.name_ar || "");
      formDataToSend.append("qty", formData.qty || "");
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("amount", formData.amount || "");
      formDataToSend.append("selling_rate", formData.selling_rate || "");
      formDataToSend.append("cost_to_company", formData.cost_to_company || "");
      formDataToSend.append("item_code", formData.item_code || "");

      // Handle images - always append images[] field (empty if no images)
      if (selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          formDataToSend.append('images[]', {
            uri: image.uri,
            type: 'image/jpeg',
            name: `image_${index}.jpg`,
          });
        });
      } else {
        formDataToSend.append('images[]', '');
      }

      // Log the FormData for debugging
      console.log('=== FORM DATA BEING SENT (matching Postman) ===');
      console.log('🔍 CHECKING item_code and description in payload:');
      for (let [key, value] of formDataToSend.entries()) {
        if (typeof value === 'object' && value.uri) {
          console.log(`${key}:`, { uri: value.uri, type: value.type, name: value.name });
        } else {
          console.log(`${key}:`, value);
          // Highlight item_code and description
          if (key === 'item_code') {
            console.log('✅ item_code is being sent:', value);
          }
          if (key === 'description') {
            console.log('✅ description is being sent:', value);
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}/update_item_by_id/${item.id}`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Update item response:', result);

      // Check for success based on Postman response format (status: 200)
      if (result.status === 200) {
        Alert.alert(
          'Success',
          result.message || 'Item updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to update item');
      }
    } catch (error) {
      console.error('Update item error:', error);
      Alert.alert('Error', 'Network error while updating item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={['#6B7D3D', '#4A5D23']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Item</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name (Arabic)</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسم العنصر"
              value={formData.name_ar}
              onChangeText={(value) => handleInputChange('name_ar', value)}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('itemCode')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item code"
              value={formData.item_code}
              onChangeText={(value) => handleInputChange('item_code', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter item description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.qty}
              onChangeText={(value) => handleInputChange('qty', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Selling Rate</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.selling_rate}
                onChangeText={(value) => handleInputChange('selling_rate', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cost to Company</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.cost_to_company}
                onChangeText={(value) => handleInputChange('cost_to_company', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Current Images */}
        {existingImages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Images</Text>
            <ScrollView horizontal style={styles.imagePreview} showsHorizontalScrollIndicator={false}>
              {existingImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeExistingImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Add New Images */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Add New Images</Text>
            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
              <Ionicons name="camera" size={20} color="#6B7D3D" />
              <Text style={styles.addImageText}>Add Images</Text>
            </TouchableOpacity>
          </View>

          {selectedImages.length > 0 && (
            <ScrollView horizontal style={styles.imagePreview} showsHorizontalScrollIndicator={false}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeNewImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Update Item</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 125, 61, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addImageText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#6B7D3D',
    fontWeight: '600',
  },
  imagePreview: {
    marginTop: 10,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#6B7D3D',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 30,
  },
});

export default EditItemScreen;