import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';

export default function OCRScreen() {
  const devices = useCameraDevice('back');
  const device = devices;
  const cameraRef = useRef(null);

  const [text, setText] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState(null);

  useEffect(() => {
    Camera.requestCameraPermission();
  }, []);

  if (!device) return null;

  const captureAndReadText = async () => {
    try {
      setLoading(true);
      setBill(null);

      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const uri = `file://${photo.path}`;
      setPhotoUri(uri);

      const result = await TextRecognition.recognize(uri);
      const numberPlate = (result?.text || '').trim().replace(/\s+/g, '');

      if (!numberPlate) {
        setText('No plate detected');
        setLoading(false);
        return;
      }

      setText(numberPlate);

      await fetchBill(numberPlate);
    } catch (err) {
      console.error(err);
      setText('Error reading text');
      setLoading(false);
    }
  };

  const fetchBill = async plate => {
    setLoading(true);

    try {
      const API_URL = 'https://eparking.onrender.com/api/check-plate';

      const response = await axios.post(API_URL, {
        license: plate,
      });

      const data = response.data;

      if (!data.success) {
        setBill({ error: data.error || 'Unknown API error' });
      } else {
        setBill(data.plateHistory); // OR setBill(data) depending on your backend
      }
    } catch (err) {
      console.log('Axios Error:', err);
      setBill({ error: 'Failed to reach server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        ref={cameraRef}
      />

      <TouchableOpacity onPress={captureAndReadText} style={styles.captureBtn}>
        <Text style={styles.captureText}>Capture</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: 'white', marginTop: 10 }}>Processing...</Text>
        </View>
      )}

      <View style={styles.resultBox}>
        <Text style={styles.resultText}>{text || 'Waiting...'}</Text>
      </View>

      {/* BILL UI */}
      {bill && (
        <View style={styles.billBox}>
          {bill.error ? (
            <Text style={styles.errorText}>{bill.error}</Text>
          ) : (
            <>
              <Text style={styles.billTitle}>
                Parking Bill for {bill.license}
              </Text>

              <Text style={styles.billItem}>
                Total Billed: {bill.totals.totalBilled} UGX
              </Text>
              <Text style={styles.billItem}>
                Total Paid: {bill.totals.totalPaid} UGX
              </Text>
              <Text style={styles.billItem}>
                Outstanding: {bill.totals.totalOutstanding} UGX
              </Text>

              {bill.totals.recoveryFee > 0 && (
                <Text style={styles.billItem}>
                  Recovery Fee: {bill.totals.recoveryFee} UGX
                </Text>
              )}

              <Text style={styles.billTotal}>
                Current Bill: {bill.totals.currentBill} UGX
              </Text>
            </>
          )}
        </View>
      )}

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  captureBtn: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    zIndex: 10,
  },
  captureText: {
    fontSize: 18,
    fontWeight: '700',
  },
  resultBox: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
  },
  resultText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  billBox: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    width: '85%',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    elevation: 5,
  },
  billTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  billItem: {
    fontSize: 16,
    marginVertical: 2,
  },
  billTotal: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '800',
    color: '#b00000',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    fontWeight: '700',
  },
  preview: {
    width: 120,
    height: 120,
    position: 'absolute',
    top: 80,
    right: 20,
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 2,
  },
  loadingBox: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 12,
  },
});
