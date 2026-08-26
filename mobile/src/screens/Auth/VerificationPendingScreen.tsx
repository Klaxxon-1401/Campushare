import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';
import { Button } from '../../components/ui';

interface VerificationPendingScreenProps {
  navigation: any;
}

export const VerificationPendingScreen: React.FC<VerificationPendingScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⏳</Text>
        </View>

        {/* Headlines */}
        <Text style={styles.headline}>Verification in progress</Text>
        <Text style={styles.subheadline}>
          We're reviewing your student ID. This usually takes {'<'}24h.
        </Text>

        {/* Status Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotCompleted]}>
              <Text style={styles.timelineDotText}>✓</Text>
            </View>
            <Text style={styles.timelineText}>Email verified</Text>
          </View>
          
          <View style={styles.timelineLine} />
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotCurrent]} />
            <Text style={styles.timelineText}>Student ID submitted</Text>
          </View>
          
          <View style={styles.timelineLine} />
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <Text style={styles.timelineText}>Account approved</Text>
          </View>
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>
          You can browse items while waiting for verification.
        </Text>
      </View>

      {/* Action Button */}
      <View style={styles.actions}>
        <Button
          title="Browse Items"
          onPress={() => navigation.navigate('HomeTabs')}
          variant="primary"
          size="large"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
  },
  backArrow: {
    fontSize: typography.sizes.h2,
    color: colors.neutral.textPrimary,
    marginRight: spacing[4],
  },
  headerTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.state.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  icon: {
    fontSize: 32,
  },
  headline: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h3,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subheadline: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[8],
    lineHeight: 20,
  },
  timeline: {
    width: '100%',
    marginBottom: spacing[8],
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  timelineDotCompleted: {
    backgroundColor: colors.accent.main,
  },
  timelineDotCurrent: {
    backgroundColor: colors.primary.main,
  },
  timelineDotText: {
    color: colors.accent.contrast,
    fontSize: typography.sizes.small,
    fontFamily: typography.fonts.bodyBold,
  },
  timelineText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.neutral.border,
    marginLeft: 11,
  },
  infoText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  actions: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
});
