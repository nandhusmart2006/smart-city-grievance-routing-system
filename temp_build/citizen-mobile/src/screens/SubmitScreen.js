import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Image } from 'react-native';
import { submitGrievance } from '../api';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const SubmitScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        citizen_name: '',
        citizen_phone: '',
        area: '',
        text: ''
    });
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [imageUri, setImageUri] = useState(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need camera roll permissions to upload an image.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const getLocation = async () => {
        setLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                setLocating(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            
            // Try to reverse geocode
            let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (reverseGeocode.length > 0) {
                const place = reverseGeocode[0];
                const areaName = `${place.street || ''} ${place.city || place.subregion || ''}, ${place.region || ''}`.trim();
                setFormData({ ...formData, area: areaName });
            } else {
                setFormData({ ...formData, area: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}` });
            }
        } catch (error) {
            Alert.alert('Location Error', 'Could not fetch your location.');
        } finally {
            setLocating(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.text) {
            Alert.alert('Error', 'Grievance description is required.');
            return;
        }

        setLoading(true);
        try {
            // NOTE: In a real production app, imageUri would be uploaded to S3 or base64 attached here.
            // For now, we submit the text and area directly to the AI Triage API.
            const response = await submitGrievance(formData);
            const ticketId = response.data.ticket_id;
            Alert.alert(
                'Success!', 
                `Your grievance has been submitted successfully.\n\nTicket ID: ${ticketId}\nEstimated SLA: ${response.data.estimated_resolution_time}`,
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
            );
        } catch (error) {
            Alert.alert('Failure', 'Could not submit your grievance. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>File Grievance</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.infoText}>
                    Please provide detailed information about the issue. Our AI will automatically classify and assign it.
                </Text>

                {/* IMAGE UPLOAD SECTION */}
                <TouchableOpacity style={styles.imageUploadBtn} onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imageUploadPlaceholder}>
                            <Ionicons name="camera-outline" size={32} color="#64748b" />
                            <Text style={styles.imageUploadText}>Add Photo Evidence</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Area / Location</Text>
                        <TouchableOpacity onPress={getLocation} disabled={locating} style={styles.locationBtn}>
                            {locating ? <ActivityIndicator size="small" color="#4f46e5" /> : (
                                <>
                                    <FontAwesome5 name="location-arrow" size={12} color="#4f46e5" />
                                    <Text style={styles.locationBtnText}>Get Current GPS</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Anna Nagar, Chennai"
                        placeholderTextColor="#94a3b8"
                        value={formData.area}
                        onChangeText={(txt) => setFormData({ ...formData, area: txt })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description <Text style={{color: '#ef4444'}}>*</Text></Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe the issue in detail (English, Tamil, Tanglish)..."
                        placeholderTextColor="#94a3b8"
                        multiline={true}
                        numberOfLines={5}
                        textAlignVertical="top"
                        value={formData.text}
                        onChangeText={(txt) => setFormData({ ...formData, text: txt })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. John Doe"
                        placeholderTextColor="#94a3b8"
                        value={formData.citizen_name}
                        onChangeText={(txt) => setFormData({ ...formData, citizen_name: txt })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. +91 9876543210"
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        value={formData.citizen_phone}
                        onChangeText={(txt) => setFormData({ ...formData, citizen_phone: txt })}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit to Smart City AI</Text>
                    )}
                </TouchableOpacity>
                <View style={{height: 40}} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 20,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    backButton: {
        width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
        borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 15,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    scrollContent: { padding: 24 },
    infoText: { fontSize: 15, color: '#64748b', marginBottom: 20, lineHeight: 22 },
    imageUploadBtn: {
        width: '100%', height: 160, backgroundColor: '#e2e8f0', borderRadius: 16,
        marginBottom: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed'
    },
    imageUploadPlaceholder: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    imageUploadText: { marginTop: 10, fontSize: 14, color: '#64748b', fontWeight: '600' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    inputGroup: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155' },
    locationBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
    locationBtnText: { color: '#4f46e5', fontSize: 12, fontWeight: 'bold' },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0f172a',
    },
    textArea: { height: 120 },
    submitButton: {
        backgroundColor: '#4f46e5', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
        marginTop: 10, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    submitButtonDisabled: { backgroundColor: '#818cf8' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default SubmitScreen;
