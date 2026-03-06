import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { FileText, PlusCircle } from 'lucide-react-native';

export default function DPRScreen({ navigation }) {
    const [reportText, setReportText] = useState('');
    const [tasksCompleted, setTasksCompleted] = useState('');
    const [hoursLogged, setHoursLogged] = useState('8');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitDPR = () => {
        if (!reportText || !tasksCompleted) {
            Alert.alert('Error', 'Please describe your work done today');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert('Success', 'Daily Progress Report submitted.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }, 1200);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Submit DPR</Text>
                <Text style={styles.subtitle}>Log your daily progress report</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Tasks Completed Today (Count)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    value={tasksCompleted}
                    onChangeText={setTasksCompleted}
                />

                <Text style={styles.label}>Total Productive Hours Logged</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 8.5"
                    keyboardType="numeric"
                    value={hoursLogged}
                    onChangeText={setHoursLogged}
                />

                <Text style={styles.label}>End of Day Summary</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What did you accomplish today? Any blockers?"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    value={reportText}
                    onChangeText={setReportText}
                />

                <TouchableOpacity
                    style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                    onPress={submitDPR}
                    disabled={isSubmitting}
                >
                    <PlusCircle color="white" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.submitBtnText}>{isSubmitting ? 'Saving...' : 'Submit Report'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 24,
    },
    header: {
        marginTop: 40,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 4,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 40,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 14,
        fontSize: 15,
        color: '#0F172A',
    },
    textArea: {
        minHeight: 120,
    },
    submitBtn: {
        flexDirection: 'row',
        backgroundColor: '#38BDF8',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
