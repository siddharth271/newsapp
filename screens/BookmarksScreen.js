import React, { useEffect, useState } from 'react';
import {
  View, FlatList, SafeAreaView, StyleSheet, Text, ActivityIndicator, Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewsCard from '../components/NewsCard';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    try {
      const json = await AsyncStorage.getItem('bookmarkedArticles');
      if (json) setBookmarks(JSON.parse(json));
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = loadBookmarks;
    loadBookmarks();
    return unsubscribe;
  }, []);

  const openArticle = (url) => {
    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#00f5ff" size="large" />
      ) : bookmarks.length === 0 ? (
        <Text style={styles.emptyText}>No bookmarked articles yet.</Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <NewsCard news={item} onPress={() => openArticle(item.url || item.link)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
});
