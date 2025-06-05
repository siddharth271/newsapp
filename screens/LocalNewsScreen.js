import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewsCard from '../components/NewsCard';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const API_KEY = 'pub_43922e1a244343cea76907ce3680d5de'; // replace with your key
const PAGE_SIZE = 20;

const CITIES = [
  'Bhilwara',
  'Jaipur',
  'Udaipur',
  'Jodhpur',
  'Kota',
  'Ajmer',
  'Bikaner',
  'Alwar',
  'Sikar',
  'Chittorgarh',
];

export default function LocalScreen() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const saveCity = async (city) => {
    try {
      await AsyncStorage.setItem('selectedCity', city);
      setSelectedCity(city);
      fetchLocalNews(city);
    } catch (error) {
      console.error('Error saving city:', error);
    }
  };

  const loadCity = async () => {
    try {
      const city = await AsyncStorage.getItem('selectedCity');
      if (city) {
        setSelectedCity(city);
        fetchLocalNews(city);
      } else {
        setShowPicker(true); // Ask user to select
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading city:', error);
    }
  };

  const fetchLocalNews = async (city) => {
    if (!city) return;
    setLoading(true);
    try {
      const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en&q=${city}&page=1&pageSize=${PAGE_SIZE}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.results) {
        setNewsData(json.results);
      } else {
        setNewsData([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    if (selectedCity) {
      setRefreshing(true);
      fetchLocalNews(selectedCity);
    }
  };

  useEffect(() => {
    loadCity();
  }, []);

  const openArticle = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#00f5ff" />
      ) : showPicker ? (
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select Your City</Text>
          <Picker
            selectedValue={selectedCity}
            style={styles.picker}
            dropdownIconColor="#fff"
            onValueChange={(itemValue) => saveCity(itemValue)}
          >
            <Picker.Item label="Choose a city..." value={null} />
            {CITIES.map((city) => (
              <Picker.Item key={city} label={city} value={city} />
            ))}
          </Picker>
        </View>
      ) : (
        <>
          <View style={styles.cityBar}>
            <Text style={styles.cityLabel}>News from: {selectedCity}</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <Ionicons name="settings-outline" size={20} color="#00f5ff" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={newsData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <NewsCard news={item} onPress={() => openArticle(item.link)} />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#00f5ff"
              />
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#111',
    color: '#fff',
  },
  cityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#111',
    borderBottomColor: '#222',
    borderBottomWidth: 1,
  },
  cityLabel: {
    color: '#00f5ff',
    fontWeight: '600',
    fontSize: 16,
  },
});
