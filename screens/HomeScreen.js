import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet,ImageBackground, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from "lodash";
import { theme } from '../theme';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import * as Progress from 'react-native-progress';
import { StatusBar } from 'expo-status-bar';
import { weatherImages } from '../constants';
import { getData, storeData } from '../utils/asyncStorage';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();

  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({});

  
  useEffect(() => {
    if (route.params && route.params.cityName) {
      const cityName = route.params.cityName;
      handleLocation({ name: cityName }); 
    }
  }, [route.params]);

  const handleSearch = search => {
    if (search && search.length > 2)
      fetchLocations({ cityName: search }).then(data => {
        setLocations(data);
      });
  };

  const handleLocation = loc => {
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then(data => {
      setLoading(false);
      setWeather(data);
      storeData('city', loc.name);
    });
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Kokshetau';
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { location, current } = weather;
  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={styles.container}
  >
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        style={styles.background}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          {/* search section */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchInputContainer,
                { backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' },
              ]}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={'lightgray'}
                  style={styles.searchInput}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={styles.searchIconContainer}
              >
                {showSearch ? (
                  <XMarkIcon size="25" color="white" />
                ) : (
                  <MagnifyingGlassIcon size="25" color="white" />
                )}
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View style={styles.locationsContainer}>
                {locations.map((loc, index) => {
                  let showBorder = index + 1 !== locations.length;
                  let borderClass = showBorder ? ' border-b-2 border-b-gray-400' : '';
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleLocation(loc)}
                      style={'flex-row items-center border-0 p-3 px-4 mb-1 ' + borderClass}
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text style={styles.locationText}>{loc?.name}, {loc?.country}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* forecast section */}
          <View style={styles.forecastContainer}>
            {/* location */}
            <Text style={styles.locationText}>
              {location?.name},
              <Text style={{ ...styles.locationText, fontSize: 16, fontWeight: 'normal' }}>
                {location?.country}
              </Text>
            </Text>
            {/* weather icon */}
            <View style={{ ...styles.weatherIcon, flexDirection: 'row', justifyContent: 'center' }}>
              <Image
                source={weatherImages[current?.condition?.text || 'other']}
                style={styles.weatherIcon}
              />
            </View>
            {/* degree celcius */}
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperatureText}>{current?.temp_c}&#176;</Text>
              <Text style={styles.conditionText}>{current?.condition?.text}</Text>
            </View>

            {/* other stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statsItem}>
                <Image source={require('../assets/icons/wind.png')} style={styles.statsIcon} />
                <Text style={styles.statsText}>{current?.wind_kph}km</Text>
              </View>
              <View style={styles.statsItem}>
                <Image source={require('../assets/icons/drop.png')} style={styles.statsIcon} />
                <Text style={styles.statsText}>{current?.humidity}%</Text>
              </View>
              <View style={styles.statsItem}>
                <Image source={require('../assets/icons/sun.png')} style={styles.statsIcon} />
                <Text style={styles.statsText}>
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          {/* forecast for next days */}
          <View style={styles.forecastDaysContainer}>
            <View style={styles.forecastDaysTitle}>
              <CalendarDaysIcon size="22" color="white" style={styles.forecastDaysIcon} />
              <Text style={styles.forecastDayText}>Daily forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={styles.forecastScrollView}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                const date = new Date(item.date);
                const options = { weekday: 'long' };
                let dayName = date.toLocaleDateString('en-US', options);
                dayName = dayName.split(',')[0];

                return (
                  <View key={index} style={styles.forecastDayItem}>
                    <Image
                      source={weatherImages[item?.day?.condition?.text || 'other']}
                      style={styles.forecastDayIcon}
                    />
                    <Text style={styles.forecastDayTemperature}>{item?.day?.avgtemp_c}&#176;</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
 
    
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    blurRadius: 70,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    height: '7%',
    marginHorizontal: 4,
    position: 'relative',
    zIndex: 50,
  },
  searchInputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 999,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    color: 'white',
  },
  searchIconContainer: {
    borderRadius: 999,
    backgroundColor: theme.bgWhite(0.3),
    padding: 10,
    margin: 1,
  },
  locationsContainer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'gray',
    top: 40,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    position: 'relative',
    left: 90,
  },
  forecastContainer: {
    marginHorizontal: 4,
    flex: 1,
    justifyContent: 'space-around',
    marginBottom: 2,
    marginTop: -5,
  },
  weatherIcon: {
    width: 100,
    height: 100,
    position: "relative",
    bottom: 10,
    left: 60,
  },
  temperatureContainer: {
    position: "relative",
    bottom: -5,
    left: 4
  },
  temperatureText: {
    fontSize: 48,
    position: 'relative',
    left: 150,
    bottom: 80,
    color: 'white',
    fontWeight: 'bold',
  },
  conditionText: {
    fontSize: 20,
    position: 'relative',
    left: 135,
    bottom: 80,
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    position: 'relative',
    bottom: 100,
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  statsIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  statsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forecastDaysContainer: {
    marginBottom: 2,
    marginHorizontal: 5,
    position: 'relative',
    bottom: 100
  },
  forecastDaysTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
   marginLeft: 14,
  },
  forecastDaysIcon: {
    width: 22,
    height: 22,
    marginRight: 4,
  
  },
  forecastDayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forecastScrollView: {
    paddingHorizontal: 15,
    
  },
  forecastDayItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 20,
    padding: 8,
    marginRight: 4,
    backgroundColor: theme.bgWhite(0.15),
    
  },
  forecastDayIcon: {
    width: 44,
    height: 44,
  },
  forecastDayTemperature: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;