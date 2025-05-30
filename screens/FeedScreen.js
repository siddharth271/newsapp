import React, { useState, useRef } from 'react'; 
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Image,
  Dimensions,
  PanGestureHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import newsData from '../data/newsData';

const { width, height } = Dimensions.get('window');

export default function FeedScreen() {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'flash'
  const [refreshing, setRefreshing] = useState(false);
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const extendedNews = [...newsData, ...newsData, ...newsData];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const onFlashGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onFlashHandlerStateChange = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    const threshold = height * 0.25;

    if (Math.abs(translationY) > threshold || Math.abs(velocityY) > 1000) {
      if (translationY > 0 && currentFlashIndex > 0) {
        setCurrentFlashIndex(currentFlashIndex - 1);
      } else if (translationY < 0 && currentFlashIndex < extendedNews.length - 1) {
        setCurrentFlashIndex(currentFlashIndex + 1);
      }
    }
    
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  };

  const renderListItem = ({ item, index }) => {
    const isExpanded = expandedItems.has(item.id + index);
    
    return (
      <TouchableOpacity 
        style={styles.listCard}
        onPress={() => toggleExpanded(item.id + index)}
        activeOpacity={0.9}
      >
        <View style={styles.listImageContainer}>
          <Image source={{ uri: item.image }} style={styles.listImage} />
          <View style={styles.listCategoryBadge}>
            <Text style={styles.listCategoryText}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={isExpanded ? 0 : 2}>
            {item.title}
          </Text>
          <Text 
            style={styles.listDescription} 
            numberOfLines={isExpanded ? 0 : 2}
          >
            {item.description}
          </Text>
          
          <View style={styles.listFooter}>
            <View style={styles.listMeta}>
              <Text style={styles.listSource}>{item.source}</Text>
              <View style={styles.listDot} />
              <Text style={styles.listTime}>{item.time}</Text>
            </View>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#00f5ff" 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFlashCard = () => {
    const item = extendedNews[currentFlashIndex];
    
    return (
      <PanGestureHandler
        onGestureEvent={onFlashGestureEvent}
        onHandlerStateChange={onFlashHandlerStateChange}
      >
        <Animated.View 
          style={[
            styles.flashCard,
            {
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={styles.flashImageContainer}>
            <Image source={{ uri: item.image }} style={styles.flashImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.9)']}
              style={styles.flashGradient}
            />
          </View>

          <View style={styles.flashContent}>
            <View style={styles.flashHeader}>
              <Text style={styles.flashCategory}>{item.category}</Text>
              <Text style={styles.flashTime}>{item.time}</Text>
            </View>

            <Text style={styles.flashTitle}>{item.title}</Text>
            <Text style={styles.flashDescription}>{item.description}</Text>

            <View style={styles.flashFooter}>
              <Text style={styles.flashSource}>Source: {item.source}</Text>
              <TouchableOpacity style={styles.flashShareButton}>
                <Ionicons name="share-outline" size={20} color="#00f5ff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.flashHints}>
            <View style={styles.flashHintTop}>
              <Ionicons name="chevron-up" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.flashHintText}>Previous</Text>
            </View>
            <View style={styles.flashHintBottom}>
              <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.flashHintText}>Next</Text>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>
          {viewMode === 'list' ? 'News Feed' : 'Flash Feed'}
        </Text>
        {viewMode === 'flash' && (
          <Text style={styles.headerSubtitle}>
            {currentFlashIndex + 1} of {extendedNews.length}
          </Text>
        )}
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={[styles.modeButton, viewMode === 'list' && styles.modeButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list" size={20} color={viewMode === 'list' ? '#000' : '#888'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, viewMode === 'flash' && styles.modeButtonActive]}
          onPress={() => setViewMode('flash')}
        >
          <Ionicons name="flash" size={20} color={viewMode === 'flash' ? '#000' : '#888'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (viewMode === 'flash') {
    return (
      <SafeAreaView style={styles.container}>
        <ListHeader />
        <View style={styles.flashContainer}>
          {renderFlashCard()}
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentFlashIndex + 1) / extendedNews.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={extendedNews}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderListItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00f5ff"
            colors={['#00f5ff']}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00f5ff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modeButtonActive: {
    backgroundColor: '#00f5ff',
    borderColor: '#00f5ff',
  },
  
  // List Mode Styles
  listContent: {
    paddingBottom: 100,
  },
  listCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  listImageContainer: {
    height: 160,
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  listCategoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 245, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listCategoryText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  listContent: {
    padding: 16,
  },
  listTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  listDescription: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listSource: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  listDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#555',
    marginHorizontal: 6,
  },
  listTime: {
    color: '#666',
    fontSize: 12,
  },
  
  // Flash Mode Styles  
  flashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  flashCard: {
    width: width - 20,
    height: height - 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  flashImageContainer: {
    height: '50%',
    position: 'relative',
  },
  flashImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  flashGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  flashContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  flashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flashCategory: {
    backgroundColor: '#00f5ff',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  flashTime: {
    color: '#888',
    fontSize: 12,
  },
  flashTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 28,
    marginBottom: 12,
  },
  flashDescription: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    flex: 1,
  },
  flashFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flashSource: {
    color: '#888',
    fontSize: 14,
  },
  flashShareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.3)',
  },
  flashHints: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  flashHintTop: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  flashHintBottom: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  flashHintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1.5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00f5ff',
    borderRadius: 1.5,
  },
});