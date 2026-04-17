import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tamil Nadu</Text>
                <Text style={styles.subtitle}>Smart City Intelligence</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.greeting}>Welcome, Citizen.</Text>
                <Text style={styles.description}>
                    Report issues instantly. Our AI triage system ensures minimal delay in resolution.
                </Text>

                <View style={styles.cardContainer}>
                    <TouchableOpacity 
                        style={styles.card} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Submit')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#eef2ff' }]}>
                            <MaterialIcons name="report-problem" size={32} color="#4f46e5" />
                        </View>
                        <Text style={styles.cardTitle}>File Grievance</Text>
                        <Text style={styles.cardDesc}>Report a new civil, electrical or civic issue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.card} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Track')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
                            <FontAwesome5 name="search-location" size={28} color="#16a34a" />
                        </View>
                        <Text style={styles.cardTitle}>Track Status</Text>
                        <Text style={styles.cardDesc}>Check live resolution ETA and AI severity</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: '#1e293b',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
        marginTop: 10,
    },
    description: {
        fontSize: 15,
        color: '#64748b',
        marginTop: 8,
        lineHeight: 22,
        marginBottom: 32,
    },
    cardContainer: {
        gap: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        color: '#64748b',
    }
});

export default WelcomeScreen;
