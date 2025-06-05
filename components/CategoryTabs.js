import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const categories = ['Top', 'Technology', 'Sports', 'Health', 'Business', 'Entertainment', 'Science'];

export default function CategoryTabs({ selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.tab, selected === cat && styles.activeTab]}
          onPress={() => onSelect(cat)}
        >
          <Text style={[styles.tabText, selected === cat && styles.activeTabText]}>{cat}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  tab: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  activeTab: {
    backgroundColor: '#00f5ff',
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#0a0a0a',
    fontWeight: '700',
  },
});
