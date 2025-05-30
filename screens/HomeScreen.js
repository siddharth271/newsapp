import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
  Animated,
  RefreshControl
} from 'react-native';
import CategoryTabs from '../components/CategoryTabs';
import NewsCard from '../components/NewsCard';
import newsData from '../data/newsData';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Top');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = new Animated.Value(0);

  const filteredNews = newsData.filter(news => 
    selectedCategory === 'Top' || news.category === selectedCategory
  );

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.titleContainer, { opacity: headerOpacity }]}>
        <Text style={styles.header}>PulseNews</Text>
        <Text style={styles.subtitle}>Stay informed, stay ahead</Text>
      </Animated.View>
      <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <NewsCard 
            news={item} 
            index={index}
            onPress={() => console.log('Open article:', item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.contentContainer}
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
    backgroundColor: '#0a0a0a' 
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#0a0a0a',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00f5ff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 2,
    fontWeight: '400',
  },
  contentContainer: {
    paddingBottom: 100,
  },
});