import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated
} from 'react-native';
import categories from '../constants/categories';

export default function CategoryTabs({ selected, onSelect }) {
  const scrollViewRef = useRef(null);
  const animatedValues = useRef(
    categories.reduce((acc, category) => {
      acc[category] = new Animated.Value(category === selected ? 1 : 0);
      return acc;
    }, {})
  ).current;

  useEffect(() => {
    categories.forEach(category => {
      Animated.timing(animatedValues[category], {
        toValue: category === selected ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [selected]);

  const handleTabPress = (category) => {
    onSelect(category);
    // Auto-scroll to center the selected tab
    const index = categories.indexOf(category);
    if (scrollViewRef.current && index > 0) {
      scrollViewRef.current.scrollTo({
        x: index * 100 - 50,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {categories.map((category) => {
          const isSelected = selected === category;
          const animatedValue = animatedValues[category];
          
          const backgroundColor = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255, 255, 255, 0.05)', '#00f5ff'],
          });
          
          const textColor = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['#888', '#000'],
          });
          
          const scale = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          });

          return (
            <Animated.View
              key={category}
              style={[
                styles.tabContainer,
                { transform: [{ scale }] }
              ]}
            >
              <TouchableOpacity
                onPress={() => handleTabPress(category)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.tab,
                    { backgroundColor }
                  ]}
                >
                  <Animated.Text
                    style={[
                      styles.tabText,
                      { color: textColor }
                    ]}
                    numberOfLines={1}
                  >
                    {category}
                  </Animated.Text>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 70,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  container: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tabContainer: {
    marginRight: 12,
  },
  tab: {
    minWidth: 80,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});