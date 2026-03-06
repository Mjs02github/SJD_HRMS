import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Share2, RefreshCw, Check, X } from 'lucide-react-native';

export default function SelfieAttendanceScreen({ navigation, route }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [locationPermission, setLocationPermission] = useState(null);

    const [photo, setPhoto] = useState(null);
    const [location, setLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status === 'granted');
        })();
    }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const data = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                    base64: true
                });
                setPhoto(data);

                // As soon as photo is taken, capture GPS
                if (locationPermission) {
                    let loc = await Location.getCurrentPositionAsync({});
                    setLocation({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude
                    });
                }
            } catch (e) {
                console.error("Camera fail", e);
            }
        }
    };

    const submitAttendance = async () => {
        setIsSubmitting(true);
        // Mock API call to backend /attendance/mark
        // which would include photo base64 and gps location
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert("Success", "Attendance Marked successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        }, 1500);
    };

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                <View style={styles.previewOverlay}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>GPS Status: {location ? "Acquired ✅" : "Fetching..."}</Text>
                        {location && (
                            <Text style={styles.subtext}>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
                        )}
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.roundBtn, { backgroundColor: '#EF4444' }]} onPress={() => setPhoto(null)}>
                            <X color="white" size={24} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.mainBtn, isSubmitting && { opacity: 0.5 }]}
                            onPress={submitAttendance}
                            disabled={isSubmitting || !location}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Check color="white" size={20} style={{ marginRight: 8 }} />
                                    <Text style={styles.btnText}>Submit IN</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="front"
                ref={cameraRef}
            >
                <View style={styles.cameraOverlay}>
                    <Text style={styles.instructionText}>Position your face clearly in the frame</Text>

                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.captureBtnInner} onPress={takePicture}>
                            <View style={styles.captureBtnCore} />
                        </TouchableOpacity>

                        <View style={{ width: 60 }} /> {/* Spacer */}
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        padding: 30,
        paddingTop: 60,
    },
    instructionText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    captureBtnInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnCore: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: 'white',
    },
    cancelBtn: {
        padding: 10,
    },
    cancelText: {
        color: 'white',
        fontSize: 16,
    },
    previewImage: {
        flex: 1,
        width: '100%',
    },
    previewOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    infoBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtext: {
        color: '#94A3B8',
        marginTop: 4,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roundBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#10B981',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    btnPrimary: {
        backgroundColor: '#38BDF8',
        padding: 15,
        borderRadius: 8,
    }
});
