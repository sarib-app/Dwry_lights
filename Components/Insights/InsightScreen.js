import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import languageService from '../Globals/Store/Lang';

const InsightsScreen = () => {
  const translate = (key) => languageService.translate(key);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{translate('insights')}</Text>
        <Text style={styles.subtitle}>Coming Soon...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafb' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#6B7D3D', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666' },
});

export default InsightsScreen;