import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borders } from '../../theme';
import { Button, Input, ScreenHeader } from '../../components';
import { api, ApiError } from '../../services/api';
import { StackScreenProps } from '../../navigation/types';

export const PhotoCaptureScreen: React.FC<StackScreenProps<'PhotoCapture'>> = ({
  navigation,
  route,
}) => {
  const { bookingId, stage } = route.params;
  const [uri, setUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const isBefore = stage === 'before';

  const requestPermission = async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    if (!camera.granted) {
      Alert.alert('Permission needed', 'Camera access is required to capture condition photos.');
    }
    return camera.granted;
  };

  const capture = async () => {
    const granted = await requestPermission();
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setUri(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setUri(result.assets[0].uri);
    }
  };

  const save = async () => {
    if (!uri) return;
    setSaving(true);
    try {
      await api.addEvidence(bookingId, stage, uri, note.trim() || undefined);
      navigation.replace('Handover', { bookingId });
    } catch (e) {
      Alert.alert('Could not save photo', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isBefore ? 'Pre-rental condition' : 'Post-rental condition'}
        subtitle={isBefore ? 'Capture “before” evidence' : 'Capture “after” evidence'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.steps}>
          <StepDone n={1} label="Photos" active={!uri} />
          <StepLine />
          <StepDone n={2} label="Confirm" active={Boolean(uri)} />
        </View>

        {uri ? (
          <View style={styles.preview}>
            <Image source={{ uri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.retake} onPress={capture}>
              <Feather name="camera" size={14} color={colors.primary.main} />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retake} onPress={pickFromLibrary}>
              <Feather name="image" size={14} color={colors.primary.main} />
              <Text style={styles.retakeText}>Change from gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureBox}>
            <View style={styles.captureIcon}>
              <Feather name="camera" size={34} color={colors.primary.main} />
            </View>
            <Text style={styles.captureTitle}>
              {isBefore ? 'Record how it looks before you take it' : 'Record how it looks when you hand it back'}
            </Text>
            <Text style={styles.captureHint}>
              Timestamped and stored with this booking. These photos are the evidence that protects
              your {isBefore ? 'deposit' : 'refund'}.
            </Text>
            <TouchableOpacity style={styles.captureButton} onPress={capture}>
              <Feather name="camera" size={18} color={colors.primary.contrast} />
              <Text style={styles.captureButtonText}>Open camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.libraryButton} onPress={pickFromLibrary}>
              <Text style={styles.libraryText}>Choose from photo library</Text>
            </TouchableOpacity>
          </View>
        )}

        <Input
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder={isBefore ? 'e.g. Minor scuff on the back, nothing else' : 'e.g. Returned in same condition'}
          maxLength={200}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button title="Save evidence" onPress={save} disabled={!uri} loading={saving} />
      </View>
    </View>
  );
};

const StepDone: React.FC<{ n: number; label: string; active?: boolean }> = ({ n, label, active }) => (
  <View style={[styles.step, active && styles.stepActive]}>
    <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>{n}</Text>
    <Text style={styles.stepLabel}>{label}</Text>
  </View>
);

const StepLine = () => <View style={styles.stepLine} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  scroll: { padding: spacing[4], gap: spacing[4], paddingBottom: spacing[8] },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  stepActive: {},
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral.border,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
  },
  stepNumberActive: {
    backgroundColor: colors.primary.main,
    color: colors.primary.contrast,
  },
  stepLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  stepLine: {
    width: 48,
    height: 2,
    backgroundColor: colors.neutral.border,
    marginHorizontal: spacing[3],
  },
  captureBox: {
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    borderStyle: 'dashed',
    padding: spacing[6],
    gap: spacing[2],
  },
  captureIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  captureTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
    textAlign: 'center',
  },
  captureHint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.body * typography.lineHeights.normal,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: borders.radius.md,
    marginTop: spacing[3],
  },
  captureButtonText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.primary.contrast,
  },
  libraryButton: { paddingVertical: spacing[2] },
  libraryText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.primary.main,
  },
  preview: {
    borderRadius: borders.radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral.surface,
  },
  previewImage: {
    width: '100%',
    height: 260,
    backgroundColor: colors.neutral.border,
  },
  retake: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  retakeText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.primary.main,
  },
  bottomBar: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    backgroundColor: colors.neutral.surface,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
});