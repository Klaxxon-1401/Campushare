import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../theme';
import { AvailabilityState } from '../types';
import { getMonthMatrix, MONTHS, WEEKDAYS_SHORT, todayISO, addMonths } from '../utils/date';

interface AvailabilityCalendarProps {
  year: number;
  /** 0-based month. */
  month: number;
  /** date (YYYY-MM-DD) -> state, for the visible month. */
  availability: Record<string, AvailabilityState>;
  onChangeMonth: (year: number, month: number) => void;
  /** Provide to enable range selection. */
  onSelectDate?: (iso: string) => void;
  selectionStart?: string | null;
  selectionEnd?: string | null;
  /** Selection cannot start before this date. */
  minDate?: string;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  year,
  month,
  availability,
  onChangeMonth,
  onSelectDate,
  selectionStart,
  selectionEnd,
  minDate,
}) => {
  const weeks = getMonthMatrix(year, month);
  const today = todayISO();
  const selectable = Boolean(onSelectDate);

  const go = (delta: number) => {
    const next = addMonths(year, month, delta);
    onChangeMonth(next.year, next.month);
  };

  const inRange = (iso: string): boolean =>
    Boolean(selectionStart && selectionEnd && iso > selectionStart && iso < selectionEnd);

  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={() => go(-1)} hitSlop={10} style={styles.monthNav}>
          <Feather name="chevron-left" size={20} color={colors.neutral.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity onPress={() => go(1)} hitSlop={10} style={styles.monthNav}>
          <Feather name="chevron-right" size={20} color={colors.neutral.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS_SHORT.map((d, i) => (
          <Text key={`${d}-${i}`} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={week[0].iso} style={styles.weekRow}>
          {week.map((cell) => {
            const state = availability[cell.iso] ?? 'open';
            const isBooked = state !== 'open';
            const isStart = cell.iso === selectionStart;
            const isEnd = cell.iso === selectionEnd || (selectionStart && !selectionEnd && cell.iso === selectionStart);
            const selected = isStart || isEnd;
            const range = inRange(cell.iso);
            const disabled = !cell.inMonth || cell.iso < today || (minDate ? cell.iso < minDate : false);
            const isToday = cell.iso === today;
            const blockedByBooking = selectable && isBooked;

            const pressable = selectable && !disabled && !blockedByBooking;

            return (
              <TouchableOpacity
                key={cell.iso}
                activeOpacity={0.7}
                disabled={!pressable}
                onPress={() => onSelectDate?.(cell.iso)}
                style={[
                  styles.cell,
                  range && styles.cellRange,
                  (selected || isStart) && styles.cellSelected,
                  blockedByBooking && styles.cellBooked,
                  !cell.inMonth && styles.cellOutside,
                ]}
              >
                <Text
                  style={[
                    styles.day,
                    !cell.inMonth && styles.dayOutside,
                    disabled && styles.dayDisabled,
                    (selected || isStart) && styles.daySelected,
                    blockedByBooking && styles.dayBooked,
                  ]}
                >
                  {cell.day}
                </Text>
                {isToday && !selected && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <Legend color={colors.neutral.surface} border label="Available" />
        <Legend color={colors.state.error} label="Booked" />
        <Legend color={colors.neutral.textMuted} label="Unavailable" />
      </View>
    </View>
  );
};

const Legend: React.FC<{ color: string; label: string; border?: boolean }> = ({
  color,
  label,
  border,
}) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendSwatch, { backgroundColor: color }, border && styles.legendBorder]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[3],
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  monthNav: {
    padding: spacing[1],
  },
  monthLabel: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    paddingBottom: spacing[1],
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
    borderRadius: borders.radius.sm,
  },
  cellRange: {
    backgroundColor: colors.accent.muted,
  },
  cellSelected: {
    backgroundColor: colors.primary.main,
  },
  cellBooked: {
    backgroundColor: '#FADBD8',
  },
  cellOutside: {
    opacity: 0.35,
  },
  day: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  dayOutside: {
    color: colors.neutral.textMuted,
  },
  dayDisabled: {
    color: colors.neutral.textMuted,
  },
  daySelected: {
    color: colors.primary.contrast,
    fontFamily: typography.fonts.bodyBold,
  },
  dayBooked: {
    color: colors.state.error,
    textDecorationLine: 'line-through',
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary.main,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[4],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendBorder: {
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
  },
  legendLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
});
