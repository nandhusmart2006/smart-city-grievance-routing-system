import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { getGrievanceStatus } from '../api';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const TrackScreen = ({ navigation }) => {
    const [ticketId, setTicketId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleTrack = async () => {
        if (!ticketId) {
            Alert.alert('Error', 'Please enter a Ticket ID.');
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const data = await getGrievanceStatus(ticketId.trim().toUpperCase());
            setResult(data);
        } catch (error) {
            Alert.alert('Not Found', 'Could not find a grievance with that Ticket ID.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RESOLVED': return '#16a34a';
            case 'IN_PROGRESS': return '#eab308';
            default: return '#dc2626'; // OPEN
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Status</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter Ticket ID (e.g. TKT-123456)"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="characters"
                        value={ticketId}
                        onChangeText={setTicketId}
                    />
                    <TouchableOpacity 
                        style={styles.searchButton}
                        onPress={handleTrack}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" size="small" /> : <MaterialIcons name="search" size={24} color="#fff" />}
                    </TouchableOpacity>
                </View>

                {result && (
                    <View style={styles.resultCard}>
                        <View style={styles.statusHeader}>
                            <Text style={styles.ticketIdText}>{result.ticket_id}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(result.status) }]}>
                                    {result.status}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.dateText}>Submitted on: {new Date(result.created_at).toLocaleString()}</Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Department:</Text>
                            <Text style={styles.detailValue}>{result.department}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Predicted SLA Risk:</Text>
                            <Text style={styles.detailValue}>{result.sla_risk}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>ETA Resolution:</Text>
                            <Text style={styles.detailValue}>{result.estimated_resolution_time}</Text>
                        </View>

                        <Text style={styles.summaryLabel}>Original Text:</Text>
                        <Text style={styles.summaryText}>{result.text}</Text>

                        {result.normalized_text && (
                            <>
                                <Text style={styles.summaryLabel}>AI Translation / Triage:</Text>
                                <Text style={styles.summaryText}>{result.normalized_text}</Text>
                            </>
                        )}
                        
                        <View style={styles.footerInfo}>
                            <FontAwesome5 name="robot" size={14} color="#64748b" />
                            <Text style={styles.footerText}>AI Predicted Severity: {result.severity_label}</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    scrollContent: {
        padding: 24,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#0f172a',
    },
    searchButton: {
        backgroundColor: '#4f46e5',
        borderRadius: 12,
        width: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ticketIdText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 13,
        color: '#94a3b8',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginTop: 20,
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 15,
        color: '#64748b',
        lineHeight: 22,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 8,
    },
    footerText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    }
});

export default TrackScreen;
