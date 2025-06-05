import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NewsCard({ news, onPress }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const saveBookmark = async () => {
    try {
      const existing = await AsyncStorage.getItem('bookmarkedArticles');
      const bookmarks = existing ? JSON.parse(existing) : [];
      const updated = [...bookmarks, news];
      await AsyncStorage.setItem('bookmarkedArticles', JSON.stringify(updated));
      alert('Bookmarked!');
    } catch (e) {
      console.error('Bookmark error:', e);
    }
  };

  // Improved image URL extraction and validation
  const getImageUrl = () => {
    console.log('News object for image:', {
      image_url: news.image_url,
      urlToImage: news.urlToImage,
      image: news.image,
      multimedia: news.multimedia
    });
    
    // Try multiple possible image fields
    let imageUrl = news.image_url || 
                   news.urlToImage || 
                   news.image || 
                   news.multimedia?.[0]?.url ||
                   news.media?.[0]?.url ||
                   news.enclosure?.url;
    
    if (!imageUrl) {
      console.log('No image URL found in any field');
      return null;
    }

    // Clean and validate URL
    imageUrl = imageUrl.trim();
    
    // Handle relative URLs
    if (imageUrl.startsWith('//')) {
      imageUrl = `https:${imageUrl}`;
    } else if (imageUrl.startsWith('/')) {
      // Can't resolve relative URLs without base domain
      console.log('Relative URL found, skipping:', imageUrl);
      return null;
    } else if (!imageUrl.startsWith('http')) {
      imageUrl = `https://${imageUrl}`;
    }

    // Basic URL validation - less restrictive
    try {
      const url = new URL(imageUrl);
      // Allow common image domains and formats
      if (url.hostname && (
        imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) ||
        url.hostname.includes('image') ||
        url.hostname.includes('photo') ||
        url.hostname.includes('media') ||
        url.hostname.includes('cdn') ||
        imageUrl.includes('placeholder')
      )) {
        console.log('Valid image URL found:', imageUrl);
        return imageUrl;
      } else {
        console.log('URL does not appear to be an image:', imageUrl);
        return imageUrl; // Still try to load it, let the Image component handle it
      }
    } catch (error) {
      console.log('Invalid URL format:', imageUrl, error.message);
      return null;
    }
  };

  const imageUrl = getImageUrl();

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (error) => {
    console.log('Image loading error:', error?.nativeEvent?.error || 'Unknown error');
    console.log('Failed URL:', imageUrl);
    setImageLoading(false);
    setImageError(true);
  };

  const renderImage = () => {
    if (!imageUrl) {
      // Show placeholder when no image URL
      return (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="newspaper-outline" size={40} color="#666" />
          <Text style={styles.placeholderText}>No Image Available</Text>
        </View>
      );
    }

    if (imageError) {
      // Show error placeholder
      return (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-off-outline" size={40} color="#666" />
          <Text style={styles.placeholderText}>Image Failed to Load</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: imageUrl,
            cache: 'force-cache' // Better caching
          }}
          style={styles.image}
          onLoad={handleImageLoad}
          onError={handleImageError}
          resizeMode="cover"
          // Remove timeout prop as it's not a valid Image prop
        />
        {imageLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#00f5ff" />
            <Text style={styles.loadingText}>Loading image...</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {renderImage()}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={3}>
          {news.title || 'No Title Available'}
        </Text>
        {(news.source_id || news.source?.name || news.source) && (
          <Text style={styles.source}>
            {news.source_id || news.source?.name || news.source}
          </Text>
        )}
        {(news.publishedAt || news.published_date) && (
          <Text style={styles.date}>
            {new Date(news.publishedAt || news.published_date).toLocaleDateString()}
          </Text>
        )}
        <TouchableOpacity onPress={saveBookmark} style={styles.bookmark}>
          <Ionicons name="bookmark-outline" size={20} color="#00f5ff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 180,
    width: '100%',
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  content: {
    padding: 15,
    position: 'relative',
    minHeight: 80,
  },
  title: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  source: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: '#888',
  },
  bookmark: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
});