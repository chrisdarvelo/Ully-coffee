import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Colors, Fonts } from '../utils/constants';
import EmptyState from './EmptyState';

interface SectionRowProps {
  title: string;
  data: any[];
  renderItem: (info: { item: any; index: number }) => React.ReactElement | null;
  keyExtractor: (item: any, index: number) => string;
  onAdd?: () => void;
  actionLabel?: string;
  emptyText?: string;
  emptyDescription?: string;
}

export default function SectionRow({
  title,
  data,
  renderItem,
  keyExtractor,
  onAdd,
  actionLabel,
  emptyText,
  emptyDescription,
}: SectionRowProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onAdd && (
          <TouchableOpacity onPress={onAdd} activeOpacity={0.7} style={styles.addButton}>
            <Text style={styles.addButtonText}>{actionLabel ?? '+'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title={emptyText || 'No entries'}
            description={emptyDescription || 'Tap the plus to add your first.'}
            style={styles.emptyState}
          />
        </View>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: -2,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  emptyContainer: {
    paddingHorizontal: 24,
  },
  emptyState: {
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
});
