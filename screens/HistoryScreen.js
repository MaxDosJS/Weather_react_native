import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const citiesData = [
  { id: '1', name: 'Kokshetau' },
  { id: '2', name: 'Astana' },
  { id: '3', name: 'Omsk' },
  { id: '4', name: 'Almaty' },
  
];

const HistoryScreen = () => {
  const navigation = useNavigation();

  const handleCityPress = (cityName) => {
    
    navigation.navigate('Home', { cityName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search History</Text>
      <FlatList
        data={citiesData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCityPress(item.name)}>
            <Text style={styles.cityItem}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cityItem: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default HistoryScreen;