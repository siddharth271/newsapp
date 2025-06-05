import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Animated,
  RefreshControl,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import CategoryTabs from '../components/CategoryTabs';
import NewsCard from '../components/NewsCard';

// 🔧 Replace this with your local IP if testing on a real device
const BACKEND_URL = 'http://192.168.31.71:8090'; // e.g. http://192.168.1.100:8000

const CATEGORIES = {
  Top: 'top',
  Business: 'business',
  Technology: 'technology',
  Sports: 'sports',
  Entertainment: 'entertainment',
  Science: 'science',
  Health: 'health'
};

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Top');
  const [newsData, setNewsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const scrollY = new Animated.Value(0);

  const fetchNews = async (category = 'top', page = 1, isRefresh = false) => {
    try {
      setError(null);
      
      if (page === 1 && !isRefresh) {
        setLoading(true);
      }
      
      if (page > 1) {
        setLoadingMore(true);
      }

      const url = `${BACKEND_URL}/api/news?limit=20&page=${page}&category=${category}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      console.log('API Response:', {
        count: json.count,
        page: json.page,
        hasMore: json.has_more,
        totalAvailable: json.total_available
      });

      if (!json.news || !Array.isArray(json.news)) {
        throw new Error('Invalid news data format received from server');
      }

      const articles = json.news
        .filter(item => item && item.title && item.title.trim() !== '') // Filter out invalid items
        .map((item, index) => ({
          id: item.id || `${category}-${page}-${index}`,
          title: item.title.trim(),
          description: item.summary || item.description || 'No description available',
          url: item.url,
          image_url: validateImageUrl(item.image_url),
          source: item.source || 'PulseNews',
          publishedAt: item.published_date || item.publishedAt || new Date().toISOString(),
          category: category
        }));

      if (page === 1 || isRefresh) {
        setNewsData(articles);
        setCurrentPage(1);
      } else {
        // Append new articles, removing duplicates
        setNewsData(prevData => {
          const existingIds = new Set(prevData.map(item => item.id));
          const newArticles = articles.filter(article => !existingIds.has(article.id));
          return [...prevData, ...newArticles];
        });
      }
      
      setHasMore(json.has_more || false);
      setCurrentPage(page);

    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError(error.message);
      
      if (page === 1) {
        setNewsData([]); // Reset to empty array on error for first page
      }
      
      // Show user-friendly error message
      Alert.alert(
        'Error Loading News',
        `Failed to load news: ${error.message}. Please check your internet connection and try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Validate and format image URLs
  const validateImageUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    try {
      // Skip invalid URLs
      if (url.includes('placeholder') && url.includes('via.placeholder.com')) {
        return url; // Allow placeholder images
      }
      
      // Ensure URL starts with http/https
      if (!url.startsWith('http')) {
        if (url.startsWith('//')) {
          return `https:${url}`;
        } else if (url.startsWith('/')) {
          return null; // Skip relative URLs that can't be resolved
        } else {
          return `https://${url}`;
        }
      }
      
      // Basic URL validation
      new URL(url);
      return url;
    } catch (e) {
      console.warn('Invalid image URL:', url, e.message);
      return null;
    }
  };

  // Fetch news when category changes
  useEffect(() => {
    const category = CATEGORIES[selectedCategory];
    console.log('Category changed to:', selectedCategory, 'API category:', category);
    setCurrentPage(1);
    setHasMore(true);
    fetchNews(category, 1);
  }, [selectedCategory]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const category = CATEGORIES[selectedCategory];
    setCurrentPage(1);
    setHasMore(true);
    fetchNews(category, 1, true);
  }, [selectedCategory]);

  // Handle load more (infinite scroll)
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    console.log('Loading more news...', {
      currentPage,
      hasMore,
      loadingMore
    });
    
    const category = CATEGORIES[selectedCategory];
    const nextPage = currentPage + 1;
    fetchNews(category, nextPage);
  }, [selectedCategory, currentPage, hasMore, loadingMore]);

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    console.log('Selecting category:', category);
    setSelectedCategory(category);
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.titleContainer, { opacity: headerOpacity }]}>
        <Text style={styles.header}>Pulse</Text>
        <Text style={styles.subtitle}>Stay informed, stay ahead</Text>
      </Animated.View>
      <CategoryTabs 
        selected={selectedCategory} 
        onSelect={handleCategorySelect}
        categories={Object.keys(CATEGORIES)}
      />
    </View>
  );

  const openArticle = useCallback((url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Failed to open URL:', err);
        Alert.alert('Error', 'Failed to open article link');
      });
    }
  }, []);

  const renderNewsItem = useCallback(({ item }) => (
    <NewsCard
      news={item}
      onPress={() => openArticle(item.url)}
    />
  ), [openArticle]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#00f5ff" />
        <Text style={styles.loadingText}>Loading more news...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {error ? 'Failed to load news' : 'No news available'}
        </Text>
        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}
      </View>
    );
  };

  // Key extractor
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00f5ff" />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      ) : (
        <FlatList
          data={newsData}
          keyExtractor={keyExtractor}
          renderItem={renderNewsItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00f5ff"
              colors={['#00f5ff']}
              title="Pull to refresh"
              titleColor="#888"
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={undefined} // Let FlatList handle this for better performance
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
  headerContainer: {
    paddingTop: 55,
    paddingBottom: 5,
    backgroundColor: '#0a0a0a',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00f5ff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontWeight: '400',
  },
  contentContainer: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});